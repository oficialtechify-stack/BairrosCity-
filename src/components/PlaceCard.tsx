import React from 'react';
import { Place } from '../types';
import { CATEGORY_CONFIG } from '../data/initialPlaces';
import { formatDistance } from '../utils/distance';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  ExternalLink, 
  Sparkles,
  Utensils,
  Coffee,
  ShoppingBag,
  Trees,
  PartyPopper,
  Store
} from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  isSelected?: boolean;
  onSelect: (place: Place) => void;
  onOpenDetails: (place: Place) => void;
}

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  Coffee,
  ShoppingBag,
  Trees,
  Calendar,
  PartyPopper,
  Store,
};

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isSelected = false,
  onSelect,
  onOpenDetails,
}) => {
  const categoryMeta = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.restaurant;
  const CategoryIcon = ICON_COMPONENTS[categoryMeta.icon] || Store;

  return (
    <div
      id={`place-card-${place.id}`}
      onClick={() => onSelect(place)}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden bg-white ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-lg -translate-y-0.5'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row h-full">
        {/* Thumbnail Image */}
        <div className="relative w-full sm:w-44 h-40 sm:h-auto min-h-[140px] shrink-0 overflow-hidden bg-slate-100">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // fallback image if broken
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />

          {/* Category Pill on Image */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/90 shadow-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryMeta.color }}
            />
            <span className="text-slate-800 font-medium text-[11px]">
              {categoryMeta.name}
            </span>
          </div>

          {/* Event Badge */}
          {place.isEvent && (
            <div className="absolute bottom-2.5 left-2.5 sm:bottom-auto sm:top-2.5 sm:left-auto sm:right-2.5 px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Evento</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {place.subCategory}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {place.name}
                </h3>
              </div>

              {/* Star Rating Badge */}
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">
                  {place.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({place.reviewsCount})
                </span>
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {place.description}
            </p>

            {/* Event Specific Info */}
            {place.isEvent && place.eventDate && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-purple-700 bg-purple-50/70 border border-purple-100 px-2.5 py-1 rounded-md">
                <div className="flex items-center gap-1 font-semibold">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(place.eventDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
                {place.eventTime && (
                  <div className="flex items-center gap-1 text-slate-500 font-normal">
                    <Clock className="w-3 h-3" />
                    <span>{place.eventTime}</span>
                  </div>
                )}
                {place.isFree && (
                  <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded text-[10px]">
                    Gratuito
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1 truncate text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{place.neighborhood} • {place.city}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {place.distanceKm !== undefined && (
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                  {formatDistance(place.distanceKm)}
                </span>
              )}

              <button
                id={`open-detail-btn-${place.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(place);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                title="Ver avaliações e detalhes"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Avaliações</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
