import React, { useState, useRef, useEffect } from 'react';
import { CategoryType, DistanceFilter, Place, UserProfile } from '../types';
import { NEIGHBORHOOD_COORDINATES, NeighborhoodGeo, DEFAULT_SEARCH_SHORTCUTS } from '../data/neighborhoodCoordinates';
import {
  Menu,
  Search,
  Navigation,
  X,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Hotel,
  Camera,
  Landmark,
  Bus,
  Pill,
  ShoppingBag,
  Calendar,
  PartyPopper,
  Sparkles,
  Home,
  Users,
  Plus,
  MapPin,
  Clock,
  LogIn,
  LogOut,
  Briefcase,
  Star,
  Check,
  Compass,
  Shield,
  Cross,
  Trophy,
  Church,
  GraduationCap,
  Building2,
  User,
  Settings,
  Mic,
  Fuel,
  Coffee,
  Scissors,
  CalendarPlus
} from 'lucide-react';

interface GoogleMapsTopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryType | 'all';
  onSelectCategory: (cat: CategoryType | 'all') => void;
  distanceFilter: DistanceFilter;
  onDistanceChange: (dist: DistanceFilter) => void;
  onOpenRegister: () => void;
  isSidePanelOpen: boolean;
  onToggleSidePanel: () => void;
  onToggleMenu: () => void;
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onSelectCoordinates: (coords: { lat: number; lng: number; zoom?: number }, label?: string) => void;
  onNavigateHome: () => void;
  onNavigateBairrosCity: () => void;
  currentUser: UserProfile | null;
  onGoogleLogin: () => void;
  onLogout: () => void;
  onOpenCompanyManager: () => void;
  onOpenResidentProfile: () => void;
  onOpenAdminPanel?: () => void;
}

