import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  Check,
  Building2,
  MousePointerClick,
  Store,
  Sparkles,
  Ticket,
  Image as ImageIcon,
  LogIn
} from 'lucide-react';
import { Place, CategoryType, UserProfile } from '../types';
import { CATEGORY_CONFIG, NEIGHBORHOODS } from '../data/initialPlaces';
import { loginWithGoogle } from '../services/authService';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlace: (placeData: Omit<Place, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt'>) => void;
  pickedCoord?: { lat: number; lng: number } | null;
  onStartPickingLocation: () => void;
  currentUser: UserProfile | null;
  onUserRoleUpdated: (updatedUser: UserProfile) => void;
  onOpenAuthModal?: () => void;
  onOpenCompanyManager?: () => void;
}

const PRESET_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
];

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSavePlace,
  pickedCoord,
  onStartPickingLocation,
  currentUser,
  onUserRoleUpdated,
  onOpenAuthModal,
  onOpenCompanyManager,
}) => {
  const [name, setName] = useState('');
  const [subCategory, setSubCategory] = useState('Feira Gastronômica & Cultural');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || 'Curado IV');
  const [city, setCity] = useState('Recife');
  const [whatsapp, setWhatsapp] = useState(currentUser?.phone || '');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_EVENT_IMAGES[0]);

  // Event specific fields
  const [eventDate, setEventDate] = useState('2026-09-12');
  const [eventEndDate, setEventEndDate] = useState('2026-09-13');
  const [eventTime, setEventTime] = useState('17:00 às 23:00');
  const [isFree, setIsFree] = useState(true);
  const [ticketInfo, setTicketInfo] = useState('');

  // Map coordinates
  const [lat, setLat] = useState<number>(-8.0645);
  const [lng, setLng] = useState<number>(-34.9855);

  const [error, setError] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (pickedCoord) {
      setLat(pickedCoord.lat);
      setLng(pickedCoord.lng);
    }
  }, [pickedCoord]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoadingGoogle(true);
    try {
      const user = await loginWithGoogle('morador');
      onUserRoleUpdated(user);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Falha ao autenticar com o Google.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do evento.');
      return;
    }
    if (!address.trim()) {
      setError('Por favor, informe o local ou endereço do evento.');
      return;
    }

    onSavePlace({
      name: name.trim(),
      category: 'event',
      subCategory: subCategory.trim() || 'Evento Comunitário',
      description: description.trim() || 'Evento aberto para toda a comunidade do bairro!',
      address: address.trim(),
      neighborhood: neighborhood.trim() || 'Curado IV',
      city: city.trim() || 'Recife',
      lat,
      lng,
      whatsapp: whatsapp.trim() || undefined,
      phone: phone.trim() || undefined,
      imageUrl: imageUrl.trim() || PRESET_EVENT_IMAGES[0],
      isRegisteredCompany: false,
      isEvent: true,
      eventDate,
      eventEndDate: eventEndDate || undefined,
      eventTime,
      isFree,
      priceRange: isFree ? '$' : '$$',
      tags: [
        'Evento',
        subCategory.trim(),
        neighborhood.trim(),
        isFree ? 'Gratuito' : 'Ingressos',
        'BairrosCity',
      ].filter(Boolean),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="register-modal-backdrop"
      className="fixed inset-0 z-[1250] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="register-modal-content"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Cadastrar Evento ou Lazer no Mapa
              </h2>
              <p className="text-[11px] text-slate-400">
                Divulgue programações culturais, feiras comunitárias e lazer no seu bairro
              </p>
            </div>
          </div>
          <button
            id="close-register-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONDITION 1: NOT LOGGED IN */}
        {!currentUser && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Faça login para cadastrar um evento</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                Para publicar programações no mapa do bairro, é necessário estar conectado com sua conta.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs text-left">
                {error}
              </div>
            )}

            <div className="space-y-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loadingGoogle}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {loadingGoogle ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
                <span>Entrar com o Google</span>
              </button>

              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <LogIn className="w-4 h-4 text-purple-400" />
                  <span>Cadastrar ou Entrar com E-mail</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* CONDITION 2: LOGGED IN - FORM DEDICATED TO EVENTS */}
        {currentUser && (
          <>
            {/* Active Mode Banner: Only Event / Feira / Lazer */}
            <div className="px-4 sm:px-6 pt-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-xs font-bold text-purple-300">Publicação de Evento / Feira / Lazer Comunitário</span>
                </div>
                {onOpenCompanyManager && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCompanyManager();
                    }}
                    className="text-[11px] text-lime-400 hover:text-lime-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Cadastrar Empresa Fixa?</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-3 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs">
                {error}
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nome do Evento */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome do Evento / Feira / Atração *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Feira de Artesanato do Curado, Festival de Música"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Tipo / Ramo do Evento */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tipo de Evento / Programação *
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Feira Gastronômica & Comunitária">Feira Gastronômica & Comunitária</option>
                    <option value="Feira de Artesanato & Moda">Feira de Artesanato & Moda</option>
                    <option value="Show & Música ao Vivo">Show & Música ao Vivo</option>
                    <option value="Torneio ou Atividade Esportiva">Torneio ou Atividade Esportiva</option>
                    <option value="Atração Infantil & Recreação">Atração Infantil & Recreação</option>
                    <option value="Teatro & Apresentação Cultural">Teatro & Apresentação Cultural</option>
                    <option value="Bazar Beneficente & Trocas">Bazar Beneficente & Trocas</option>
                    <option value="Outro Lazer Comunitário">Outro Lazer Comunitário</option>
                  </select>
                </div>
              </div>

              {/* Datas e Horários */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Horário da Programação
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="Ex: 17:00 às 22:00"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Entrada Gratuita ou Paga & Bairro */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Entrada / Ingresso
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFree(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isFree ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Gratuito
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFree(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !isFree ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Pago / Ingresso
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Bairro de Realização *
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-400"
                  >
                    {NEIGHBORHOODS.map((nb) => (
                      <option key={nb} value={nb} className="bg-slate-900 text-white">
                        {nb}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Endereço & Referência */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Endereço & Ponto de Referência do Evento *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Praça central, quadra de esportes, rua ou galpão"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* WhatsApp de Contato / Informações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    WhatsApp do Organizador / Informações
                  </label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 absolute left-3 top-2.5 text-emerald-400" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(81) 98888-7777"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Telefone de Apoio (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(81) 3333-2222"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Descrição da Programação & Atrações
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes dos shows, expositores, horários das apresentações, estrutura..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Imagem / Cartaz Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Cartaz ou Foto do Evento
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_EVENT_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(img)}
                      className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        imageUrl === img ? 'border-purple-400 scale-[1.02]' : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <img src={img} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Localização no mapa */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>Ponto Exato no Mapa do Bairro</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStartPickingLocation}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Escolher no Mapa</span>
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirmar e Publicar Evento no Mapa</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
