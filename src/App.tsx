import React, { useState, useEffect, useMemo } from 'react';
import { Place, CategoryType, DistanceFilter, DateFilter, UserLocation, Review, UserProfile } from './types';
import { calculateDistance } from './utils/distance';
import { MapComponent, MapLayerType } from './components/Map';
import { GoogleMapsRail } from './components/GoogleMapsRail';
import { GoogleMapsTopBar } from './components/GoogleMapsTopBar';
import { GooglePlacePanel } from './components/GooglePlacePanel';
import { GoogleMapsMenuDrawer } from './components/GoogleMapsMenuDrawer';
import { RegisterModal } from './components/RegisterModal';
import { LandingPage } from './components/LandingPage';
import { BairrosCity } from './components/BairrosCity';
import { AuthModal } from './components/AuthModal';
import { CompanyManagerModal } from './components/CompanyManagerModal';
import { ResidentProfileModal } from './components/ResidentProfileModal';
import { LoginGate } from './components/LoginGate';
import { GoogleMapsMobileNav } from './components/GoogleMapsMobileNav';
import { useRealtimeLocation } from './hooks/useRealtimeLocation';
import { subscribePlaces, createPlaceInFirestore, addReviewToFirestore } from './services/placesService';
import { auth, db, signOut, onAuthStateChanged, getDoc, doc } from './lib/firebase';
import { loginWithGoogle } from './services/authService';
import { Home, Users, MapPin, Plus, Navigation, LogIn, CheckCircle2, LogOut } from 'lucide-react';
import { StreetViewViewer } from './components/StreetViewViewer';
import {
  StreetViewNode,
  DEFAULT_STREET_VIEW_NODE,
  getStreetViewNodeForLocation,
} from './data/streetViewData';

