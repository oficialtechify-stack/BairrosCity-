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
  Compass,
  Moon
} from 'lucide-react';
import { StreetViewThumbnail } from './StreetViewThumbnail';
import { StreetViewNode } from '../data/streetViewData';

export type MapLayerType = 'roadmap' | 'satellite' | 'terrain' | 'dark';

interface MapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  userLocation: UserLocation | null;
  distanceFilter: DistanceFilter;
  selectingLocation: boolean;
  selectedCoord: { lat: number; lng: number } | null;
  onCoordSelected?: (coord: { lat: number; lng: number }) => void;
  pickedPlaceInfo?: { name?: string; logoUrl?: string; imageUrl?: string; category?: string } | null;
  activeLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
  onRequestUserLocation: () => void;
  mapCenterCoord?: { lat: number; lng: number; zoom?: number } | null;
  className?: string;
  // Real-time tracking and navigation props
  markerStyle?: 'arrow' | 'pegman';
  onToggleMarkerStyle?: () => void;
  isTracking?: boolean;
  isFollowing?: boolean;
  onDragMap?: () => void;
  onDirectionsClick?: () => void;
  // Street View props
  onOpenStreetView?: () => void;
  streetViewActive?: boolean;
  streetViewNode?: StreetViewNode;
  streetViewHeading?: number;
  deviceHeading?: number | null;
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
  pickedPlaceInfo,
  activeLayer,
  onChangeLayer,
  onRequestUserLocation,
  mapCenterCoord,
  className = '',
  markerStyle = 'arrow',
  onToggleMarkerStyle,
  isTracking = false,
  isFollowing = false,
  onDragMap,
  onDirectionsClick,
  onOpenStreetView,
  streetViewActive = false,
  streetViewNode,
  streetViewHeading,
  deviceHeading,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const hasInitialCenteredRef = useRef<boolean>(false);
  const prevTargetCoordRef = useRef<{ lat: number; lng: number } | null>(null);
  const prevMarkerStyleRef = useRef<'arrow' | 'pegman'>('arrow');
  const lastPanTimeRef = useRef<number>(0);
  const isUserInteractingRef = useRef<boolean>(false);
  const [layersMenuOpen, setLayersMenuOpen] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Initial center set to Curado / Recife (as displayed in user screenshot)
  const initialCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [-8.0645, -34.9855];
  const initialZoom = 16;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false, // Authentic Google Maps interface
    });

    // Detect user manual dragging, touches, pinches and scrolling to instantly pause auto-follow
    const stopFollowing = () => {
      isUserInteractingRef.current = true;
      onDragMap?.();
    };

    const resumeInteraction = () => {
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 400);
    };

    map.on('dragstart', stopFollowing);
    map.on('movestart', (e: any) => {
      if (e.originalEvent) {
        stopFollowing();
      }
    });
    map.on('zoomstart', (e: any) => {
      if (e.originalEvent) {
        stopFollowing();
      }
    });
    map.on('touchstart', stopFollowing);

    map.on('dragend', resumeInteraction);
    map.on('moveend', (e: any) => {
      if (e.originalEvent) {
        resumeInteraction();
      }
    });
    map.on('touchend', resumeInteraction);

    const container = mapContainerRef.current;
    if (container) {
      container.addEventListener('pointerdown', stopFollowing, { passive: true });
      container.addEventListener('touchstart', stopFollowing, { passive: true });
      container.addEventListener('wheel', stopFollowing, { passive: true });
      container.addEventListener('pointerup', resumeInteraction, { passive: true });
      container.addEventListener('touchend', resumeInteraction, { passive: true });
    }

    // Tile Layer
    const { url, subdomains } = getTileConfig(activeLayer);
    const tileLayer = L.tileLayer(url, {
      maxZoom: 20,
      subdomains,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapRef.current = map;
    setMapReady(true);

    return () => {
      if (container) {
        container.removeEventListener('pointerdown', stopFollowing);
        container.removeEventListener('touchstart', stopFollowing);
        container.removeEventListener('wheel', stopFollowing);
        container.removeEventListener('pointerup', resumeInteraction);
        container.removeEventListener('touchend', resumeInteraction);
      }
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update Tile Layer when layer type changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const { url, subdomains } = getTileConfig(activeLayer);
    const newLayer = L.tileLayer(url, {
      maxZoom: 20,
      subdomains,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  function getTileConfig(layer: MapLayerType): { url: string; subdomains: string[] } {
    const filterBusinessStyle = 'apistyle=s.t:33%7Cp.v:off';
    switch (layer) {
      case 'dark':
        // High quality dark theme matching Google Maps dark mode in user screenshots 2, 4, 5
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c', 'd'],
        };
      case 'satellite':
        // Google Hybrid Satellite
        return {
          url: `https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&${filterBusinessStyle}`,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        };
      case 'terrain':
        // Google Terrain
        return {
          url: `https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&${filterBusinessStyle}`,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        };
      case 'roadmap':
      default:
        // Google Standard Roadmap
        return {
          url: `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&${filterBusinessStyle}`,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        };
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

  // Render picker marker for new place registration with Company Logo and Name
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (selectedCoord) {
      // Resolve establishment name and logo photo from props or local draft
      const effectiveInfo = (() => {
        if (pickedPlaceInfo?.name || pickedPlaceInfo?.logoUrl) {
          return {
            name: pickedPlaceInfo.name || 'Seu Estabelecimento',
            logoUrl: pickedPlaceInfo.logoUrl || pickedPlaceInfo.imageUrl || '',
            category: pickedPlaceInfo.category || 'restaurant',
          };
        }
        try {
          const rawCompany = localStorage.getItem('bairromap_company_reg_draft_v2');
          if (rawCompany) {
            const d = JSON.parse(rawCompany);
            if (d.regName || d.regLogoUrl || d.regImageUrl) {
              return {
                name: d.regName || 'Sua Empresa',
                logoUrl: d.regLogoUrl || d.regImageUrl || '',
                category: d.regCategory || 'restaurant',
              };
            }
          }
          const rawEvent = localStorage.getItem('bairromap_event_reg_draft_v1');
          if (rawEvent) {
            const ed = JSON.parse(rawEvent);
            if (ed.name || ed.imageUrl) {
              return {
                name: ed.name || 'Seu Evento',
                logoUrl: ed.imageUrl || '',
                category: 'event',
              };
            }
          }
        } catch (e) {}

        return {
          name: 'Seu Estabelecimento',
          logoUrl: '',
          category: 'restaurant',
        };
      })();

      const displayName = effectiveInfo.name || 'Seu Estabelecimento';
      const displayLogo = effectiveInfo.logoUrl || '';

      const pickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab; z-index: 2500;">
            <!-- Badge Superior: Nome da Empresa com Mini Avatar / Ícone -->
            <div style="
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: #ffffff;
              padding: 5px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 800;
              white-space: nowrap;
              box-shadow: 0 6px 20px rgba(0,0,0,0.5);
              margin-bottom: 6px;
              display: flex;
              align-items: center;
              gap: 7px;
              border: 2px solid #38bdf8;
              max-width: 250px;
              letter-spacing: -0.01em;
            ">
              ${displayLogo ? `
                <img 
                  src="${displayLogo}" 
                  alt="${displayName}" 
                  style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; border: 1.5px solid #ffffff; flex-shrink: 0;"
                  referrerpolicy="no-referrer"
                />
              ` : `
                <span style="font-size: 13px;">📍</span>
              `}
              
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; color: #ffffff;">
                ${displayName}
              </span>
              
              <span style="background-color: #84cc16; color: #0f172a; font-size: 9px; font-weight: 900; padding: 1px 6px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0;">
                Marcado
              </span>
            </div>

            <!-- Cabeça do Pin: Foto da Logo do Estabelecimento em Alta Resolução -->
            <div style="
              position: relative;
              width: 52px;
              height: 52px;
              border-radius: 50%;
              background-color: #ffffff;
              border: 3.5px solid #ffffff;
              box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 0 3.5px #1a73e8;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: bounce 1.2s infinite alternate;
            ">
              ${displayLogo ? `
                <img 
                  src="${displayLogo}" 
                  alt="${displayName}" 
                  style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;"
                  referrerpolicy="no-referrer"
                />
              ` : `
                <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1e40af, #2563eb); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
              `}

              <!-- Selo de verificado no canto -->
              <div style="
                position: absolute;
                bottom: 0px;
                right: 0px;
                width: 16px;
                height: 16px;
                background-color: #84cc16;
                border: 2px solid #ffffff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0f172a;
                font-size: 8.5px;
                font-weight: 900;
                z-index: 10;
              ">✓</div>
            </div>

            <!-- Seta / Ponteiro apontando para as coordenadas exatas -->
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 12px solid #1a73e8;
              margin-top: -1px;
              filter: drop-shadow(0 3px 3px rgba(0,0,0,0.35));
            "></div>
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
      map.flyTo([selectedCoord.lat, selectedCoord.lng], Math.max(map.getZoom(), 16), {
        duration: 0.6,
      });
    }
  }, [selectedCoord, onCoordSelected, pickedPlaceInfo]);

  // Generate User Marker HTML based on style (Ponto Azul com Feixe/Seta or Bonequinho Pegman)
  const getUserMarkerHtml = (heading: number, style: 'arrow' | 'pegman') => {
    if (style === 'pegman') {
      // Authentic Street View Pegman character standing on rotating compass base
      return `
        <div style="position: relative; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
          <!-- Compass directional platform -->
          <div id="gmaps-user-heading-cone" style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.95); border: 2.5px solid #ea4335; box-shadow: 0 4px 12px rgba(0,0,0,0.4); transform: rotate(${heading}deg); transition: transform 0.2s ease-out; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; top: -7px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid #ea4335;"></div>
          </div>
          <!-- 3D Pegman Figurine -->
          <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; transform: translateY(-5px);">
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #fbbc04; border: 1.5px solid #d97706; box-shadow: 0 1px 4px rgba(0,0,0,0.25);"></div>
            <div style="width: 18px; height: 16px; border-radius: 4px 4px 2px 2px; background-color: #f59e0b; border: 1.5px solid #b45309; margin-top: 1px;"></div>
            <div style="display: flex; gap: 2px;">
              <div style="width: 5px; height: 9px; background-color: #d97706; border-radius: 0 0 2px 2px;"></div>
              <div style="width: 5px; height: 9px; background-color: #b45309; border-radius: 0 0 2px 2px;"></div>
            </div>
          </div>
        </div>
      `;
    }

    // Authentic Google Maps Blue Dot with Heading Beam (Seta/Feixe de visão)
    return `
      <div style="position: relative; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <!-- Direction Beam / Seta - rotates with user heading -->
        <div id="gmaps-user-heading-cone" style="position: absolute; width: 68px; height: 68px; pointer-events: none; transform: rotate(${heading}deg); transform-origin: center center; transition: transform 0.2s ease-out; display: flex; align-items: center; justify-content: center;">
          <svg width="68" height="68" viewBox="0 0 68 68" style="overflow: visible;">
            <defs>
              <radialGradient id="beamGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#1a73e8" stop-opacity="0.65"/>
                <stop offset="60%" stop-color="#4285f4" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#8ab4f8" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <!-- 60-degree directional cone beam -->
            <path d="M 34 34 L 14 6 A 38 38 0 0 1 54 6 Z" fill="url(#beamGrad)" />
            <!-- Directional arrow pointer on front -->
            <polygon points="34,8 39,19 34,15 29,19" fill="#1a73e8" stroke="#ffffff" stroke-width="1.5" />
          </svg>
        </div>

        <!-- Radiating Pulse Radio Wave -->
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(26, 115, 232, 0.35); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>

        <!-- Core Google Maps Glowing Blue Dot with Crisp White Border -->
        <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #1a73e8; border: 3.5px solid #ffffff; box-shadow: 0 0 14px rgba(26, 115, 232, 0.9), 0 3px 8px rgba(0,0,0,0.45); z-index: 10;"></div>
      </div>
    `;
  };

  // Real-Time Smooth Marker Updates (moves fluidly as user walks without re-mounting)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // In Street View mode, synchronize the marker to the Street View position & heading!
    const targetLat = streetViewActive && streetViewNode ? streetViewNode.lat : userLocation?.lat;
    const targetLng = streetViewActive && streetViewNode ? streetViewNode.lng : userLocation?.lng;

    if (targetLat === undefined || targetLng === undefined) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
        radiusCircleRef.current = null;
      }
      return;
    }

    const heading = streetViewActive && streetViewHeading !== undefined
      ? streetViewHeading
      : ((deviceHeading !== undefined && deviceHeading !== null) ? deviceHeading : (userLocation?.heading ?? 0));

    // Create or update Marker with precise centering
    const icon = L.divIcon({
      className: '!bg-transparent !border-0 !shadow-none !overflow-visible cursor-pointer gmaps-user-marker-smooth',
      html: getUserMarkerHtml(heading, markerStyle === 'pegman' ? 'pegman' : 'arrow'),
      iconSize: [68, 68],
      iconAnchor: [34, 34],
    });

    if (!userMarkerRef.current) {
      const marker = L.marker([targetLat, targetLng], {
        icon,
        zIndexOffset: 3000,
      }).addTo(map);

      marker.bindTooltip(
        `<div style="font-weight: bold; font-size: 12px; color: #0f172a;">📍 ${streetViewActive ? 'Street View 360°' : 'Você está aqui (Toque para Street View)'}</div>`,
        { direction: 'top', offset: [0, -22] }
      );

      marker.on('click', () => {
        onOpenStreetView?.();
      });

      userMarkerRef.current = marker;
      prevMarkerStyleRef.current = markerStyle;

      // Only center ONCE on initial marker mount if not already centered
      if (!hasInitialCenteredRef.current) {
        hasInitialCenteredRef.current = true;
        map.setView([targetLat, targetLng], Math.max(map.getZoom(), 16), {
          animate: true,
        });
      }
      prevTargetCoordRef.current = { lat: targetLat, lng: targetLng };
    } else {
      // Smooth update position without destroying marker DOM element
      userMarkerRef.current.setLatLng([targetLat, targetLng]);

      // Only rebuild icon if markerStyle toggled (arrow <-> pegman)
      if (prevMarkerStyleRef.current !== markerStyle) {
        prevMarkerStyleRef.current = markerStyle;
        userMarkerRef.current.setIcon(icon);
      } else {
        // Just rotate the cone smoothly in CSS without destroying DOM
        const coneEl = document.getElementById('gmaps-user-heading-cone');
        if (coneEl) {
          coneEl.style.transform = `rotate(${heading}deg)`;
        }
      }

      // Check camera auto-follow: NEVER fight user touch/drag
      const now = Date.now();
      if (streetViewActive) {
        map.panTo([targetLat, targetLng], {
          animate: true,
          duration: 0.5,
        });
      } else if (isFollowing && !isUserInteractingRef.current && (now - lastPanTimeRef.current > 2500)) {
        // Only pan if user has moved noticeably from current map center (> 30 meters)
        const center = map.getCenter();
        const distMeters = center.distanceTo([targetLat, targetLng]);
        if (distMeters > 30) {
          lastPanTimeRef.current = now;
          map.panTo([targetLat, targetLng], {
            animate: true,
            duration: 0.8,
            easeLinearity: 0.25,
          });
        }
      }
    }

    // Accuracy Circle / Distance Radius
    if (userLocation && !streetViewActive) {
      const accuracyRadius = distanceFilter > 0 ? distanceFilter * 1000 : Math.max(userLocation.accuracy || 18, 15);

      if (!radiusCircleRef.current) {
        const circle = L.circle([targetLat, targetLng], {
          radius: accuracyRadius,
          color: '#1a73e8',
          weight: 1.5,
          opacity: 0.4,
          fillColor: '#1a73e8',
          fillOpacity: 0.06,
          dashArray: distanceFilter > 0 ? '5, 5' : undefined,
        }).addTo(map);
        radiusCircleRef.current = circle;
      } else {
        radiusCircleRef.current.setLatLng([targetLat, targetLng]);
        radiusCircleRef.current.setRadius(accuracyRadius);
      }
    } else if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }
  }, [mapReady, userLocation, markerStyle, isFollowing, distanceFilter, streetViewActive, streetViewNode, streetViewHeading, deviceHeading]);

  // Render Google Maps Style Place Pins
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
      const hasLogoPhoto = Boolean(logoOrPhoto);

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
            width: ${isSelected ? '44px' : (hasLogoPhoto ? '38px' : '28px')};
            height: ${isSelected ? '44px' : (hasLogoPhoto ? '38px' : '28px')};
            min-width: ${isSelected ? '44px' : (hasLogoPhoto ? '38px' : '28px')};
            border-radius: 50%;
            background-color: #ffffff;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.38);
            border: 2.5px solid ${isSelected ? '#1a73e8' : (place.isRegisteredCompany ? '#84cc16' : '#ffffff')};
            overflow: hidden;
            ${isSelected ? 'outline: 3px solid #1a73e8; outline-offset: 2px;' : ''}
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
                border: 1.5px solid #ffffff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0f172a;
                font-size: 8px;
                font-weight: 900;
              ">✓</div>
            ` : ''}
          </div>

          <!-- Pin Label with Company Name -->
          <div style="
            background-color: ${isSelected ? '#1a73e8' : 'rgba(15, 23, 42, 0.92)'};
            backdrop-filter: blur(6px);
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 7px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            border: 1px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.25)'};
            pointer-events: auto;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            letter-spacing: -0.01em;
          ">
            ${place.name}
          </div>
        </div>
      `;

      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: 'google-place-pin',
          html: pinHtml,
          iconSize: [0, 0],
          iconAnchor: [16, 16],
        }),
        zIndexOffset: isSelected ? 1200 : (place.isRegisteredCompany ? 500 : 100),
      }).addTo(markersGroup);

      const popupHtml = `
        <div style="font-family: inherit; width: 220px; padding: 4px; color: #0f172a;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            ${hasLogoPhoto ? `
              <img 
                src="${logoOrPhoto}" 
                alt="${place.name}" 
                style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 1.5px solid #e2e8f0; flex-shrink: 0;"
                referrerpolicy="no-referrer"
              />
            ` : `
              <div style="width: 44px; height: 44px; border-radius: 10px; background-color: ${config.color}; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;">
                ${svgIcon}
              </div>
            `}
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 800; font-size: 13px; line-height: 1.2; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${place.name}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                ${place.subCategory || config.name}
              </div>
              <div style="font-size: 10px; font-weight: 700; color: #16a34a; margin-top: 2px;">
                ⭐ ${place.rating || 5.0} • ${place.neighborhood || 'Bairro'}
              </div>
            </div>
          </div>
          ${place.address ? `
            <div style="font-size: 11px; color: #64748b; line-height: 1.3; margin-bottom: 6px;">
              📍 ${place.address}
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260, offset: [0, -14] });

      marker.on('click', () => {
        onSelectPlace(place);
      });
    });
  }, [places, selectedPlace, onSelectPlace]);

  // Smooth Fly to mapCenterCoord when requested
  useEffect(() => {
    if (!mapRef.current || !mapCenterCoord) return;
    mapRef.current.flyTo([mapCenterCoord.lat, mapCenterCoord.lng], mapCenterCoord.zoom || 16, {
      duration: 1.0,
      easeLinearity: 0.25,
    });
  }, [mapCenterCoord]);

  // Zoom Controls
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  // Reset North rotation (compass click)
  const handleCompassClick = () => {
    if (mapRef.current) {
      if (userLocation) {
        mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 0.8 });
      } else {
        mapRef.current.flyTo(initialCenter, initialZoom, { duration: 0.8 });
      }
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" />

      {/* Floating Selection Banner when Picking Location */}
      {selectingLocation && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] px-4 py-2.5 rounded-full bg-slate-900/95 text-white shadow-2xl border border-lime-400 flex items-center gap-2.5 backdrop-blur-md max-w-[92vw]">
          {pickedPlaceInfo?.logoUrl ? (
            <img
              src={pickedPlaceInfo.logoUrl}
              alt="Logo"
              className="w-6 h-6 rounded-full object-cover border border-white shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-3 h-3 rounded-full bg-lime-400 animate-ping shrink-0" />
          )}
          <span className="text-xs font-bold truncate">
            {pickedPlaceInfo?.name ? (
              <span>Toque no mapa para posicionar <strong className="text-lime-300">{pickedPlaceInfo.name}</strong></span>
            ) : (
              <span>Toque no mapa para marcar o local exato da empresa</span>
            )}
          </span>
        </div>
      )}

      {/* FLOATING ACTION STACK (Right Side, exactly matching Google Maps mobile in screenshots 2, 4, 5) */}
      <div className="absolute top-24 sm:top-28 right-3 sm:right-4 z-[450] flex flex-col items-center gap-2 select-none">
        {/* 1. Layers Switcher Button (Stacked Squares with +) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLayersMenuOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-lg border border-slate-700/80 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            title="Camadas do Mapa"
          >
            <Layers className="w-5 h-5 text-slate-200" />
          </button>

          {/* Layers Popover Menu */}
          {layersMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700/90 p-3 z-[600] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">Tipo de Mapa</span>
                <button
                  type="button"
                  onClick={() => setLayersMenuOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Modo Noturno (Escuro Google Maps) */}
                <button
                  type="button"
                  onClick={() => {
                    onChangeLayer('dark');
                    setLayersMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all ${
                    activeLayer === 'dark'
                      ? 'bg-blue-600/30 border border-blue-400 text-white font-bold'
                      : 'bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-blue-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Noturno</span>
                </button>

                {/* Google Padrão */}
                <button
                  type="button"
                  onClick={() => {
                    onChangeLayer('roadmap');
                    setLayersMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all ${
                    activeLayer === 'roadmap'
                      ? 'bg-blue-600/30 border border-blue-400 text-white font-bold'
                      : 'bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800">
                    <MapIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Padrão</span>
                </button>

                {/* Satélite */}
                <button
                  type="button"
                  onClick={() => {
                    onChangeLayer('satellite');
                    setLayersMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all ${
                    activeLayer === 'satellite'
                      ? 'bg-blue-600/30 border border-blue-400 text-white font-bold'
                      : 'bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Satélite</span>
                </button>

                {/* Relevo */}
                <button
                  type="button"
                  onClick={() => {
                    onChangeLayer('terrain');
                    setLayersMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all ${
                    activeLayer === 'terrain'
                      ? 'bg-blue-600/30 border border-blue-400 text-white font-bold'
                      : 'bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400">
                    <Mountain className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Relevo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Compass Needle Button (Red/White Needle pointing North) */}
        <button
          type="button"
          onClick={handleCompassClick}
          className="w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-lg border border-slate-700/80 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 cursor-pointer backdrop-blur-md group"
          title="Apontar para o Norte"
        >
          <div className="w-6 h-6 flex items-center justify-center relative">
            {/* Compass Red/White Needle */}
            <div className="w-1.5 h-5 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[8px] border-b-rose-500"></div>
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[8px] border-t-white"></div>
            </div>
          </div>
        </button>

        {/* 3. Street View Pegman Button */}
        <button
          type="button"
          onClick={() => {
            if (onOpenStreetView) {
              onOpenStreetView();
            } else if (onToggleMarkerStyle) {
              onToggleMarkerStyle();
            }
          }}
          className="w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-lg border border-slate-700/80 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 cursor-pointer backdrop-blur-md group"
          title="Street View 360° (Explorar as ruas)"
        >
          {/* Authentic Google Pegman Figurine */}
          <div className="w-4 h-5 flex flex-col items-center group-hover:scale-110 transition-transform">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="w-3 h-2.5 bg-amber-500 rounded-xs mt-0.5"></div>
          </div>
        </button>

        {/* 4. Google Maps Real-Time GPS Follow Button (Target Crosshair with Blue Dot) */}
        <button
          id="google-maps-gps-btn"
          type="button"
          onClick={onRequestUserLocation}
          className={`w-11 h-11 rounded-full shadow-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-md ${
            isTracking && isFollowing
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/40 ring-4 ring-blue-500/20'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800'
          }`}
          title="Minha Posição em Tempo Real (Seguir no Mapa)"
        >
          <div className="relative flex items-center justify-center">
            <Navigation className={`w-5 h-5 ${isTracking && isFollowing ? 'fill-white text-white' : 'text-slate-300'}`} />
            {isTracking && isFollowing && (
              <div className="absolute w-2 h-2 rounded-full bg-lime-400 -top-1 -right-1 animate-ping"></div>
            )}
          </div>
        </button>

        {/* 6. Directions / Rotas Button (Cyan / Teal Rounded Square with Arrow, matching Google Maps) */}
        <button
          type="button"
          onClick={() => {
            if (onDirectionsClick) {
              onDirectionsClick();
            } else if (selectedPlace) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`;
              window.open(url, '_blank');
            } else {
              const url = `https://www.google.com/maps/dir/?api=1&destination=-8.0645,-34.9855`;
              window.open(url, '_blank');
            }
          }}
          className="w-12 h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer mt-1 font-bold group"
          title="Rotas e Direções"
        >
          <div className="w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </div>
        </button>

        {/* Zoom Controls (hidden on small mobile screens to keep canvas fluid and uncluttered) */}
        <div className="hidden sm:flex flex-col bg-slate-900/90 text-white rounded-xl shadow-lg border border-slate-700/80 overflow-hidden backdrop-blur-md mt-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-8 flex items-center justify-center text-slate-200 hover:bg-slate-800 border-b border-slate-800 transition-colors cursor-pointer"
            title="Mais Zoom"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-8 flex items-center justify-center text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Menos Zoom"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Google Maps Street View 360 Floating Thumbnail (Image 2) */}
      {onOpenStreetView && !streetViewActive && streetViewNode && (
        <StreetViewThumbnail
          currentNode={streetViewNode}
          onOpenStreetView={onOpenStreetView}
          className="absolute bottom-20 sm:bottom-6 left-3 sm:left-4"
        />
      )}

      {/* Google Maps Bottom Center Watermark & Legal Footer */}
      <div className="absolute bottom-16 sm:bottom-2 right-0 left-0 pointer-events-none z-[400] flex items-center justify-between px-3 py-1 bg-gradient-to-t from-slate-950/40 to-transparent text-[10px] text-slate-300 select-none">
        <div className="flex items-center gap-1.5 pl-3">
          <span className="font-bold text-slate-200 text-xs tracking-tight">Google</span>
        </div>
        <div className="flex items-center gap-2 pr-2 text-[10px] text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-xs">
          <span>Dados do mapa ©2026</span>
          <span className="hidden sm:inline">Curado IV & Recife</span>
        </div>
      </div>
    </div>
  );
};
