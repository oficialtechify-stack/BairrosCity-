import React from 'react';
import { CategoryType, DistanceFilter, DateFilter, SortOption } from '../types';
import { CATEGORY_CONFIG } from '../data/initialPlaces';
import {
  Search,
  SlidersHorizontal,
  Navigation,
  Calendar,
  Layers,
  Utensils,
  Coffee,
  ShoppingBag,
  Trees,
  PartyPopper,
  Store,
  X,
  Compass,
} from 'lucide-react';

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: CategoryType | 'all';
  onSelectCategory: (cat: CategoryType | 'all') => void;
  distanceFilter: DistanceFilter;
  onDistanceChange: (dist: DistanceFilter) => void;
  dateFilter: DateFilter;
  onDateChange: (date: DateFilter) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  hasUserLocation: boolean;
  onRequestLocation: () => void;
  totalFilteredCount: number;
  onResetFilters: () => void;
  isFiltersActive: boolean;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  restaurant: Utensils,
  cafe: Coffee,
  shopping: ShoppingBag,
  leisure: Trees,
  event: Calendar,
  nightlife: PartyPopper,
  services: Store,
};

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  distanceFilter,
  onDistanceChange,
  dateFilter,
  onDateChange,
  sortOption,
  onSortChange,
  hasUserLocation,
  onRequestLocation,
  totalFilteredCount,
  onResetFilters,
  isFiltersActive,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-3 space-y-3">
      {/* Search Input and Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-places-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar restaurante, shopping, praça, evento, pizza..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Distance, Date and GPS Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {/* Geolocation Button */}
          <button
            id="gps-toggle-btn"
            type="button"
            onClick={onRequestLocation}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              hasUserLocation
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Usar minha localização para calcular distâncias"
          >
            <Navigation
              className={`w-3.5 h-3.5 ${hasUserLocation ? 'fill-blue-600 text-blue-600' : 'text-slate-500'}`}
            />
            <span>{hasUserLocation ? 'Meu Local Ativo' : 'Ativar Meu GPS'}</span>
          </button>

          {/* Distance Filter Selector */}
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shrink-0 border border-slate-200/60">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 text-[11px]">Raio:</span>
            <select
              id="distance-filter-select"
              value={distanceFilter}
              onChange={(e) => onDistanceChange(Number(e.target.value) as DistanceFilter)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={0}>Sem limite</option>
              <option value={1}>Até 1 km</option>
              <option value={3}>Até 3 km</option>
              <option value={5}>Até 5 km</option>
              <option value={10}>Até 10 km</option>
              <option value={25}>Até 25 km</option>
            </select>
          </div>

          {/* Date Filter Selector (for events/outings) */}
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shrink-0 border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-slate-400 text-[11px]">Data:</span>
            <select
              id="date-filter-select"
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value as DateFilter)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as datas</option>
              <option value="today">Hoje</option>
              <option value="tomorrow">Amanhã</option>
              <option value="weekend">Fim de Semana</option>
              <option value="week">Próximos 7 dias</option>
              <option value="month">Este Mês</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shrink-0 border border-slate-200/60">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="sort-option-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="rating">★ Mais Avaliados</option>
              <option value="distance">📍 Mais Próximos</option>
              <option value="reviews">💬 Mais Comentados</option>
              <option value="newest">✨ Mais Recentes</option>
              <option value="name">🔤 Nome (A-Z)</option>
            </select>
          </div>

          {/* Clear Filters Button if active */}
          {isFiltersActive && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0"
              title="Limpar todos os filtros"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All Categories Chip */}
        <button
          id="category-pill-all"
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Todos os Locais</span>
        </button>

        {/* Category List Chips with Custom Colors and Icons */}
        {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
          const IconComp = CATEGORY_ICONS[catKey] || Store;
          const isSelected = selectedCategory === catKey;

          return (
            <button
              key={catKey}
              id={`category-pill-${catKey}`}
              type="button"
              onClick={() => onSelectCategory(catKey as CategoryType)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
              style={{
                backgroundColor: isSelected ? config.color : undefined,
              }}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{config.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
