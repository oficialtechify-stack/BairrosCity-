import React, { useState } from 'react';
import { Place, Review } from '../types';
import { CATEGORY_CONFIG } from '../data/initialPlaces';
import { formatDistance } from '../utils/distance';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  Calendar,
  Send,
  Sparkles,
  Navigation,
  CheckCircle2,
  Share2,
  ShoppingBag,
} from 'lucide-react';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  onAddReview: (placeId: string, review: Omit<Review, 'id' | 'date'>) => void;
  onCenterOnMap: (place: Place) => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  onAddReview,
  onCenterOnMap,
}) => {
  const categoryMeta = place ? (CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.restaurant) : CATEGORY_CONFIG.restaurant;

  // New review form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('Morador Local');
  const [commentText, setCommentText] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setErrorMsg('Por favor, escreva um comentário sobre sua experiência.');
      return;
    }

    const finalAuthor = authorName.trim() || 'Visitante do Bairro';

    onAddReview(place.id, {
      author: finalAuthor,
      rating,
      comment: commentText.trim(),
      userRole: userRole.trim() || 'Morador Local',
    });

    setSubmittedSuccess(true);
    setErrorMsg('');
    setCommentText('');
    setAuthorName('');

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4000);
  };

  const handleShare = () => {
    if (!place) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Confira ${place.name} em ${place.neighborhood} no BairroMap!`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!place) return null;

  // Compute rating distribution
  const ratingsCount = [5, 4, 3, 2, 1].map((stars) => {
    const count = place.reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = place.reviews.length > 0 ? (count / place.reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div
      id="place-detail-backdrop"
      className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="place-detail-card"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Media Banner */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Top action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              id="share-place-btn"
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              title="Compartilhar local"
            >
              {copiedLink ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
            <button
              id="close-place-detail-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              title="Fechar detalhes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category & Badge overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/20 text-white border border-white/30 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryMeta.color }}
                />
                {categoryMeta.name} • {place.subCategory}
              </span>

              {place.isEvent && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Evento Especial
                </span>
              )}

              {place.distanceKm !== undefined && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/90 text-white">
                  📍 {formatDistance(place.distanceKm)} de distância
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-sm">
              {place.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Actions & Contact Bar */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
            {place.whatsapp && (
              <a
                href={`https://wa.me/55${place.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                onCenterOnMap(place);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Ver no Mapa</span>
            </button>

            {place.phone && (
              <a
                href={`tel:${place.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{place.phone}</span>
              </a>
            )}

            {place.instagram && (
              <a
                href={`https://instagram.com/${place.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>{place.instagram}</span>
              </a>
            )}

            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Website</span>
              </a>
            )}
          </div>

          {/* Description & Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Sobre o Local
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{place.description}</p>
          </div>

          {/* Address & Hours Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Endereço & Bairro</div>
                <div className="text-xs text-slate-600 mt-0.5">{place.address}</div>
                <div className="text-xs text-slate-500 font-medium">
                  {place.neighborhood} • {place.city}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Funcionamento</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {place.hours || 'Consulte os horários pelo WhatsApp'}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS & CATALOG SECTION */}
          {place.productsOrServices && place.productsOrServices.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Catálogo de Produtos & Serviços ({place.productsOrServices.length})
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Cardápio Disponível
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {place.productsOrServices.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors flex gap-3 items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{prod.name}</div>
                        {prod.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</div>
                        )}
                        {prod.price && (
                          <div className="text-xs font-black text-emerald-600 mt-0.5">{prod.price}</div>
                        )}
                      </div>
                    </div>

                    {place.whatsapp && (
                      <a
                        href={`https://wa.me/55${place.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá! Vi o produto "${prod.name}" (${prod.price || ''}) no BairroMap e gostaria de pedir.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] shrink-0 border border-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Pedir</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Specific Date Block */}
          {place.isEvent && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-900">Data do Evento</div>
                  <div className="text-sm font-extrabold text-purple-700">
                    {place.eventDate &&
                      new Date(place.eventDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                  </div>
                  {place.eventTime && (
                    <div className="text-xs text-purple-600 font-medium">
                      Horário: {place.eventTime}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${
                    place.isFree
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {place.isFree ? 'Entrada Gratuita' : 'Entrada / Ingresso'}
                </span>
              </div>
            </div>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {place.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* REVIEWS & RATINGS SECTION */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Avaliações & Opiniões de Clientes
                </h3>
                <p className="text-xs text-slate-500">
                  Quem visitou ou comprou aqui compartilha sua nota em estrelas e relato
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-black text-slate-900">
                    {place.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400 font-normal">/ 5.0</span>
                </div>
                <div className="text-xs text-slate-500">
                  {place.reviewsCount} {place.reviewsCount === 1 ? 'avaliação' : 'avaliações'}
                </div>
              </div>
            </div>

            {/* Distribution Bars */}
            <div className="bg-slate-50 p-3.5 rounded-2xl mb-6 space-y-1.5 border border-slate-100">
              {ratingsCount.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-semibold text-slate-600 flex items-center gap-0.5">
                    {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-400 font-mono">{count}</span>
                </div>
              ))}
            </div>

            {/* Form to Add Review */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Você foi neste local? Deixe sua avaliação</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Sua nota ajuda vizinhos e visitantes a descobrirem os melhores lugares da região!
              </p>

              {submittedSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sua avaliação foi publicada com sucesso e já está no mapa!</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                {/* Interactive Star Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sua nota em estrelas:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = (hoverRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-300 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {rating === 5 && '🌟 Excelente!'}
                      {rating === 4 && '👍 Muito bom'}
                      {rating === 3 && '👌 Regular'}
                      {rating === 2 && '👎 Deixou a desejar'}
                      {rating === 1 && '⚠️ Não recomendo'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Seu Nome ou Apelido
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Você é da região?
                    </label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Morador Local">Morador do Bairro</option>
                      <option value="Cliente Frequente">Cliente Frequente</option>
                      <option value="Visitante / Turista">Visitante / De outra cidade</option>
                      <option value="A Trabalho">Passando a trabalho</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seu comentário / opinião sobre o estabelecimento *
                  </label>
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Conte o que achou da comida, atendimento, ambiente, preços ou dicas para quem for visitar..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
                  />
                </div>

                <button
                  id="submit-review-btn"
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Avaliação</span>
                </button>
              </form>
            </div>

            {/* List of Existing Reviews */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Comentários Recentes ({place.reviews.length})
              </h4>

              {place.reviews.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                  Nenhuma avaliação ainda. Seja o primeiro a avaliar este estabelecimento!
                </div>
              ) : (
                place.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {rev.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {rev.author}
                            </span>
                            {rev.userRole && (
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                {rev.userRole}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
