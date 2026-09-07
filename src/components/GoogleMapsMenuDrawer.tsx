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
  ShieldCheck
} from 'lucide-react';

interface GoogleMapsMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalPlaces: number;
  totalEvents: number;
  onOpenRegister: () => void;
  onSelectCategory: (cat: any) => void;
}

export const GoogleMapsMenuDrawer: React.FC<GoogleMapsMenuDrawerProps> = ({
  isOpen,
  onClose,
  totalPlaces,
  totalEvents,
  onOpenRegister,
  onSelectCategory,
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
          <button
            onClick={() => {
              onOpenRegister();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-blue-700 font-bold transition-colors"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>Adicionar uma empresa ou local</span>
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
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Eventos e Feiras</span>
          </button>
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
