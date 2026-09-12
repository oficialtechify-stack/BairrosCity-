import React from 'react';
import {
  X,
  MapPin,
  Sparkles,
  PlusCircle,
  Bookmark,
  Compass,
  Info,
  Layers,
  Calendar,
  Phone,
  ShieldCheck,
  Building2,
  User,
  LogOut,
  LogIn,
  CalendarPlus
} from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleMapsMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalPlaces: number;
  totalEvents: number;
  onOpenRegister: () => void;
  onSelectCategory: (cat: any) => void;
  currentUser?: UserProfile | null;
  onOpenCompanyManager?: () => void;
  onOpenResidentProfile?: () => void;
  onOpenAdminPanel?: () => void;
  onLogout?: () => void;
  onGoogleLogin?: () => void;
}

export const GoogleMapsMenuDrawer: React.FC<GoogleMapsMenuDrawerProps> = ({
  isOpen,
  onClose,
  totalPlaces,
  totalEvents,
  onOpenRegister,
  onSelectCategory,
  currentUser,
  onOpenCompanyManager,
  onOpenResidentProfile,
  onOpenAdminPanel,
  onLogout,
  onGoogleLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-slideRight">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              G
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Google Maps <span className="text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded ml-1">Bairro</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Região Metropolitana do Recife
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats banner */}
        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white m-3 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-100">Guia Comunitário</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="mt-2 text-xl font-extrabold">
            {totalPlaces} Pontos no Mapa
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Restaurantes, padarias, atacados, parques e {totalEvents} eventos ativos na região.
          </p>
        </div>

        {/* Actions list */}
        <div className="p-3 space-y-1 text-sm font-medium text-slate-700">
          {(currentUser?.email?.toLowerCase() === 'bairroscity@gmail.com' || currentUser?.email?.toLowerCase() === 'rickmarketing81@gmail.com') && onOpenAdminPanel && (
            <button
              onClick={() => {
                onOpenAdminPanel();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-950 font-bold border border-amber-300 hover:bg-amber-100 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Painel Admin (Vereadores & Moradores)</span>
            </button>
          )}

          {currentUser?.role === 'empresa' && onOpenCompanyManager && (
            <button
              onClick={() => {
                onOpenCompanyManager();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-lime-50 text-lime-900 font-bold border border-lime-300 hover:bg-lime-100 transition-colors"
            >
              <Building2 className="w-5 h-5 text-lime-700" />
              <span>Painel de Gerenciamento da Empresa</span>
            </button>
          )}

          {currentUser?.role === 'morador' && onOpenResidentProfile && (
            <button
              onClick={() => {
                onOpenResidentProfile();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              <User className="w-5 h-5 text-emerald-700" />
              <span>Painel & Opções do Morador</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenRegister();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-purple-700 font-bold transition-colors"
          >
            <CalendarPlus className="w-5 h-5 text-purple-600" />
            <span>Registrar Eventos no Bairro</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('restaurant');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <MapPin className="w-5 h-5 text-orange-600" />
            <span>Restaurantes & Padarias</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('shopping');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Supermercados & Atacados</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('leisure');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>Praças, Piscinas & Passeios</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('event');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Eventos e Feiras</span>
          </button>

          {/* Account Authentication Actions */}
          {currentUser ? (
            <div className="pt-2 border-t border-slate-100 mt-2">
              <div className="px-3 py-2 mb-1 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                  {currentUser.role === 'empresa' ? 'Empresa' : 'Morador'}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 font-bold transition-colors cursor-pointer border border-red-200/60"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span>Sair da Minha Conta</span>
                </button>
              )}
            </div>
          ) : (
            onGoogleLogin && (
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoogleLogin();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                >
                  <LogIn className="w-5 h-5 text-blue-600" />
                  <span>Entrar com Conta Google</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* Footer info */}
        <div className="mt-auto p-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Plataforma Comunitária Aberta</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Incentivando o comércio local, turismo e lazer dos moradores de Curado, Várzea e região metropolitana.
          </p>
        </div>
      </div>
    </div>
  );
};
