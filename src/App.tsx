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
import { subscribePlaces, createPlaceInFirestore, addReviewToFirestore } from './services/placesService';
import { PUBLIC_LANDMARKS } from './data/publicLandmarks';
import { auth, db, signOut, onAuthStateChanged, getDoc, doc } from './lib/firebase';
import { loginWithGoogle } from './services/authService';
import { Home, Users, MapPin, Plus, Navigation, LogIn, CheckCircle2, LogOut } from 'lucide-react';

export default function App() {
  // Navigation view: 'home' (Landing page), 'map' (Google Maps view), 'bairroscity' (Bairro community feed)
  const [currentView, setCurrentView] = useState<'home' | 'map' | 'bairroscity'>('home');
  const [bairrosInitialNeighborhood, setBairrosInitialNeighborhood] = useState<string>('Curado IV');

  // Real-time Firestore places state combined with verified public landmarks
  const [places, setPlaces] = useState<Place[]>(PUBLIC_LANDMARKS);
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
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('roadmap');

  // Coordinate picking on map for business registration
  const [selectingLocation, setSelectingLocation] = useState<boolean>(false);
  const [pickedCoord, setPickedCoord] = useState<{ lat: number; lng: number } | null>(null);

  // User GPS location & filters
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
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
      // Merge public landmarks (militar, museus, estacoes, upas, arenas, igrejas, cemiterios, shopping, escolas, eventos)
      // with registered local businesses from Firestore
      const combined = [...PUBLIC_LANDMARKS, ...firestorePlaces];
      setPlaces(combined);
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
  const handleGoogleDirectLogin = async () => {
    try {
      const profile = await loginWithGoogle();
      setCurrentUser(profile);
      setCurrentView('map');
      setGpsToast(`Conectado como ${profile.name}! Entrou no site.`);
      setTimeout(() => setGpsToast(null), 3000);
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

  // Request real browser GPS location
  const handleRequestLocation = () => {
    setIsGpsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Minha Posição Atual (GPS)',
          accuracy: pos.coords.accuracy,
        };
        setUserLocation(newLocation);
        setIsGpsLoading(false);
        setCurrentView('map');
        setIsSidePanelOpen(true);
        setGpsToast('Localização GPS detectada com sucesso!');
        setTimeout(() => setGpsToast(null), 4000);
      },
      (err) => {
        console.warn('Geolocation denied or failed, fallback to Curado center', err);
        setIsGpsLoading(false);
        const fallbackLocation: UserLocation = {
          lat: -8.0645,
          lng: -34.9855,
          name: 'Curado IV (Padrão)',
        };
        setUserLocation(fallbackLocation);
        setCurrentView('map');
        setGpsToast('GPS indisponível: centralizamos no Curado IV.');
        setTimeout(() => setGpsToast(null), 4000);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
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
      });

      setIsRegisterOpen(false);
      setSelectingLocation(false);
      setPickedCoord(null);
      setCurrentView('map');
      setGpsToast('Empresa cadastrada com sucesso no Firebase!');
      setTimeout(() => setGpsToast(null), 4000);
    } catch (err) {
      console.error('Error creating place in Firestore', err);
      alert('Erro ao salvar no banco de dados. Tente novamente.');
    }
  };

  // Coordinate picking on the map
  const handleStartPickingLocation = () => {
    setIsRegisterOpen(false);
    setSelectingLocation(true);
    setCurrentView('map');
    setIsSidePanelOpen(false);
  };

  const handleCoordSelected = (coord: { lat: number; lng: number }) => {
    setPickedCoord(coord);
    setSelectingLocation(false);
    setIsRegisterOpen(true);
  };

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
            }}
            onNavigateToBairrosCity={(nb) => {
              if (nb) setBairrosInitialNeighborhood(nb);
              setCurrentView('bairroscity');
            }}
            onOpenRegisterCompany={() => setIsRegisterOpen(true)}
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
            onBackToHome={() => setCurrentView('home')}
          />
        </div>
      )}

      {/* VIEW 3: AUTHENTIC GOOGLE MAPS INTERFACE */}
      {currentView === 'map' && (
        <div className="relative w-full h-full overflow-hidden">
          {/* Slim Left Navigation Rail */}
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
          />

          {/* Unified Centralized Top Bar (Search + Options in One Professional Bar) */}
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
          />

          {/* Google Maps Sliding Left Panel (Place Details or Places List) */}
          <GooglePlacePanel
            isOpen={isSidePanelOpen}
            onToggleOpen={() => setIsSidePanelOpen((prev) => !prev)}
            selectedPlace={selectedPlace}
            onClosePlace={() => setSelectedPlace(null)}
            filteredPlaces={filteredPlaces}
            onSelectPlace={(place) => {
              setSelectedPlace(place);
              setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
              setIsSidePanelOpen(true);
            }}
            onAddReview={handleAddReview}
            onOpenRegister={() => setIsRegisterOpen(true)}
            savedPlaceIds={savedPlaceIds}
            onToggleSavePlace={handleToggleSavePlace}
          />

          {/* Full-Screen Leaflet Google Maps Canvas */}
          <main className="w-full h-full">
            <MapComponent
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={(place) => {
                setSelectedPlace(place);
                setMapCenterCoord({ lat: place.lat, lng: place.lng, zoom: 16 });
                setIsSidePanelOpen(true);
              }}
              userLocation={userLocation}
              distanceFilter={distanceFilter}
              selectingLocation={selectingLocation}
              selectedCoord={pickedCoord}
              onCoordSelected={handleCoordSelected}
              activeLayer={activeLayer}
              onChangeLayer={setActiveLayer}
              onRequestUserLocation={handleRequestLocation}
              mapCenterCoord={mapCenterCoord}
            />
          </main>

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
          />

        </div>
      )}

      {/* Business & Event Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSavePlace={handleSavePlace}
        pickedCoord={pickedCoord}
        onStartPickingLocation={handleStartPickingLocation}
      />

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setGpsToast(`Bem-vindo, ${user.name}!`);
          setTimeout(() => setGpsToast(null), 3500);
        }}
      />

    </div>
  );
}