export default function App() {
  // Navigation view: 'home' (Landing page), 'map' (Google Maps view), 'bairroscity' (Bairro community feed)
  // Default to 'map' so user immediately sees their location and Street View on Google Maps!
  const [currentView, setCurrentView] = useState<'home' | 'map' | 'bairroscity'>('map');
  const [bairrosInitialNeighborhood, setBairrosInitialNeighborhood] = useState<string>('Curado IV');

  // Google Maps Street View State
  const [isStreetViewOpen, setIsStreetViewOpen] = useState<boolean>(false);
  const [streetViewMode, setStreetViewMode] = useState<'split' | 'fullscreen'>('split');
  const [currentStreetNode, setCurrentStreetNode] = useState<StreetViewNode>(DEFAULT_STREET_VIEW_NODE);
  const [streetViewHeading, setStreetViewHeading] = useState<number>(DEFAULT_STREET_VIEW_NODE.initialHeading);

  // Real-time Firestore places state (only real registered companies appear on the map)
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(true);

  // Saved bookmark IDs
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bairroscity_saved_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current logged in user (from localStorage / Firebase Auth)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bairromap_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Selection & UI states for Map
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState<boolean>(false);
  const [isResidentProfileOpen, setIsResidentProfileOpen] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('roadmap');

  // Locate the place owned by the current company user if logged in
  const userCompanyPlace = useMemo(() => {
    if (!currentUser) return null;
    return (
      places.find(
        (p) =>
          (p.ownerId && p.ownerId === currentUser.id) ||
          (currentUser.email && p.ownerEmail === currentUser.email) ||
          (currentUser.companyName &&
            p.name.toLowerCase().trim() === currentUser.companyName.toLowerCase().trim())
      ) || null
    );
  }, [places, currentUser]);

  // Coordinate picking on map for business registration
  const [selectingLocation, setSelectingLocation] = useState<boolean>(false);
  const [pickedCoord, setPickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [pickingForTarget, setPickingForTarget] = useState<'register' | 'companyManager'>('register');

  // Real-time GPS User Location & Walking Tracker
  const {
    userLocation,
    isTracking,
    isFollowing,
    setIsFollowing,
    markerStyle,
    setMarkerStyle,
    recenter,
    setUserLocation,
  } = useRealtimeLocation();

  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsToast, setGpsToast] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSavedOnly, setFilterSavedOnly] = useState<boolean>(false);
  const [mapCenterCoord, setMapCenterCoord] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Subscribe to Firebase Firestore places
  useEffect(() => {
    const unsubscribe = subscribePlaces((firestorePlaces) => {
      // Only real registered companies from Firestore are shown on the map
      setPlaces(firestorePlaces);
      setLoadingPlaces(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firebase Auth state for automatic Google user session restoration
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setCurrentUser(profile);
            localStorage.setItem('bairromap_user', JSON.stringify(profile));
          }
        } catch (err) {
          console.warn('Could not sync user profile from Firestore:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Direct 1-click Google Login flow - takes the user straight to the site
  const handleGoogleDirectLogin = async (roleOverride?: 'morador' | 'empresa') => {
    try {
      const profile = await loginWithGoogle(roleOverride);
      setCurrentUser(profile);
      setCurrentView('map');
      if (profile.role === 'empresa') {
        setIsCompanyManagerOpen(true);
        setGpsToast(`Conectado como ${profile.name}! Abrindo painel da empresa.`);
      } else {
        setGpsToast(`Conectado como ${profile.name}! Entrou no site.`);
      }
      setTimeout(() => setGpsToast(null), 3500);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        alert('Erro ao conectar com Google: ' + (err?.message || 'Tente novamente'));
      }
    }
  };

  // Persist saved IDs
  useEffect(() => {
    try {
      localStorage.setItem('bairroscity_saved_ids', JSON.stringify(savedPlaceIds));
    } catch (e) {
      console.error('Failed to save bookmarks', e);
    }
  }, [savedPlaceIds]);

  // Request real browser GPS location with continuous real-time movement tracking
  const handleRequestLocation = () => {
    recenter();
    if (userLocation) {
      setMapCenterCoord({ lat: userLocation.lat, lng: userLocation.lng, zoom: 17 });
    }
    setCurrentView('map');
    setGpsToast('Localização centralizada!');
    setTimeout(() => setGpsToast(null), 3500);
  };

  // Distance filter change
  const handleDistanceChange = (dist: DistanceFilter) => {
    setDistanceFilter(dist);
    if (dist > 0 && !userLocation) {
      handleRequestLocation();
    }
  };

  // Toggle favorite bookmark
  const handleToggleSavePlace = (placeId: string) => {
    setSavedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  // Add review to a place via Firestore
  const handleAddReview = async (placeId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    const reviewObj: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.name || newReview.author || 'Morador Local',
      userRole: currentUser?.role === 'empresa' ? 'Empresa' : 'Morador do Bairro',
    };

    try {
      await addReviewToFirestore(placeId, reviewObj);
    } catch (err) {
      console.error('Failed to add review to Firestore', err);
      // Fallback local update
      setPlaces((prev) =>
        prev.map((p) => {
          if (p.id !== placeId) return p;
          const updatedReviews = [reviewObj, ...p.reviews];
          const sumRatings = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const newAvg = Number((sumRatings / updatedReviews.length).toFixed(1));
          const updatedPlace: Place = {
            ...p,
            rating: newAvg,
            reviewsCount: updatedReviews.length,
            reviews: updatedReviews,
          };
          if (selectedPlace?.id === placeId) setSelectedPlace(updatedPlace);
          return updatedPlace;
        })
      );
    }
  };

  // Register new business or event in Firestore
  const handleSavePlace = async (
    newPlaceData: Omit<Place, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt'>
  ) => {
    try {
      const createdId = await createPlaceInFirestore({
        ...newPlaceData,
        ownerId: currentUser?.id,
        ownerName: currentUser?.name,
        ownerEmail: currentUser?.email,
      });

      const newPlaceObj: Place = {
        ...newPlaceData,
        id: createdId,
        rating: 5.0,
        reviewsCount: 1,
        reviews: [],
        createdAt: new Date().toISOString(),
      };

      setPlaces((prev) => [newPlaceObj, ...prev.filter((p) => p.id !== createdId)]);
      setSelectedPlace(newPlaceObj);
      setMapCenterCoord({ lat: newPlaceObj.lat, lng: newPlaceObj.lng, zoom: 17 });

      setIsRegisterOpen(false);
      setSelectingLocation(false);
      setPickedCoord(null);
      setCurrentView('map');
      setIsSidePanelOpen(true);
      if (newPlaceData.isEvent) {
        setIsCompanyManagerOpen(false);
        setGpsToast(`🎉 Evento "${newPlaceObj.name}" publicado e fixado no mapa!`);
      } else {
        setIsCompanyManagerOpen(true);
        setGpsToast(`🎉 Empresa "${newPlaceObj.name}" salva e fixada no mapa!`);
      }
      setTimeout(() => setGpsToast(null), 5000);
    } catch (err) {
      console.error('Error creating place in Firestore', err);
      alert('Erro ao salvar no banco de dados. Tente novamente.');
    }
  };

  // Coordinate picking on the map
  const handleStartPickingLocation = (fromTarget: 'register' | 'companyManager' = 'register') => {
    setPickingForTarget(fromTarget);
    setIsRegisterOpen(false);
    setIsCompanyManagerOpen(false);
    setSelectingLocation(true);
    setCurrentView('map');
    setIsSidePanelOpen(false);
  };

  const handleCoordSelected = (coord: { lat: number; lng: number }) => {
    setPickedCoord(coord);
    setSelectingLocation(false);
    if (pickingForTarget === 'companyManager') {
      setIsCompanyManagerOpen(true);
    } else {
      setIsRegisterOpen(true);
    }
  };

  // Establishment info for pinpointing on map (Logo and Company Name)
  const pickedPlaceInfo = useMemo(() => {
    if (userCompanyPlace) {
      return {
        name: userCompanyPlace.name,
        logoUrl: userCompanyPlace.logoUrl || userCompanyPlace.imageUrl || '',
        category: userCompanyPlace.category,
      };
    }
    try {
      const raw = localStorage.getItem('bairromap_company_reg_draft_v2');
      if (raw) {
        const d = JSON.parse(raw);
        if (d.regName || d.regLogoUrl || d.regImageUrl) {
          return {
            name: d.regName || currentUser?.companyName || 'Sua Empresa',
            logoUrl: d.regLogoUrl || d.regImageUrl || '',
            category: d.regCategory || 'restaurant',
          };
        }
      }
    } catch (e) {}

    if (currentUser?.companyName) {
      return {
        name: currentUser.companyName,
        logoUrl: currentUser.avatarUrl || '',
        category: 'restaurant',
      };
    }

    try {
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

    return null;
  }, [userCompanyPlace, currentUser, selectingLocation, pickedCoord]);

  // Filtered places calculation
  const filteredPlaces = useMemo(() => {
    let result = places.map((place) => {
      let distanceKm: number | undefined = undefined;
      if (userLocation) {
        distanceKm = calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng);
      }
      return { ...place, distanceKm };
    });

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Saved only filter
    if (filterSavedOnly) {
      result = result.filter((p) => savedPlaceIds.includes(p.id));
    }

    // Distance filter
    if (distanceFilter > 0 && userLocation) {
      result = result.filter(
        (p) => p.distanceKm !== undefined && p.distanceKm <= distanceFilter
      );
    }

    return result;
  }, [places, searchQuery, selectedCategory, filterSavedOnly, savedPlaceIds, distanceFilter, userLocation]);

  const activeEventsCount = places.filter((p) => p.isEvent).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans bg-slate-100 select-none">
      
      {/* Mandatory Login Gate: only logged in users can access the website */}
      {!currentUser && (
        <LoginGate
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setGpsToast(`Bem-vindo, ${user.name}!`);
            setTimeout(() => setGpsToast(null), 3000);
          }}
          onOpenEmailAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* GPS Notification Toast */}
      {gpsToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-lime-400/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-lime-400" />
          <span>{gpsToast}</span>
        </div>
      )}

      {/* VIEW 1: LANDING PAGE (LeadsPay inspired dark layout) */}
      {currentView === 'home' && (
        <div className="w-full h-full overflow-y-auto">
          <LandingPage
            places={places}
            onNavigateToMap={(place) => {
              if (place) setSelectedPlace(place);
              setCurrentView('map');
              if (currentUser?.role === 'empresa' && !place) {
                setIsCompanyManagerOpen(true);
              }
            }}
            onNavigateToBairrosCity={(nb) => {
              if (nb) setBairrosInitialNeighborhood(nb);
              setCurrentView('bairroscity');
            }}
            onOpenRegisterCompany={() => {
              if (currentUser?.role === 'empresa') {
                setCurrentView('map');
                setIsCompanyManagerOpen(true);
              } else {
                setIsRegisterOpen(true);
              }
            }}
            onOpenAuth={handleGoogleDirectLogin}
            onGoogleSignIn={handleGoogleDirectLogin}
            currentUser={currentUser}
            onLogout={async () => {
              try {
                await signOut(auth);
              } catch (err) {
                console.warn('Sign out warning', err);
              }
              localStorage.removeItem('bairromap_user');
              setCurrentUser(null);
            }}
            onRequestLocation={handleRequestLocation}
          />
        </div>
      )}

      {/* VIEW 2: BAIRROSCITY (Neighborhood-specific Community Hub) */}
      {currentView === 'bairroscity' && (
        <div className="w-full h-full overflow-y-auto">
          <BairrosCity
            initialNeighborhood={bairrosInitialNeighborhood}
            onNavigateToMap={(nb) => {
              if (nb) {
                setSearchQuery(nb);
              }
              setCurrentView('map');
            }}
            currentUser={currentUser}
            onOpenAuth={handleGoogleDirectLogin}
            onBackToHome={() => setCurrentView('map')}
          />
        </div>
      )}

      {/* VIEW 3: AUTHENTIC GOOGLE MAPS INTERFACE */}
      {currentView === 'map' && (
        <div className="relative w-full h-full overflow-hidden">
          {/* Slim Left Navigation Rail (Hidden during Street View) */}
          {!isStreetViewOpen && (
            <GoogleMapsRail
              onToggleMenu={() => setIsMenuOpen(true)}
              onNavigateHome={() => setCurrentView('home')}
              onNavigateBairrosCity={() => setCurrentView('bairroscity')}
              onOpenSaved={() => {
                setFilterSavedOnly(!filterSavedOnly);
                setSelectedPlace(null);
                setIsSidePanelOpen(true);
              }}
              onOpenRecent={() => {
                setSearchQuery('');
                setSelectedPlace(null);
                setIsSidePanelOpen(true);
              }}
              onOpenRegister={() => setIsRegisterOpen(true)}
              savedCount={savedPlaceIds.length}
              currentUser={currentUser}
              onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
              onOpenResidentProfile={() => setIsResidentProfileOpen(true)}
            />
          )}

          {/* Unified Centralized Top Bar (Hidden during Street View for clean view) */}
          {!isStreetViewOpen && (
            <GoogleMapsTopBar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                if (q.trim()) {
                  setSelectedPlace(null);
                  setIsSidePanelOpen(true);
                }
              }}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSelectedPlace(null);
                setIsSidePanelOpen(true);
              }}
              distanceFilter={distanceFilter}
              onDistanceChange={handleDistanceChange}
              onOpenRegister={() => setIsRegisterOpen(true)}
              isSidePanelOpen={isSidePanelOpen}
              onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
              onToggleMenu={() => setIsMenuOpen(true)}
              places={places}
              onSelectPlace={(place) => {
                setSelectedPlace(place);
                setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
                setIsSidePanelOpen(true);
              }}
              onSelectCoordinates={(coords, label) => {
                setMapCenterCoord(coords);
                setSelectedPlace(null);
                setCurrentStreetNode(
                  getStreetViewNodeForLocation(label || 'Local selecionado', label || 'Recife - PE', coords.lat, coords.lng)
                );
                if (label) {
                  setGpsToast(`Navegando para ${label}...`);
                  setTimeout(() => setGpsToast(null), 3000);
                }
              }}
              onNavigateHome={() => setCurrentView('home')}
              onNavigateBairrosCity={() => setCurrentView('bairroscity')}
              currentUser={currentUser}
              onGoogleLogin={handleGoogleDirectLogin}
              onLogout={async () => {
                try {
                  await signOut(auth);
                } catch (e) {
                  console.warn(e);
                }
                localStorage.removeItem('bairromap_user');
                setCurrentUser(null);
                setGpsToast('Você saiu da sua conta.');
                setTimeout(() => setGpsToast(null), 2500);
              }}
              onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
              onOpenResidentProfile={() => setIsResidentProfileOpen(true)}
            />
          )}

          {/* Google Maps Sliding Left Panel (Only in standard map mode) */}
          {!isStreetViewOpen && (
            <GooglePlacePanel
              isOpen={isSidePanelOpen}
              onToggleOpen={() => setIsSidePanelOpen((prev) => !prev)}
              selectedPlace={selectedPlace}
              onClosePlace={() => setSelectedPlace(null)}
              filteredPlaces={filteredPlaces}
              onSelectPlace={(place) => {
                setSelectedPlace(place);
                setCurrentStreetNode(getStreetViewNodeForLocation(place.name, place.address, place.lat, place.lng));
                setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
                setIsSidePanelOpen(true);
              }}
              onAddReview={handleAddReview}
              onOpenRegister={() => setIsRegisterOpen(true)}
              savedPlaceIds={savedPlaceIds}
              onToggleSavePlace={handleToggleSavePlace}
              currentUser={currentUser}
              onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
              userCompanyPlace={userCompanyPlace}
            />
          )}

          {/* Full-Screen / Split Leaflet Google Maps & Street View Canvas */}
          <main className="w-full h-full relative overflow-hidden">
            {isStreetViewOpen && streetViewMode === 'fullscreen' ? (
              // 1. FULL-SCREEN STREET VIEW (Images 5 & 6)
              <StreetViewViewer
                mode="fullscreen"
                currentNode={currentStreetNode}
                onToggleMode={(newMode) => setStreetViewMode(newMode)}
                onClose={() => setIsStreetViewOpen(false)}
                onNodeChange={(node, heading) => {
                  setCurrentStreetNode(node);
                  setStreetViewHeading(heading);
                }}
              />
            ) : isStreetViewOpen && streetViewMode === 'split' ? (
              // 2. SPLIT-SCREEN STREET VIEW (Image 3)
              <div className="w-full h-full flex flex-col">
                {/* Top Half (50%): Panoramic 360 Street View */}
                <div className="w-full h-1/2 relative border-b-2 border-slate-900 shadow-2xl z-20">
                  <StreetViewViewer
                    mode="split"
                    currentNode={currentStreetNode}
                    onToggleMode={(newMode) => setStreetViewMode(newMode)}
                    onClose={() => setIsStreetViewOpen(false)}
                    onNodeChange={(node, heading) => {
                      setCurrentStreetNode(node);
                      setStreetViewHeading(heading);
                    }}
                  />
                </div>

                {/* Bottom Half (50%): Synchronized Leaflet Google Map */}
                <div className="w-full h-1/2 relative z-10">
                  <MapComponent
                    places={filteredPlaces}
                    selectedPlace={selectedPlace}
                    onSelectPlace={(place) => {
                      setSelectedPlace(place);
                      setCurrentStreetNode(getStreetViewNodeForLocation(place.name, place.address, place.lat, place.lng));
                      setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
                    }}
                    userLocation={userLocation}
                    distanceFilter={distanceFilter}
                    selectingLocation={selectingLocation}
                    selectedCoord={pickedCoord}
                    onCoordSelected={handleCoordSelected}
                    pickedPlaceInfo={pickedPlaceInfo}
                    activeLayer={activeLayer}
                    onChangeLayer={setActiveLayer}
                    onRequestUserLocation={handleRequestLocation}
                    mapCenterCoord={mapCenterCoord}
                    markerStyle={markerStyle}
                    onToggleMarkerStyle={() => setMarkerStyle(markerStyle === 'arrow' ? 'pegman' : 'arrow')}
                    isTracking={isTracking}
                    isFollowing={isFollowing}
                    onDragMap={() => setIsFollowing(false)}
                    onDirectionsClick={() => {
                      if (selectedPlace) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`, '_blank');
                      } else if (userLocation) {
                        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}`, '_blank');
                      }
                    }}
                    onOpenStreetView={() => {
                      setIsStreetViewOpen(true);
                      setStreetViewMode('split');
                    }}
                    streetViewActive={true}
                    streetViewNode={currentStreetNode}
                    streetViewHeading={streetViewHeading}
                  />
                </div>
              </div>
            ) : (
              // 3. NORMAL FULL MAP VIEW WITH STREET VIEW THUMBNAIL (Image 2)
              <MapComponent
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onSelectPlace={(place) => {
                  setSelectedPlace(place);
                  setCurrentStreetNode(getStreetViewNodeForLocation(place.name, place.address, place.lat, place.lng));
                  setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
                  setIsSidePanelOpen(true);
                }}
                userLocation={userLocation}
                distanceFilter={distanceFilter}
                selectingLocation={selectingLocation}
                selectedCoord={pickedCoord}
                onCoordSelected={handleCoordSelected}
                pickedPlaceInfo={pickedPlaceInfo}
                activeLayer={activeLayer}
                onChangeLayer={setActiveLayer}
                onRequestUserLocation={handleRequestLocation}
                mapCenterCoord={mapCenterCoord}
                markerStyle={markerStyle}
                onToggleMarkerStyle={() => setMarkerStyle(markerStyle === 'arrow' ? 'pegman' : 'arrow')}
                isTracking={isTracking}
                isFollowing={isFollowing}
                onDragMap={() => setIsFollowing(false)}
                onDirectionsClick={() => {
                  if (selectedPlace) {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`, '_blank');
                  } else if (userLocation) {
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}`, '_blank');
                  }
                }}
                onOpenStreetView={() => {
                  setIsStreetViewOpen(true);
                  setStreetViewMode('split');
                }}
                streetViewActive={false}
                streetViewNode={currentStreetNode}
                streetViewHeading={streetViewHeading}
              />
            )}
          </main>

          {/* Mobile / Tablet Google Maps Bottom Navigation and Neighborhood Peek Sheet (Hidden in Street View) */}
          {!isStreetViewOpen && (
            <GoogleMapsMobileNav
              currentNeighborhood={searchQuery.trim() || 'Curado IV'}
              filteredPlaces={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={(place) => {
                setSelectedPlace(place);
                setCurrentStreetNode(getStreetViewNodeForLocation(place.name, place.address, place.lat, place.lng));
                setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
              }}
              onClosePlace={() => setSelectedPlace(null)}
              savedPlaceIds={savedPlaceIds}
              onToggleSavePlace={handleToggleSavePlace}
              onOpenSaved={() => {
                setFilterSavedOnly(true);
                setSelectedPlace(null);
                setIsSidePanelOpen(true);
              }}
              onNavigateHome={() => setCurrentView('home')}
              onNavigateBairrosCity={() => setCurrentView('bairroscity')}
              onOpenRegister={() => setIsRegisterOpen(true)}
              onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
              currentUser={currentUser}
              userLocation={userLocation}
              onDirections={(place) => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
              }}
              onOpenReviewModal={(place) => {
                setSelectedPlace(place);
                setIsSidePanelOpen(true);
              }}
            />
          )}

          {/* Google Maps Main Hamburger Menu Drawer */}
          <GoogleMapsMenuDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            totalPlaces={places.length}
            totalEvents={activeEventsCount}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setIsSidePanelOpen(true);
            }}
            currentUser={currentUser}
            onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
            onOpenResidentProfile={() => setIsResidentProfileOpen(true)}
          />

        </div>
      )}

      {/* Event & Leisure Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSavePlace={handleSavePlace}
        pickedCoord={pickedCoord}
        onStartPickingLocation={() => handleStartPickingLocation('register')}
        currentUser={currentUser}
        onUserRoleUpdated={(updated) => setCurrentUser(updated)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
      />

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView('map');
          if (user.role === 'empresa') {
            setIsCompanyManagerOpen(true);
            setGpsToast(`Bem-vindo, ${user.name}! Abrindo painel da empresa.`);
          } else {
            setGpsToast(`Bem-vindo, ${user.name}!`);
          }
          setTimeout(() => setGpsToast(null), 3500);
        }}
      />

      {/* Company Management Dashboard Modal */}
      {isCompanyManagerOpen && (
        <CompanyManagerModal
          isOpen={isCompanyManagerOpen}
          onClose={() => setIsCompanyManagerOpen(false)}
          currentUser={currentUser}
          companyPlace={userCompanyPlace}
          onPlaceUpdated={(updated) => {
            setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            if (selectedPlace?.id === updated.id) {
              setSelectedPlace(updated);
            }
          }}
          onPlaceCreated={(newPlace) => {
            setPlaces((prev) => [newPlace, ...prev]);
            setSelectedPlace(newPlace);
            setMapCenterCoord({ lat: newPlace.lat, lng: newPlace.lng, zoom: 17 });
            setGpsToast(`🎉 Empresa "${newPlace.name}" publicada no mapa!`);
            setTimeout(() => setGpsToast(null), 5000);
          }}
          onUserUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            localStorage.setItem('bairromap_user', JSON.stringify(updatedUser));
          }}
          pickedCoord={pickedCoord}
          onOpenRegisterModal={() => {
            setIsCompanyManagerOpen(false);
            setIsRegisterOpen(true);
          }}
          onOpenCreatePlace={() => {
            setIsCompanyManagerOpen(false);
            setIsRegisterOpen(true);
          }}
          onViewOnMap={(place) => {
            setSelectedPlace(place);
            setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
            setIsCompanyManagerOpen(false);
            setIsSidePanelOpen(true);
          }}
          onStartPickingLocation={() => {
            handleStartPickingLocation('companyManager');
          }}
        />
      )}

      {/* Resident Profile & Saved Places Modal */}
      {isResidentProfileOpen && currentUser && (
        <ResidentProfileModal
          isOpen={isResidentProfileOpen}
          onClose={() => setIsResidentProfileOpen(false)}
          currentUser={currentUser}
          savedPlaces={places.filter((p) => savedPlaceIds.includes(p.id))}
          onSelectPlace={(place) => {
            setSelectedPlace(place);
            setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
            setIsResidentProfileOpen(false);
            setCurrentView('map');
          }}
          onRemoveSaved={handleToggleSavePlace}
          onUpgradeToCompany={() => {
            setIsResidentProfileOpen(false);
            setIsRegisterOpen(true);
          }}
          onLogout={async () => {
            try {
              await signOut(auth);
            } catch (e) {
              console.warn(e);
            }
            localStorage.removeItem('bairromap_user');
            setCurrentUser(null);
            setIsResidentProfileOpen(false);
            setGpsToast('Você saiu da sua conta.');
            setTimeout(() => setGpsToast(null), 2500);
          }}
        />
      )}

    </div>
  );
}
