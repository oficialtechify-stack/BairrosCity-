import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Place, UserLocation, DistanceFilter } from '../types';
import { CATEGORY_CONFIG } from '../data/initialPlaces';
import {
  Layers,
  Map as MapIcon,
  Mountain,
  Navigation,
  Plus,
  Minus,
  Check,
  Compass
} from 'lucide-react';

export type MapLayerType = 'roadmap' | 'satellite' | 'terrain';

interface MapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  userLocation: UserLocation | null;
  distanceFilter: DistanceFilter;
  selectingLocation: boolean;
  selectedCoord: { lat: number; lng: number } | null;
  onCoordSelected?: (coord: { lat: number; lng: number }) => void;
  activeLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
  onRequestUserLocation: () => void;
  mapCenterCoord?: { lat: number; lng: number; zoom?: number } | null;
  className?: string;
}

const CATEGORY_SVGS: Record<string, string> = {
  restaurant: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M12 2v20"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  cafe: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 10h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/></svg>`,
  shopping: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  leisure: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7l-3.3-4.4a1 1 0 0 0-1.4 0L9 7.3"/></svg>`,
  event: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg>`,
  nightlife: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 12"/></svg>`,
  services: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h20"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="m4 6 2-4h12l2 4"/></svg>`,
};

export const MapComponent: React.FC<MapProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  userLocation,
  distanceFilter,
  selectingLocation,
  selectedCoord,
  onCoordSelected,
  activeLayer,
  onChangeLayer,
  onRequestUserLocation,
  mapCenterCoord,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const [layersMenuOpen, setLayersMenuOpen] = useState<boolean>(false);

  // Initial center set to Curado / Recife (as displayed in user screenshot)
  const initialCenter: [number, number] = [-8.0645, -34.9855];
  const initialZoom = 14;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false, // We render the authentic Google Maps footer
    });

    // Google Maps Tile Layer
    const tileUrl = getTileUrl(activeLayer);
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer type changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = getTileUrl(activeLayer);
    const newLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  function getTileUrl(layer: MapLayerType): string {
    // Hide commercial business POIs (restaurants, bars, stores, cafes) via Google Tile apistyle (s.t:33 = poi.business)
    // while preserving public POIs: military (government), museums (attractions), stations (transit),
    // UPAs and hospitals (medical), arenas (sports), churches (place of worship), cemeteries, shopping, schools, events
    const filterBusinessStyle = 'apistyle=s.t:33%7Cp.v:off';
    switch (layer) {
      case 'satellite':
        // Google Hybrid Satellite (satellite + road names without commercial businesses)
        return `https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&${filterBusinessStyle}`;
      case 'terrain':
        // Google Terrain
        return `https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&${filterBusinessStyle}`;
      case 'roadmap':
      default:
        // Google Standard Roadmap without commercial businesses
        return `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&${filterBusinessStyle}`;
    }
  }

  // Handle map click when in coordinate picking mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (selectingLocation && onCoordSelected) {
        onCoordSelected({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [selectingLocation, onCoordSelected]);

  // Render picker marker for new place registration
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (selectedCoord) {
      const pickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: #1a73e8; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.3); margin-bottom: 4px; display: flex; align-items: center; gap: 4px; border: 1.5px solid #ffffff;">
              <span>📍 Ponto Selecionado</span>
            </div>
            <div style="width: 24px; height: 24px; background-color: #ea4335; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); animation: bounce 1s infinite alternate;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([selectedCoord.lat, selectedCoord.lng], {
        icon: pickerIcon,
        zIndexOffset: 2000,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const target = e.target as L.Marker;
        const latlng = target.getLatLng();
        if (onCoordSelected) {
          onCoordSelected({ lat: latlng.lat, lng: latlng.lng });
        }
      });

      pickerMarkerRef.current = marker;
      map.flyTo([selectedCoord.lat, selectedCoord.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    }
  }, [selectedCoord, onCoordSelected]);

  // Render User Location & Distance Radius Circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (userLocation) {
      // Custom orange person avatar in white circular badge exactly as in the user's screenshot
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
            <div style="position: absolute; width: 38px; height: 38px; background-color: rgba(245, 158, 11, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 30px; height: 30px; background-color: #ffffff; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; position: relative; z-index: 10;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" stroke-width="0.5">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1500,
      }).addTo(map);

      userMarker.bindTooltip(
        `<div style="font-weight: bold; font-size: 12px; color: #0f172a;">📍 Você está aqui (${userLocation.name || 'Localização GPS'})</div>`,
        { direction: 'top', offset: [0, -18] }
      );

      userMarkerRef.current = userMarker;

      // Smooth fly to user location
      map.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 1.2 });

      // If distance filter is active (> 0 km), draw Google-style radius circle
      if (distanceFilter > 0) {
        const radiusMeters = distanceFilter * 1000;
        const circle = L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusMeters,
          color: '#f59e0b',
          weight: 2,
          opacity: 0.9,
          fillColor: '#f59e0b',
          fillOpacity: 0.08,
          dashArray: '5, 5',
        }).addTo(map);

        radiusCircleRef.current = circle;
      }
    }
  }, [userLocation, distanceFilter]);

  // Render Google Maps Style Markers with adjacent readable labels!
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    const map = mapRef.current;
    if (!markersGroup || !map) return;

    markersGroup.clearLayers();

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const config = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.restaurant;
      const svgIcon = CATEGORY_SVGS[place.category] || CATEGORY_SVGS.restaurant;
      const logoOrPhoto = place.logoUrl || place.imageUrl;
      const hasLogoPhoto = Boolean(logoOrPhoto && (place.isRegisteredCompany || place.ownerId || place.imageUrl));

      // Authentic Google Maps Pin styling with support for Company Logo / Photo Badge:
      const pinHtml = `
        <div style="
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: scale(${isSelected ? 1.25 : 1});
          z-index: ${isSelected ? 1300 : (hasLogoPhoto ? 600 : 300)};
        ">
          <!-- Pin Icon Circle / Company Logo Photo Badge -->
          <div style="
            position: relative;
            width: ${isSelected ? '42px' : (hasLogoPhoto ? '36px' : '28px')};
            height: ${isSelected ? '42px' : (hasLogoPhoto ? '36px' : '28px')};
            min-width: ${isSelected ? '42px' : (hasLogoPhoto ? '36px' : '28px')};
            border-radius: 50%;
            background-color: #ffffff;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35);
            border: 2.5px solid ${isSelected ? '#1a73e8' : (place.isRegisteredCompany ? '#84cc16' : '#ffffff')};
            overflow: hidden;
            ${isSelected ? 'outline: 3px solid #1a73e8; outline-offset: 1px;' : ''}
          ">
            ${hasLogoPhoto ? `
              <img 
                src="${logoOrPhoto}" 
                alt="${place.name}" 
                style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;"
                referrerpolicy="no-referrer"
              />
            ` : `
              <div style="width: 100%; height: 100%; background-color: ${config.color}; display: flex; align-items: center; justify-content: center;">
                ${svgIcon}
              </div>
            `}

            ${place.isRegisteredCompany ? `
              <div style="
                position: absolute;
                bottom: -1px;
                right: -1px;
                width: 13px;
                height: 13px;
                background-color: #84cc16;
                color: #022c22;
                border: 1.5px solid #ffffff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                font-weight: 900;
                line-height: 1;
              " title="Empresa Verificada BairrosCity">
                ✓
              </div>
            ` : ''}
          </div>

          <!-- Label text matching Google Maps vector style with white text-halo -->
          <div style="
            display: flex;
            flex-direction: column;
            pointer-events: auto;
          ">
            <div style="display: flex; items-center; gap: 4px;">
              <span style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-size: 11px;
                font-weight: 700;
                line-height: 1.15;
                color: ${place.isRegisteredCompany ? '#0f172a' : config.labelColor};
                white-space: nowrap;
                text-shadow: 
                  -1.5px -1.5px 0 #ffffff,
                   1.5px -1.5px 0 #ffffff,
                  -1.5px  1.5px 0 #ffffff,
                   1.5px  1.5px 0 #ffffff,
                   0 0 4px #ffffff,
                   0 0 6px #ffffff;
                letter-spacing: -0.01em;
              ">
                ${place.name}
              </span>
              ${place.isRegisteredCompany ? `
                <span style="
                  background: #84cc16;
                  color: #0f172a;
                  font-size: 8px;
                  font-weight: 800;
                  padding: 1px 4px;
                  border-radius: 4px;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                  line-height: 1.2;
                ">BairrosCity</span>
              ` : ''}
            </div>

            ${place.isEvent ? `
              <span style="
                font-size: 9px;
                font-weight: 800;
                color: #7e22ce;
                text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
              ">
                ⭐ EVENTO • ${place.eventDate ? place.eventDate.split('-').slice(1).reverse().join('/') : 'Em Breve'}
              </span>
            ` : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'google-maps-place-pin',
        html: pinHtml,
        iconSize: [180, 42],
        iconAnchor: [18, 21],
      });

      const marker = L.marker([place.lat, place.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : (place.isRegisteredCompany ? 500 : 100),
      });

      marker.on('click', () => {
        onSelectPlace(place);
      });

      // Google Maps style popup tooltip on hover
      marker.bindTooltip(
        `
        <div style="padding: 4px 6px; font-family: sans-serif;">
          <div style="font-weight: 700; font-size: 12px; color: #1a1a1a;">${place.name}</div>
          <div style="font-size: 11px; color: #5f6368; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
            <span style="color: #e37400; font-weight: 700;">★ ${place.rating.toFixed(1)}</span>
            <span>(${place.reviewsCount})</span>
            <span>•</span>
            <span>${place.subCategory}</span>
          </div>
          ${place.isRegisteredCompany ? `
            <div style="font-size: 10px; font-weight: 700; color: #15803d; margin-top: 2px;">
              ✓ Empresa Cadastrada no BairrosCity
            </div>
          ` : ''}
          ${place.distanceKm !== undefined ? `
            <div style="font-size: 10px; font-weight: 600; color: #1a73e8; margin-top: 2px;">
              a ${place.distanceKm < 1 ? Math.round(place.distanceKm * 1000) + ' m' : place.distanceKm.toFixed(1) + ' km'} de distância
            </div>
          ` : ''}
        </div>
        `,
        { direction: 'top', offset: [0, -18], opacity: 0.96 }
      );

      marker.addTo(markersGroup);
    });
  }, [places, selectedPlace, onSelectPlace]);

  // Center map on selected place
  useEffect(() => {
    if (!selectedPlace || !mapRef.current) return;
    mapRef.current.flyTo([selectedPlace.lat, selectedPlace.lng], 16, {
      duration: 0.7,
    });
  }, [selectedPlace]);

  // Center map on explicit coordinate search (neighborhood, address, etc.)
  useEffect(() => {
    if (!mapCenterCoord || !mapRef.current) return;
    mapRef.current.flyTo([mapCenterCoord.lat, mapCenterCoord.lng], mapCenterCoord.zoom || 15, {
      duration: 0.8,
    });
  }, [mapCenterCoord]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Leaflet Map Canvas */}
      <div id="leaflet-map-canvas" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Mode Indicator Overlay when picking location on map */}
      {selectingLocation && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-pulse">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs sm:text-sm font-semibold">
            Clique no mapa para marcar a localização exata da sua empresa ou evento
          </span>
        </div>
      )}

      {/* Bottom-Left: Google Maps "Camadas" (Layers) Thumbnail Box */}
      <div className="absolute bottom-6 left-4 z-[500]">
        <div className="relative">
          {/* Layers Popover Menu */}
          {layersMenuOpen && (
            <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2.5 w-60 z-50 animate-fadeIn">
              <div className="text-xs font-bold text-slate-800 px-2 py-1 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Tipo de Mapa</span>
                <button
                  onClick={() => setLayersMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1">
                {/* Standard Roadmap */}
                <button
                  onClick={() => {
                    onChangeLayer('roadmap');
                    setLayersMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${
                    activeLayer === 'roadmap'
                      ? 'bg-blue-50 border border-blue-500 text-blue-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                    <MapIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Padrão</span>
                </button>

                {/* Satellite Hybrid */}
                <button
                  onClick={() => {
                    onChangeLayer('satellite');
                    setLayersMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${
                    activeLayer === 'satellite'
                      ? 'bg-blue-50 border border-blue-500 text-blue-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-white">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&auto=format&fit=crop&q=60"
                      alt="Satélite"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px]">Satélite</span>
                </button>

                {/* Terrain */}
                <button
                  onClick={() => {
                    onChangeLayer('terrain');
                    setLayersMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${
                    activeLayer === 'terrain'
                      ? 'bg-blue-50 border border-blue-500 text-blue-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <Mountain className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Relevo</span>
                </button>
              </div>
            </div>
          )}

          {/* Square Thumbnail Button (as seen in screenshot bottom-left) */}
          <button
            id="google-maps-layers-btn"
            type="button"
            onClick={() => setLayersMenuOpen((prev) => !prev)}
            className="group relative w-16 h-16 rounded-xl overflow-hidden shadow-lg border-2 border-white hover:border-blue-500 transition-all cursor-pointer bg-slate-800"
            title="Alterar Camadas do Mapa"
          >
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=80"
              alt="Camadas do Mapa"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {/* Dark bottom bar with layers icon and text "Camadas" */}
            <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-xs py-0.5 px-1 flex items-center justify-center gap-1 text-[10px] font-bold text-white tracking-tight">
              <Layers className="w-2.5 h-2.5 text-white" />
              <span>Camadas</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom-Right: Authentic Google Maps Controls */}
      <div className="absolute bottom-6 right-4 z-[500] flex flex-col items-end gap-2.5 select-none">
        {/* Pegman (Yellow Street View Figure) */}
        <button
          type="button"
          onClick={() => {
            if (places.length > 0) {
              const p = places[0];
              window.open(
                `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${p.lat},${p.lng}`,
                '_blank'
              );
            }
          }}
          className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer group"
          title="Street View (Pegman)"
        >
          {/* Yellow Google Pegman Icon */}
          <div className="w-5 h-6 flex flex-col items-center text-amber-500 group-hover:scale-110 transition-transform">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border border-amber-600"></div>
            <div className="w-4 h-3.5 bg-amber-500 rounded-t-sm border border-amber-600 mt-0.5"></div>
          </div>
        </button>

        {/* GPS Geolocation Button */}
        <button
          id="google-maps-gps-btn"
          type="button"
          onClick={onRequestUserLocation}
          className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer text-slate-700 hover:text-blue-600"
          title="Sua Localização Atual"
        >
          <Navigation className="w-4 h-4 fill-slate-500 hover:fill-blue-600" />
        </button>

        {/* Zoom Controls Vertical Pill */}
        <div className="flex flex-col bg-white rounded-lg shadow-md border border-slate-200/90 overflow-hidden">
          <button
            id="google-maps-zoom-in"
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 border-b border-slate-100 transition-colors"
            title="Mais Zoom"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            id="google-maps-zoom-out"
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            title="Menos Zoom"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Google Maps Bottom Center Watermark & Legal Footer */}
      <div className="absolute bottom-0 right-0 left-0 pointer-events-none z-[450] flex items-center justify-between px-3 py-1 bg-gradient-to-t from-white/70 via-white/40 to-transparent text-[10px] text-slate-600 select-none">
        {/* Left: Google watermark */}
        <div className="flex items-center gap-1.5 pl-24">
          <span className="font-bold text-slate-700 text-xs tracking-tight">Google</span>
        </div>

        {/* Right: Scale & copyright info */}
        <div className="flex items-center gap-2 pr-2 text-[10px] text-slate-600 bg-white/80 px-2 py-0.5 rounded backdrop-blur-xs">
          <span>Dados do mapa ©2026</span>
          <span className="hidden sm:inline">Brasil</span>
          <span className="hidden sm:inline">Termos</span>
          <span className="hidden sm:inline">Privacidade</span>
          <div className="flex items-center gap-1 pl-1 border-l border-slate-300 font-mono">
            <span>200 m</span>
            <div className="w-8 h-1.5 border-b border-l border-r border-slate-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
