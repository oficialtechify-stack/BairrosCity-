import React, { useState } from 'react';
import { Place, UserProfile } from '../types';
import { CATEGORY_CONFIG } from '../data/initialPlaces';
import { calculateDistance, formatDistance } from '../utils/distance';
import {
  Compass,
  Bookmark,
  Users,
  Building2,
  PlusCircle,
  X,
  Navigation,
  Phone,
  MessageCircle,
  Share2,
  Star,
  MapPin,
  User,
  LogOut,
  LogIn,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface GoogleMapsMobileNavProps {
  currentNeighborhood: string;
  filteredPlaces: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onClosePlace: () => void;
  savedPlaceIds: string[];
  onToggleSavePlace: (placeId: string) => void;
  onOpenSaved: () => void;
  onNavigateHome: () => void;
  onNavigateBairrosCity: () => void;
  onOpenRegister: () => void;
  onOpenCompanyManager: () => void;
  currentUser: UserProfile | null;
  userLocation: { lat: number; lng: number } | null;
  onDirections: (place: Place) => void;
  onOpenReviewModal: (place: Place) => void;
  onLogout?: () => void;
  onOpenResidentProfile?: () => void;
  onOpenAdminPanel?: () => void;
  onGoogleLogin?: () => void;
}

export const GoogleMapsMobileNav: React.FC<GoogleMapsMobileNavProps> = ({
  currentNeighborhood,
  filteredPlaces,
  selectedPlace,
  onSelectPlace,
  onClosePlace,
  savedPlaceIds,
  onToggleSavePlace,
  onOpenSaved,
  onNavigateHome,
  onNavigateBairrosCity,
  onOpenRegister,
  onOpenCompanyManager,
  currentUser,
  userLocation,
  onDirections,
  onOpenReviewModal,
  onLogout,
  onOpenResidentProfile,
  onOpenAdminPanel,
  onGoogleLogin,
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'explorar' | 'salvos' | 'bairroscity' | 'empresa' | 'conta'>('explorar');
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);

  const isAdmin =
    currentUser?.email?.toLowerCase() === 'bairroscity@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'rickmarketing81@gmail.com';

  const isSaved = selectedPlace ? savedPlaceIds.includes(selectedPlace.id) : false;

  const handleShare = (place: Place) => {
    if (navigator.share) {
      navigator.share({
        title: `${place.name} - BairrosCity`,
        text: `Confira ${place.name} em ${place.neighborhood} no BairrosCity!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link do local copiado!');
    }
  };

  return (
    <div className="lg:hidden">
      {/* 1. SELECTED PLACE CARD (Only displays when the user explicitly taps a place on the map - clean light Google Maps style, zero black bars) */}
      {selectedPlace && (
        <div className="fixed left-2.5 right-2.5 bottom-16 z-[480] transition-all duration-200 ease-out">
          <div className="w-full bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 backdrop-blur-md p-3.5 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 truncate">
                    {selectedPlace.name}
                  </span>
                  {selectedPlace.isRegisteredCompany && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9px] font-bold shrink-0">
                      Oficial
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {selectedPlace.rating.toFixed(1)}
                  </span>
                  <span>({selectedPlace.reviewsCount || 1})</span>
                  <span>•</span>
                  <span className="truncate">{selectedPlace.subCategory}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClosePlace}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center shrink-0 cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Distance and Address */}
            <div className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{selectedPlace.address}, {selectedPlace.neighborhood}</span>
              {userLocation && (
                <span className="text-[11px] font-bold text-blue-700 shrink-0 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, selectedPlace.lat, selectedPlace.lng))}
                </span>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 overflow-x-auto scrollbar-none">
              {/* Rotas */}
              <button
                type="button"
                onClick={() => onDirections(selectedPlace)}
                className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>Rotas</span>
              </button>

              {/* WhatsApp */}
              {selectedPlace.whatsapp && (
                <a
                  href={`https://wa.me/55${selectedPlace.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Ligar */}
              {selectedPlace.phone && (
                <a
                  href={`tel:${selectedPlace.phone.replace(/\D/g, '')}`}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar</span>
                </a>
              )}

              {/* Salvar */}
              <button
                type="button"
                onClick={() => onToggleSavePlace(selectedPlace.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                  isSaved
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
              </button>

              {/* Avaliar */}
              <button
                type="button"
                onClick={() => onOpenReviewModal(selectedPlace)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Avaliar</span>
              </button>

              {/* Compartilhar */}
              <button
                type="button"
                onClick={() => handleShare(selectedPlace)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. GOOGLE MAPS BOTTOM NAVIGATION BAR (Clean, luminous white style matching standard Google Maps) */}
      <nav
        id="google-maps-mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-[500] bg-white/95 border-t border-slate-200 backdrop-blur-md px-2 py-1 flex items-center justify-around select-none shadow-md safe-area-inset-bottom"
      >
        {/* Tab 1: Explorar (Home / Mapa) */}
        <button
          type="button"
          onClick={() => {
            setActiveNavTab('explorar');
            onNavigateHome();
            onClosePlace();
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeNavTab === 'explorar' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full ${activeNavTab === 'explorar' ? 'bg-blue-50' : ''}`}>
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Explorar</span>
        </button>

        {/* Tab 2: BairrosCity (Comunidade & Feed) */}
        <button
          type="button"
          onClick={() => {
            setActiveNavTab('bairroscity');
            onNavigateBairrosCity();
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeNavTab === 'bairroscity' ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full ${activeNavTab === 'bairroscity' ? 'bg-purple-50' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">BairrosCity</span>
        </button>

        {/* Tab 3: Minha Empresa / Catálogo */}
        <button
          type="button"
          onClick={() => {
            setActiveNavTab('empresa');
            if (currentUser && currentUser.role === 'empresa') {
              onOpenCompanyManager();
            } else {
              onOpenRegister();
            }
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeNavTab === 'empresa' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full ${activeNavTab === 'empresa' ? 'bg-emerald-50' : ''}`}>
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Empresa</span>
        </button>

        {/* Tab 4: Salvos */}
        <button
          type="button"
          onClick={() => {
            setActiveNavTab('salvos');
            onOpenSaved();
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all relative cursor-pointer ${
            activeNavTab === 'salvos' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full ${activeNavTab === 'salvos' ? 'bg-amber-50' : ''}`}>
            <Bookmark className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Salvos</span>
          {savedPlaceIds.length > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center">
              {savedPlaceIds.length}
            </span>
          )}
        </button>

        {/* Tab 5: Minha Conta / Sair ou Entrar */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => {
              setActiveNavTab('conta');
              setIsAccountSheetOpen(true);
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeNavTab === 'conta' || isAccountSheetOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden border ${
              activeNavTab === 'conta' || isAccountSheetOpen ? 'border-blue-600 bg-blue-100 text-blue-700' : 'border-slate-300 bg-slate-100 text-slate-700'
            }`}>
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{currentUser.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Conta</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onGoogleLogin) {
                onGoogleLogin();
              } else {
                onOpenRegister();
              }
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer text-slate-500 hover:text-blue-600"
          >
            <div className="p-1 rounded-full bg-slate-100 text-slate-600">
              <LogIn className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Entrar</span>
          </button>
        )}
      </nav>

      {/* Mobile Account Bottom Sheet Modal */}
      {isAccountSheetOpen && currentUser && (
        <div
          className="fixed inset-0 z-[700] bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end p-3 animate-in fade-in duration-150"
          onClick={() => setIsAccountSheetOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-sm mx-auto p-4 space-y-3.5 animate-in slide-in-from-bottom-3 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                      {currentUser.role === 'empresa' ? 'Empresa' : 'Morador'}
                    </span>
                    {currentUser.neighborhood && (
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        📍 {currentUser.neighborhood}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAccountSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Quick Options */}
            <div className="space-y-1.5">
              {isAdmin && onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountSheetOpen(false);
                    onOpenAdminPanel();
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300 flex items-center gap-2.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Painel Admin (Vereadores & Moradores)</span>
                </button>
              )}

              {currentUser.role === 'empresa' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountSheetOpen(false);
                      onOpenCompanyManager();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold bg-lime-50 text-lime-900 border border-lime-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-lime-700 shrink-0" />
                    <span>Gerenciar Minha Empresa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountSheetOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full px-3.5 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
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
                      setIsAccountSheetOpen(false);
                      onOpenResidentProfile?.();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Meu Painel & Locais Salvos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountSheetOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full px-3.5 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Cadastrar Empresa no Mapa</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsAccountSheetOpen(false);
                  onOpenSaved();
                }}
                className="w-full px-3.5 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Locais Salvos ({savedPlaceIds.length})</span>
              </button>
            </div>

            {/* Logout button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAccountSheetOpen(false);
                  onLogout?.();
                }}
                className="w-full px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-red-200 active:scale-98"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sair da Minha Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
