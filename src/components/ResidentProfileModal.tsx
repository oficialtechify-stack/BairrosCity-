import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Bookmark,
  Star,
  Building2,
  LogOut,
  CalendarPlus,
  ShieldCheck,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { UserProfile, Place } from '../types';

interface ResidentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  savedPlaces: Place[];
  onSelectPlace: (place: Place) => void;
  onLogout: () => void;
  onSwitchToCompany?: () => void;
  onOpenRegisterEvent?: () => void;
}

export const ResidentProfileModal: React.FC<ResidentProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  savedPlaces,
  onSelectPlace,
  onLogout,
  onSwitchToCompany,
  onOpenRegisterEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'account'>('favorites');

  if (!isOpen || !currentUser) return null;

  return (
    <div
      id="resident-profile-backdrop"
      className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="resident-profile-content"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-lime-400"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-lime-400/20 border border-lime-400/40 text-lime-400 flex items-center justify-center font-bold text-lg">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">{currentUser.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Morador do Bairro
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-lime-400" />
                <span>{currentUser.neighborhood || 'Curado IV'}</span>
                <span className="text-slate-600">•</span>
                <span>{currentUser.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`py-2 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-lime-400 text-lime-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Locais Salvos ({savedPlaces.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`py-2 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'account'
                ? 'border-lime-400 text-lime-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Opções do Morador</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'favorites' && (
            <div>
              {savedPlaces.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-3">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Nenhum local salvo ainda</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Navegue pelo mapa ou pelo catálogo e clique no ícone de salvar para guardar padarias, restaurantes e atrações favoritas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedPlaces.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => {
                        onSelectPlace(place);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-lime-400/50 transition-all flex items-center gap-3 cursor-pointer group"
                    >
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-lime-400 truncate transition-colors">
                          {place.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {place.subCategory} • {place.neighborhood}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-bold text-slate-300">{place.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                        Ver no mapa →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-5">
              {/* Resident role card */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-lime-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Perfil de Morador Ativo</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Como morador, você pode favoritar comércios, publicar alertas de problemas de iluminação/buracos no BairrosCity, avaliar estabelecimentos locais e apoiar o comércio do seu bairro.
                </p>
              </div>

              {/* Event Registration Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/70 to-slate-900 border border-purple-700/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <CalendarPlus className="w-4 h-4 text-purple-400" />
                  <span>Registrar Eventos no Meu Bairro</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Moradores podem registrar feiras comunitárias, eventos esportivos, culturais e atrações gratuitas ou pagas no bairro para divulgar no mapa e no BairrosCity.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRegisterEvent?.();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-500/20 active:scale-95"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Registrar Evento Comunitário</span>
                </button>
              </div>

              {/* Exclusive Resident Role notice */}
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-400 flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <p className="leading-relaxed">
                  <strong className="text-slate-300">Apenas Eventos para Moradores:</strong> no portal dos moradores não é permitido cadastrar empresas comerciais. O cadastro e gerenciamento de empresas é restrito exclusivamente ao perfil empresarial.
                </p>
              </div>

              {/* Logout button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Minha Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
