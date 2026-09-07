import React from 'react';
import {
  MapPin,
  Plus,
  Compass,
  Map as MapIcon,
  ListFilter,
  Sparkles,
  Building2,
} from 'lucide-react';

interface HeaderProps {
  totalPlaces: number;
  totalEvents: number;
  currentRegionName: string;
  onOpenRegister: () => void;
  viewMode: 'split' | 'map' | 'list';
  onViewModeChange: (mode: 'split' | 'map' | 'list') => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalPlaces,
  totalEvents,
  currentRegionName,
  onOpenRegister,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
      {/* Brand Logo & Region Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
              Bairro<span className="text-indigo-600">Map</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Guia Regional
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">{currentRegionName}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">
              {totalPlaces} locais e {totalEvents} eventos ativos
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons & View Controls */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Mobile View Toggle Buttons */}
        <div className="flex sm:hidden bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'map'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Mapa</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'list'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>
        </div>

        {/* Register Company / Place / Event Button */}
        <button
          id="btn-register-place"
          type="button"
          onClick={onOpenRegister}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Cadastrar Empresa / Evento</span>
          <span className="sm:hidden">Cadastrar</span>
        </button>
      </div>
    </header>
  );
};
