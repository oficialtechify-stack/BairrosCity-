import React, { useState } from 'react';
import { Place, Review } from '../types';
import { CATEGORY_CONFIG } from '../data/initialPlaces';
import { formatDistance } from '../utils/distance';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Share2,
  Bookmark,
  Navigation,
  Check,
  Calendar,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Map as MapIcon,
  List
} from 'lucide-react';

interface GooglePlacePanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  selectedPlace: Place | null;
  onClosePlace: () => void;
  filteredPlaces: Place[];
  onSelectPlace: (place: Place) => void;
  onAddReview: (placeId: string, review: Omit<Review, 'id' | 'date'>) => void;
  onOpenRegister: () => void;
  savedPlaceIds: string[];
  onToggleSavePlace: (placeId: string) => void;
}

export const GooglePlacePanel: React.FC<GooglePlacePanelProps> = ({
  isOpen,
  onToggleOpen,
  selectedPlace,
  onClosePlace,
  filteredPlaces,
  onSelectPlace,
  onAddReview,
  onOpenRegister,
  savedPlaceIds,
  onToggleSavePlace,
}) => {
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('Morador Local');
  const [commentText, setCommentText] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [hoursExpanded, setHoursExpanded] = useState<boolean>(false);

  const isSaved = selectedPlace ? savedPlaceIds.includes(selectedPlace.id) : false;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) return;

    if (!commentText.trim()) {
      setReviewError('Por favor, escreva seu comentário sobre o local.');
      return;
    }

    onAddReview(selectedPlace.id, {
      author: authorName.trim() || 'Morador da Região',
      rating: reviewRating,
      comment: commentText.trim(),
      userRole: userRole.trim() || 'Visitante',
    });

    setReviewSuccess(true);
    setReviewError('');
    setCommentText('');
    setAuthorName('');
    setShowReviewForm(false);
    setActiveTab('reviews');

    setTimeout(() => {
      setReviewSuccess(false);
    }, 4000);
  };

  const handleShare = () => {
    if (!selectedPlace) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Confira ${selectedPlace.name} em ${selectedPlace.neighborhood} no BairroMap!`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleDirections = () => {
    if (!selectedPlace) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* 1. WHEN MINIMIZED: Floating Re-expand Button on Left Edge + Bottom Pill */}
      {!isOpen && (
        <>
          {/* Authentic Google Maps Side Tab to Expand Panel - centered vertically away from top bar */}
          <button
            id="google-maps-expand-panel-btn"
            type="button"
            onClick={onToggleOpen}
            className="absolute top-1/2 -translate-y-1/2 left-16 z-[420] bg-white text-slate-700 hover:text-blue-600 rounded-r-lg shadow-md border-y border-r border-slate-300 py-4 px-1.5 flex flex-col items-center justify-center gap-1.5 transition-all hover:pl-2.5 group cursor-pointer"
            title="Mostrar painel de locais"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
            <span className="[writing-mode:vertical-rl] text-[10px] font-bold text-slate-500 group-hover:text-blue-600 uppercase tracking-wider">
              Locais
            </span>
          </button>

          {/* Bottom Floating Pill Button (great for mobile & instant discovery) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[420] pointer-events-auto">
            <button
              id="google-maps-show-list-bottom-btn"
              type="button"
              onClick={onToggleOpen}
              className="px-5 py-2.5 rounded-full bg-white/95 hover:bg-white text-slate-900 font-bold text-xs shadow-xl border border-slate-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <List className="w-4 h-4 text-blue-600" />
              <span>Mostrar lista de locais ({filteredPlaces.length})</span>
            </button>
          </div>
        </>
      )}

      {/* 2. WHEN OPEN: Full Google Maps Sliding Panel */}
      <div
        id="google-maps-left-panel-container"
        className={`absolute top-0 bottom-0 left-16 z-[400] transition-transform duration-300 ease-out flex ${
          isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {/* Sleek Google Maps Collapse Tab attached to the right side of the panel */}
        <button
          id="google-maps-collapse-panel-tab"
          type="button"
          onClick={onToggleOpen}
          className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 w-4 h-12 bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 rounded-r-md shadow-md border-y border-r border-slate-300 flex items-center justify-center cursor-pointer transition-all hover:w-5 group"
          title="Minimizar painel lateral"
        >
          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Main Panel Box */}
        <div className="w-[360px] sm:w-[410px] max-w-[calc(100vw-70px)] h-full bg-white shadow-2xl border-r border-slate-200 flex flex-col overflow-hidden relative">
          
          {/* Top Spacing to not collide with floating Google Search bar */}
          <div className="h-16 shrink-0 bg-slate-50/60 border-b border-slate-100" />

          {/* PROMINENT MINIMIZE / COLLAPSE ACTION BAR */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                {selectedPlace ? selectedPlace.name : `Locais (${filteredPlaces.length})`}
              </span>
            </div>

            {/* Clear, explicit Minimize Button */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-minimizar-painel-topo"
                type="button"
                onClick={onToggleOpen}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-600 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Minimizar esta parte e ver o mapa"
              >
                <MapIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Minimizar</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onToggleOpen}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                title="Fechar painel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Rendering: Place Details View vs. Places List View */}
          {selectedPlace ? (
            /* PLACE DETAILS VIEW */
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Hero Place Image Header */}
              <div className="relative w-full h-48 shrink-0 bg-slate-100 overflow-hidden">
                <img
                  src={selectedPlace.imageUrl}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Return to list button */}
                <button
                  onClick={onClosePlace}
                  className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 hover:text-blue-600 font-bold text-xs flex items-center gap-1 shadow-md transition-transform hover:scale-105"
                  title="Voltar à lista"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                {/* Category tag on image */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_CONFIG[selectedPlace.category]?.color || '#ea580c',
                    }}
                  />
                  <span>{selectedPlace.subCategory}</span>
                </div>

                {selectedPlace.isEvent && (
                  <div className="absolute top-3 right-3 bg-purple-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Evento</span>
                  </div>
                )}
              </div>

              {/* Place Title & Rating */}
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {selectedPlace.name}
                </h2>

                {/* Rating Stars row */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedPlace.rating.toFixed(1)}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(selectedPlace.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    ({selectedPlace.reviewsCount} avaliações)
                  </span>
                  {selectedPlace.priceRange && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-700">
                        {selectedPlace.priceRange}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedPlace.description}
                </p>
              </div>

              {/* Google Action Buttons (Round Circle Icons + Text below) */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-around gap-1 bg-slate-50/50">
                {/* Rotas */}
                <button
                  onClick={handleDirections}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
                    <Navigation className="w-4 h-4 fill-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 group-hover:underline">
                    Rotas
                  </span>
                </button>

                {/* Salvar */}
                <button
                  onClick={() => onToggleSavePlace(selectedPlace.id)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors shadow-xs ${
                      isSaved
                        ? 'bg-blue-50 border-blue-300 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-700 group-hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">
                    {isSaved ? 'Salvo' : 'Salvar'}
                  </span>
                </button>

                {/* WhatsApp */}
                {selectedPlace.whatsapp && (
                  <a
                    href={`https://wa.me/55${selectedPlace.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá! Encontrei a ${selectedPlace.name} no BairroMap e gostaria de informações.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 transition-colors">
                      <MessageCircle className="w-4 h-4 fill-white" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">
                      WhatsApp
                    </span>
                  </a>
                )}

                {/* Ligar */}
                {selectedPlace.phone && (
                  <a
                    href={`tel:${selectedPlace.phone.replace(/\D/g, '')}`}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs group-hover:bg-slate-100 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">
                      Ligar
                    </span>
                  </a>
                )}

                {/* Compartilhar */}
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs group-hover:bg-slate-100 transition-colors">
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">
                    {copiedLink ? 'Copiado!' : 'Compartilhar'}
                  </span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-white">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Visão geral
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Avaliações</span>
                  <span className="bg-slate-100 px-1.5 py-0.2 rounded-full text-[10px] text-slate-600">
                    {selectedPlace.reviewsCount}
                  </span>
                </button>
              </div>

              {/* TAB 1: VISÃO GERAL */}
              {activeTab === 'overview' && (
                <div className="p-4 space-y-3.5 text-xs text-slate-700">
                  {/* Event Date & Time */}
                  {selectedPlace.isEvent && selectedPlace.eventDate && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-900">
                      <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs">Data do Evento</div>
                        <div className="text-[11px] text-purple-700 mt-0.5">
                          {new Date(selectedPlace.eventDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                          })}
                          {selectedPlace.eventTime ? ` • ${selectedPlace.eventTime}` : ''}
                        </div>
                        {selectedPlace.isFree && (
                          <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Entrada Gratuita
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-3 py-1">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">
                        {selectedPlace.address}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {selectedPlace.neighborhood}, {selectedPlace.city}
                      </div>
                      {selectedPlace.distanceKm !== undefined && (
                        <div className="text-blue-600 font-semibold text-[11px] mt-0.5">
                          a {formatDistance(selectedPlace.distanceKm)} de você
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hours */}
                  {selectedPlace.hours && (
                    <div className="flex items-start gap-3 py-1 border-t border-slate-100 pt-2.5">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setHoursExpanded(!hoursExpanded)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-700">Aberto agora</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 text-[11px]">
                              {selectedPlace.hours}
                            </span>
                          </div>
                          {hoursExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        {hoursExpanded && (
                          <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg space-y-1">
                            <div>Segunda a Sexta: 07:00 - 21:00</div>
                            <div>Sábado: 07:00 - 20:00</div>
                            <div>Domingo: 07:00 - 14:00</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {selectedPlace.phone && (
                    <div className="flex items-center gap-3 py-1 border-t border-slate-100 pt-2.5">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                      <a
                        href={`tel:${selectedPlace.phone.replace(/\D/g, '')}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {selectedPlace.phone}
                      </a>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedPlace.tags && selectedPlace.tags.length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Destaques & Serviços
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlace.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Write review CTA */}
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      onClick={() => {
                        setActiveTab('reviews');
                        setShowReviewForm(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                      <span>Escrever uma avaliação</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: AVALIAÇÕES */}
              {activeTab === 'reviews' && (
                <div className="p-4 space-y-4">
                  {/* Overall Score */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="text-center shrink-0">
                      <div className="text-3xl font-extrabold text-slate-900 leading-none">
                        {selectedPlace.rating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center text-amber-500 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= Math.round(selectedPlace.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {selectedPlace.reviewsCount} opiniões
                      </div>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = selectedPlace.reviews.filter((r) => r.rating === stars).length;
                        const pct =
                          selectedPlace.reviewsCount > 0
                            ? (count / selectedPlace.reviewsCount) * 100
                            : 0;
                        return (
                          <div key={stars} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="w-2">{stars}</span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Button to open review form */}
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>Avaliar este estabelecimento</span>
                    </button>
                  ) : (
                    /* INLINE REVIEW FORM */
                    <form
                      onSubmit={handleSubmitReview}
                      className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-xs text-slate-900">Sua Avaliação</span>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>

                      {/* Stars */}
                      <div className="flex flex-col items-center py-1">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              className="p-1 cursor-pointer transition-transform hover:scale-125"
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  star <= (hoverRating || reviewRating)
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Seu nome"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          placeholder="Conte sua experiência detalhada..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {reviewError && (
                        <div className="text-rose-600 text-[11px] font-semibold">
                          {reviewError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publicar Avaliação</span>
                      </button>
                    </form>
                  )}

                  {reviewSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Sua avaliação foi publicada com sucesso!</span>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-3 pt-2">
                    {selectedPlace.reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-slate-100 pb-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center uppercase">
                              {rev.author.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900 leading-none">
                                {rev.author}
                              </div>
                              {rev.userRole && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {rev.userRole}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed pl-9">
                          {rev.comment}
                        </p>

                        <div className="text-[10px] text-slate-400 pl-9">{rev.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* PLACES LIST / SEARCH RESULTS VIEW */
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Header of results with quick register CTA */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">
                    {filteredPlaces.length} empresas e pontos encontrados
                  </span>
                </div>

                <button
                  onClick={onOpenRegister}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Cadastrar</span>
                </button>
              </div>

              {/* Places List Items in Google Maps style */}
              <div className="divide-y divide-slate-100">
                {filteredPlaces.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <Info className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium">
                      Nenhum local encontrado para esta pesquisa.
                    </p>
                    <button
                      onClick={onOpenRegister}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Deseja cadastrar uma nova empresa ou evento?
                    </button>
                  </div>
                ) : (
                  filteredPlaces.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => onSelectPlace(place)}
                      className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 group"
                    >
                      {/* Left info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {place.name}
                        </h4>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                          <span className="font-bold text-slate-900">
                            {place.rating.toFixed(1)}
                          </span>
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= Math.round(place.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            ({place.reviewsCount})
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 mt-1 truncate">
                          {place.subCategory} • {place.neighborhood}
                        </div>

                        {place.hours && (
                          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                            Aberto • {place.hours.split('•')[0]}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Google Maps Desktop Side Tab Button (attached to right border, never cut off) */}
        <button
          id="google-maps-collapse-panel-tab"
          type="button"
          onClick={onToggleOpen}
          className="self-center -ml-[1px] w-6 h-14 bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 rounded-r-lg border border-l-0 border-slate-300 shadow-md flex items-center justify-center transition-colors cursor-pointer group shrink-0"
          title="Recolher painel e ver o mapa completo"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </>
  );
};