export const GoogleMapsTopBar: React.FC<GoogleMapsTopBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  distanceFilter,
  onDistanceChange,
  onOpenRegister,
  isSidePanelOpen,
  onToggleSidePanel,
  onToggleMenu,
  places,
  onSelectPlace,
  onSelectCoordinates,
  onNavigateHome,
  onNavigateBairrosCity,
  currentUser,
  onGoogleLogin,
  onLogout,
  onOpenCompanyManager,
  onOpenResidentProfile,
  onOpenAdminPanel,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const isAdmin =
    currentUser?.email?.toLowerCase() === 'bairroscity@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'rickmarketing81@gmail.com';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'gas', label: 'Gasolina', icon: Fuel, catMap: 'automotive' as CategoryType },
    { id: 'restaurant', label: 'Restaurantes', icon: Utensils, catMap: 'restaurant' as CategoryType },
    { id: 'cafe', label: 'Lanches & Açaí', icon: Coffee, catMap: 'cafe' as CategoryType },
    { id: 'supermarket', label: 'Mercados & Lojas', icon: ShoppingBag, catMap: 'supermarket' as CategoryType },
    { id: 'pharmacy', label: 'Farmácias & Saúde', icon: Pill, catMap: 'pharmacy' as CategoryType },
    { id: 'beauty', label: 'Barbearia & Beleza', icon: Scissors, catMap: 'beauty' as CategoryType },
    { id: 'event', label: 'Eventos & Lazer', icon: Calendar, catMap: 'event' as CategoryType },
    { id: 'companies', label: 'BairrosCity Empresas', icon: Sparkles, catMap: 'all' as any },
    { id: 'hospital', label: 'UPAs & Clínicas', icon: Cross, catMap: 'healthcare' as CategoryType },
  ];

  // Matching neighborhoods from database of coordinates
  const q = searchQuery.trim().toLowerCase();
  const matchingNeighborhoods: NeighborhoodGeo[] = Object.values(NEIGHBORHOOD_COORDINATES).filter((n) =>
    q ? n.name.toLowerCase().includes(q) || (n.description && n.description.toLowerCase().includes(q)) : false
  );

  // Matching registered places / companies
  const matchingPlaces: Place[] = places.filter((p) => {
    if (!q) return false;
    return (
      p.name.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Handle Search Submission (Enter or Search icon)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!q) {
      onToggleSidePanel();
      return;
    }

    // 1. If an exact place matches, fly straight to it
    const exactPlace = places.find((p) => p.name.toLowerCase() === q);
    if (exactPlace) {
      onSelectPlace(exactPlace);
      setIsDropdownOpen(false);
      return;
    }

    // 2. If a neighborhood matches, fly to its exact coordinates!
    const exactNeighborhood = Object.values(NEIGHBORHOOD_COORDINATES).find(
      (n) => n.name.toLowerCase() === q
    );
    if (exactNeighborhood) {
      onSelectCoordinates({ lat: exactNeighborhood.lat, lng: exactNeighborhood.lng, zoom: exactNeighborhood.zoom }, exactNeighborhood.name);
      setIsDropdownOpen(false);
      return;
    }

    // 3. If there are matching places, open side panel to show results
    if (matchingPlaces.length > 0) {
      onSelectPlace(matchingPlaces[0]);
      setIsDropdownOpen(false);
      return;
    }

    // 4. If top neighborhood matches partially (e.g. "teji" -> "Tejipió")
    if (matchingNeighborhoods.length > 0) {
      const topN = matchingNeighborhoods[0];
      onSelectCoordinates({ lat: topN.lat, lng: topN.lng, zoom: topN.zoom }, topN.name);
      onSearchChange(topN.name);
      setIsDropdownOpen(false);
      return;
    }

    // Fallback: Open side panel to show any filtered results
    onToggleSidePanel();
    setIsDropdownOpen(false);
  };

  const handleSelectNeighborhood = (geo: NeighborhoodGeo) => {
    onSelectCoordinates({ lat: geo.lat, lng: geo.lng, zoom: geo.zoom }, geo.name);
    onSearchChange(geo.name);
    setIsDropdownOpen(false);
  };

  const handleSelectPlaceItem = (place: Place) => {
    onSelectPlace(place);
    setIsDropdownOpen(false);
  };

  const handleSelectCategoryItem = (cat: CategoryType | 'all') => {
    onSelectCategory(cat);
    setIsDropdownOpen(false);
    onToggleSidePanel();
  };

  return (
    <header className="absolute top-2 sm:top-2.5 left-2 right-2 sm:left-4 sm:right-4 lg:left-20 lg:right-4 z-[460] flex flex-col gap-2 pointer-events-none">
      {/* TOP ROW: Search Bar & Unified Options Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pointer-events-auto">
        
        {/* The Search Bar Component with Autocomplete Dropdown */}
        <div ref={containerRef} className="relative w-full md:w-[390px] lg:w-[410px]">
          <form
            onSubmit={handleSearchSubmit}
            className="h-11 sm:h-12 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center px-3 gap-2 border border-slate-200/90 transition-shadow focus-within:shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
          >
            {/* Menu button */}
            <button
              type="button"
              onClick={onToggleMenu}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Menu principal"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Pesquise aqui (ex: Curado, padaria...)"
              className="flex-1 text-sm text-slate-800 placeholder-slate-500 font-normal bg-transparent focus:outline-none min-w-0"
            />

            {/* Clear Search */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                title="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Magnifying Glass */}
            <button
              type="submit"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Pesquisar e ir ao local exato"
            >
              <Search className="w-4 h-4 text-slate-500" />
            </button>

            {/* Microphone button (Voice Search prompt) */}
            <button
              type="button"
              onClick={() => {
                const term = prompt('Fale ou digite o que procura no bairro:');
                if (term) {
                  onSearchChange(term);
                  setIsDropdownOpen(true);
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Pesquisa por voz"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* User Avatar on Mobile */}
            <div className="md:hidden shrink-0">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-300 cursor-pointer"
                  title={currentUser.name}
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                  title="Fazer Login"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Vertical divider */}
            <div className="hidden md:block w-[1px] h-5 bg-slate-200 shrink-0" />

            {/* Desktop Directions Blue Circle Icon */}
            <button
              type="button"
              onClick={onToggleSidePanel}
              className="hidden md:flex w-7 h-7 rounded-full bg-blue-600 text-white items-center justify-center hover:bg-blue-700 transition-colors shadow-xs shrink-0 cursor-pointer"
              title={isSidePanelOpen ? "Alternar lista de locais" : "Mostrar lista de locais"}
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
            </button>

            {/* Toggle Lista Button (Visible on mobile & desktop) */}
            <button
              type="button"
              onClick={onToggleSidePanel}
              className={`flex px-2 py-1 rounded-md text-xs font-bold items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                isSidePanelOpen
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isSidePanelOpen ? "Minimizar painel lateral" : "Abrir painel lateral"}
            >
              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isSidePanelOpen ? '' : 'rotate-180'}`} />
              <span className="text-[11px]">{isSidePanelOpen ? 'Fechar' : 'Lista'}</span>
            </button>
          </form>

          {/* Autocomplete Dropdown (Authentic Google Maps design matching screenshot 3) */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-[600] max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* IF USER HAS TYPED: Show Real Places and Neighborhood Matches */}
              {q ? (
                <div className="py-2 divide-y divide-slate-100">
                  {/* Matching Places */}
                  {matchingPlaces.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Locais & Empresas Encontradas
                      </div>
                      {matchingPlaces.map((place) => {
                        const hasPhoto = Boolean(place.logoUrl || place.imageUrl);
                        return (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectPlaceItem(place)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                          >
                            {/* Logo or Category Icon */}
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              {hasPhoto ? (
                                <img
                                  src={place.logoUrl || place.imageUrl}
                                  alt={place.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <MapPin className="w-4 h-4 text-rose-500" />
                              )}
                              {place.isRegisteredCompany && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime-500 rounded-full border border-white flex items-center justify-center text-[7px] font-black text-slate-950">
                                  ✓
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                                  {place.name}
                                </span>
                                {place.isRegisteredCompany && (
                                  <span className="text-[9px] font-bold bg-lime-100 text-lime-800 px-1.5 py-0.2 rounded shrink-0">
                                    BairrosCity
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                                <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {place.rating.toFixed(1)}
                                </span>
                                <span>•</span>
                                <span>{place.subCategory}</span>
                                <span>•</span>
                                <span>{place.neighborhood}</span>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Matching Neighborhoods (Takes map straight to coordinates!) */}
                  {matchingNeighborhoods.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Bairros & Regiões (Ir direto no mapa)
                      </div>
                      {matchingNeighborhoods.map((geo) => (
                        <button
                          key={geo.name}
                          type="button"
                          onClick={() => handleSelectNeighborhood(geo)}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Compass className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                              {geo.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {geo.description || `${geo.city} - Navegar para o bairro exato`}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                            Ir ao mapa
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingPlaces.length === 0 && matchingNeighborhoods.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-slate-500">
                      Nenhum resultado exato para &quot;<span className="font-bold text-slate-700">{searchQuery}</span>&quot;.
                      <p className="mt-1 text-[11px] text-slate-400">
                        Pressione Enter para buscar por proximidade ou cadastrar um novo local.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* DEFAULT GOOGLE MAPS SHORTCUTS (Matching Screenshot 3) */
                <div className="py-2 divide-y divide-slate-100">
                  {/* Shortcuts: Casa & Trabalho */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCoordinates({ lat: -8.0645, lng: -34.9855, zoom: 16 }, 'Casa');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          Casa
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Rua Quatorze - Curado IV, Jaboatão dos Guararapes
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Ir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectCoordinates({ lat: -8.0520, lng: -34.9530, zoom: 16 }, 'Trabalho');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          Trabalho
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Definir local ou navegar para a região universitária
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Ir</span>
                    </button>
                  </div>

                  {/* Bairros Rápidos */}
                  <div className="py-1">
                    <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Bairros Mais Buscados
                    </div>
                    {['Tejipió', 'Curado IV', 'Várzea', 'Totó', 'Boa Viagem'].map((bName) => {
                      const geo = NEIGHBORHOOD_COORDINATES[bName];
                      if (!geo) return null;
                      return (
                        <button
                          key={bName}
                          type="button"
                          onClick={() => handleSelectNeighborhood(geo)}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                        >
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-800 group-hover:text-blue-600">
                              {bName}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {geo.city}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-600">Levar mapa</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Categorias Populares */}
                  <div className="py-1">
                    <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Sugestões
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectCategoryItem('restaurant')}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <Utensils className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-800">Restaurantes & Gastronomia</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCategoryItem('cafe')}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <Hotel className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800">Hotéis, Pousadas & Cafés</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCategoryItem('shopping')}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-800">Supermercados & Mercadinhos</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* UNIFIED OPTIONS STRIP (Centralized, Clean, Professional, Completely Integrated!) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 p-1 rounded-full bg-white/95 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.18)] backdrop-blur-md shrink-0">
          {/* Raio / Distância Selector */}
          <div className="relative pl-1">
            <select
              value={distanceFilter}
              onChange={(e) => onDistanceChange(Number(e.target.value) as DistanceFilter)}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-full border border-slate-200 cursor-pointer focus:outline-none transition-colors"
              title="Filtrar por Raio de Distância"
            >
              <option value={0}>Raio Geral</option>
              <option value={1}>1 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
            </select>
          </div>

          {/* Início Button */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Voltar para a página inicial"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Início</span>
          </button>

          {/* BairrosCity Button */}
          <button
            type="button"
            onClick={onNavigateBairrosCity}
            className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ver feed e empresas do BairrosCity"
          >
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>BairrosCity</span>
          </button>

          {/* Admin Panel Button (Restricted to bairroscity@gmail.com and test admin) */}
          {currentUser && (currentUser.email?.toLowerCase() === 'bairroscity@gmail.com' || currentUser.email?.toLowerCase() === 'rickmarketing81@gmail.com') && onOpenAdminPanel && (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Painel de Administração do BairrosCity"
            >
              <Shield className="w-3.5 h-3.5 text-slate-950" />
              <span>Admin</span>
            </button>
          )}

          {/* Role-Specific Button: Empresa vs Morador vs Visitante */}
          {currentUser && currentUser.role === 'empresa' ? (
            <button
              type="button"
              onClick={onOpenCompanyManager}
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-black bg-lime-400 hover:bg-lime-300 text-slate-950 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Gerenciar minha empresa no BairrosCity"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Gerenciar Empresa</span>
              <span className="sm:hidden">Empresa</span>
            </button>
          ) : currentUser && currentUser.role === 'morador' ? (
            <button
              type="button"
              onClick={onOpenResidentProfile}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Opções do Morador"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Opções Morador</span>
              <span className="sm:hidden">Perfil</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenRegister}
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Registrar evento cultural ou comunitário no bairro"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Registrar Evento</span>
              <span className="sm:hidden">Eventos</span>
            </button>
          )}

          {/* User Profile Avatar / Login Google */}
          <div className="relative pl-1 border-l border-slate-200">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  title={`Conectado como ${currentUser.name}`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border-2 border-lime-400"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 max-w-[70px] truncate hidden lg:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu for Logged In User */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentUser.role === 'empresa'
                          ? 'bg-lime-100 text-lime-800 border border-lime-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {currentUser.role === 'empresa' ? 'Conta Empresarial' : 'Conta Morador'}
                      </span>
                    </div>

                    <div className="py-1">
                      {isAdmin && onOpenAdminPanel && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdminPanel();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-2 cursor-pointer border-b border-amber-100"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>Painel Admin (Vereadores & Moradores)</span>
                        </button>
                      )}
                      {currentUser.role === 'empresa' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenCompanyManager();
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Building2 className="w-4 h-4 text-lime-600" />
                            <span>Gerenciar Minha Empresa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenRegister();
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-4 h-4 text-slate-500" />
                            <span>Cadastrar Novo Local / Evento</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenResidentProfile();
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-emerald-600" />
                            <span>Painel do Morador & Favoritos</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenRegister();
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
                          >
                            <CalendarPlus className="w-4 h-4 text-purple-600" />
                            <span>Registrar Eventos no Bairro</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoogleLogin}
                className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Entrar com sua conta Google"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: Horizontal Category Pills Carousel (Google Maps Authentic Style) */}
      <div className={`pointer-events-auto flex items-center gap-1.5 overflow-hidden max-w-full transition-all duration-300 ${
        isSidePanelOpen ? 'hidden lg:flex lg:ml-[420px]' : ''
      }`}>
        {/* Scroll Left Button */}
        <button
          onClick={() => scrollCarousel('left')}
          className="hidden md:flex w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-600 hover:bg-slate-50 shrink-0 cursor-pointer"
          title="Rolar categorias para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Carousel pills */}
        <div
          ref={carouselRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-smooth"
        >
          {/* Todos / Limpar */}
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="h-8 px-3 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1 shrink-0 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Limpar Filtro</span>
            </button>
          )}

          {categories.map((cat) => {
            const Icon = cat.icon;
            const targetCat = cat.catMap || (cat.id as CategoryType);
            const isSelected = selectedCategory === targetCat;

            return (
              <button
                key={cat.id}
                id={`pill-${cat.id}`}
                type="button"
                onClick={() => onSelectCategory(isSelected ? 'all' : targetCat)}
                className={`h-8 px-3.5 rounded-full text-xs font-medium shadow-[0_1px_3px_rgba(0,0,0,0.15)] flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-blue-600' : 'text-slate-600'
                  }`}
                />
                <span className="whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scrollCarousel('right')}
          className="w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shrink-0 cursor-pointer"
          title="Rolar categorias para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Responsive Mobile User Menu Sheet with Backdrop */}
      {userDropdownOpen && (
        <div
          className="md:hidden fixed inset-0 z-[900] bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end p-3 animate-in fade-in duration-150"
          onClick={() => setUserDropdownOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-sm mx-auto p-4 space-y-3 animate-in slide-in-from-bottom-3 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser?.name}
                    className="w-11 h-11 rounded-full object-cover border border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {currentUser?.name || 'Minha Conta'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                  {currentUser && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                      {currentUser.role === 'empresa' ? 'Conta Empresarial' : 'Conta Morador'}
                      {currentUser.neighborhood ? ` • ${currentUser.neighborhood}` : ''}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {isAdmin && onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenAdminPanel();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300 flex items-center gap-2.5 cursor-pointer shadow-xs"
                >
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Painel Admin (Vereadores & Moradores)</span>
                </button>
              )}

              {currentUser?.role === 'empresa' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenCompanyManager();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold bg-lime-50 text-lime-900 border border-lime-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-lime-700 shrink-0" />
                    <span>Gerenciar Minha Empresa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Cadastrar Novo Local / Evento</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenResidentProfile();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Meu Painel & Locais Salvos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Registrar Eventos no Bairro</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false);
                  onNavigateBairrosCity();
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Explorar BairrosCity (Notícias & Vereador)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-red-200"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sair da Minha Conta</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onGoogleLogin();
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Fazer Login com Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
