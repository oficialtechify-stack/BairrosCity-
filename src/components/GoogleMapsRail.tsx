import React from 'react';
import {
  Menu,
  Bookmark,
  History,
  Smartphone,
  PlusCircle,
  Home,
  Users,
  Building2,
  User
} from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleMapsRailProps {
  onToggleMenu: () => void;
  onOpenSaved: () => void;
  onOpenRecent: () => void;
  onOpenRegister: () => void;
  onNavigateHome?: () => void;
  onNavigateBairrosCity?: () => void;
  savedCount: number;
  currentUser?: UserProfile | null;
  onOpenCompanyManager?: () => void;
  onOpenResidentProfile?: () => void;
}

export const GoogleMapsRail: React.FC<GoogleMapsRailProps> = ({
  onToggleMenu,
  onOpenSaved,
  onOpenRecent,
  onOpenRegister,
  onNavigateHome,
  onNavigateBairrosCity,
  savedCount,
  currentUser,
  onOpenCompanyManager,
  onOpenResidentProfile,
}) => {
  return (
    <aside
      id="google-maps-left-rail"
      className="absolute top-0 bottom-0 left-0 z-[450] w-16 bg-white border-r border-slate-200/90 flex flex-col items-center justify-between py-3 select-none shadow-sm"
    >
      {/* Top Section */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Menu Hamburger */}
        <button
          onClick={onToggleMenu}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          title="Menu principal"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Home Link */}
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="flex flex-col items-center gap-1 group w-full py-1 hover:bg-slate-50 transition-colors"
            title="Página Inicial"
          >
            <Home className="w-5 h-5 text-slate-600 group-hover:text-lime-600 transition-colors" />
            <span className="text-[10px] font-medium text-slate-600 group-hover:text-lime-600">
              Início
            </span>
          </button>
        )}

        {/* BairrosCity Link */}
        {onNavigateBairrosCity && (
          <button
            onClick={onNavigateBairrosCity}
            className="flex flex-col items-center gap-1 group w-full py-1 hover:bg-slate-50 transition-colors relative"
            title="Aba BairrosCity (Comunidade)"
          >
            <Users className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors" />
            <span className="text-[9px] font-bold text-slate-700 group-hover:text-purple-600 text-center leading-tight">
              BairrosCity
            </span>
            <span className="w-2 h-2 rounded-full bg-lime-400 absolute top-1 right-2" />
          </button>
        )}

        {/* Role-Specific Manager / Resident Option */}
        {currentUser?.role === 'empresa' && onOpenCompanyManager ? (
          <button
            onClick={onOpenCompanyManager}
            className="flex flex-col items-center gap-1 group w-full py-1 hover:bg-slate-50 transition-colors"
            title="Gerenciar Minha Empresa"
          >
            <Building2 className="w-5 h-5 text-lime-600 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold text-lime-700 text-center leading-tight">
              Empresa
            </span>
          </button>
        ) : currentUser?.role === 'morador' && onOpenResidentProfile ? (
          <button
            onClick={onOpenResidentProfile}
            className="flex flex-col items-center gap-1 group w-full py-1 hover:bg-slate-50 transition-colors"
            title="Opções do Morador"
          >
            <User className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold text-emerald-700 text-center leading-tight">
              Morador
            </span>
          </button>
        ) : null}

        {/* Salvos (Saved places) */}
        <button
          onClick={onOpenSaved}
          className="flex flex-col items-center gap-1 group w-full py-1 hover:bg-slate-50 transition-colors relative"
          title="Locais Salvos"
        >
          <Bookmark className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-[10px] font-medium text-slate-600 group-hover:text-blue-600">
            Salvos
          </span>
          {savedCount > 0 && (
            <span className="absolute top-1 right-3.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>

        {/* Recentes (Recent history) */}
        <button
          onClick={onOpenRecent}
          className="flex flex-col items-center gap-1 group w-full py-1 hover:bg-slate-50 transition-colors"
          title="Pesquisas Recentes"
        >
          <History className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-[10px] font-medium text-slate-600 group-hover:text-blue-600">
            Recentes
          </span>
        </button>

        {/* + Cadastrar */}
        <button
          onClick={onOpenRegister}
          className="flex flex-col items-center gap-1 group w-full py-1 hover:bg-slate-50 transition-colors text-blue-600"
          title="Cadastrar Nova Empresa ou Evento"
        >
          <PlusCircle className="w-5 h-5 text-lime-600" />
          <span className="text-[9px] font-bold text-lime-700">
            Cadastrar
          </span>
        </button>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Baixar o aplicativo */}
        <button
          onClick={() => {
            alert('Você pode usar o BairrosCity pelo navegador no celular ou computador!');
          }}
          className="flex flex-col items-center gap-1 group w-full py-2 hover:bg-slate-50 transition-colors text-slate-600"
          title="Informações do App"
        >
          <Smartphone className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
          <span className="text-[9px] text-center font-medium leading-tight px-1 text-slate-600 group-hover:text-blue-600">
            App Mobile
          </span>
        </button>
      </div>
    </aside>
  );
};
