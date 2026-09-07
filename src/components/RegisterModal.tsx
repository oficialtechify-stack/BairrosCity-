import React, { useState, useEffect } from 'react';
import { CategoryType, Place } from '../types';
import { CATEGORY_CONFIG, NEIGHBORHOODS } from '../data/initialPlaces';
import {
  X,
  Store,
  Calendar,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Instagram,
  Image as ImageIcon,
  Sparkles,
  Check,
  MousePointerClick,
  Upload,
  Camera,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlace: (place: Omit<Place, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt'>) => void;
  pickedCoord: { lat: number; lng: number } | null;
  onStartPickingLocation: () => void;
}

const PRESET_IMAGES: Record<string, string[]> = {
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1567449303078-57ad995bd301?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80',
  ],
  leisure: [
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80',
  ],
  event: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
  ],
  nightlife: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&auto=format&fit=crop&q=80',
  ],
  services: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
  ],
};

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSavePlace,
  pickedCoord,
  onStartPickingLocation,
}) => {
  if (!isOpen) return null;

  const [activeType, setActiveType] = useState<'business' | 'event'>('business');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('restaurant');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Curado IV');
  const [city, setCity] = useState('Recife');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [hours, setHours] = useState('Seg a Sáb: 08:00 - 20:00');
  const [imageUrl, setImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$'>('$$');

  // Event specific
  const [eventDate, setEventDate] = useState('2026-09-12');
  const [eventEndDate, setEventEndDate] = useState('2026-09-13');
  const [eventTime, setEventTime] = useState('17:00 às 23:00');
  const [isFree, setIsFree] = useState(true);

  // Map coordinates (centered on Curado / Recife)
  const [lat, setLat] = useState<number>(-8.0645);
  const [lng, setLng] = useState<number>(-34.9855);

  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (target === 'logo') {
            setLogoUrl(reader.result);
          } else {
            setImageUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // When pickedCoord updates from map click
  useEffect(() => {
    if (pickedCoord) {
      setLat(pickedCoord.lat);
      setLng(pickedCoord.lng);
    }
  }, [pickedCoord]);

  // Handle activeType change
  useEffect(() => {
    if (activeType === 'event') {
      setCategory('event');
      if (!subCategory) setSubCategory('Feira Gastronômica & Cultural');
    } else {
      if (category === 'event') {
        setCategory('restaurant');
      }
    }
  }, [activeType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do estabelecimento ou evento.');
      return;
    }
    if (!address.trim()) {
      setError('Por favor, informe o endereço ou localização de referência.');
      return;
    }

    const finalImage =
      imageUrl.trim() ||
      PRESET_IMAGES[category]?.[0] ||
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

    const finalLogo = logoUrl.trim() || finalImage;

    onSavePlace({
      name: name.trim(),
      category,
      subCategory: subCategory.trim() || CATEGORY_CONFIG[category]?.name || 'Geral',
      description: description.trim() || 'Venha conhecer nosso espaço e serviços de qualidade no bairro!',
      address: address.trim(),
      neighborhood: neighborhood.trim() || 'Centro',
      city: city.trim() || 'Região Central',
      lat,
      lng,
      whatsapp: whatsapp.trim() || undefined,
      phone: phone.trim() || undefined,
      instagram: instagram.trim() || undefined,
      hours: hours.trim() || undefined,
      imageUrl: finalImage,
      logoUrl: finalLogo,
      isRegisteredCompany: activeType === 'business',
      isEvent: activeType === 'event',
      eventDate: activeType === 'event' ? eventDate : undefined,
      eventEndDate: activeType === 'event' ? eventEndDate : undefined,
      eventTime: activeType === 'event' ? eventTime : undefined,
      isFree: activeType === 'event' ? isFree : undefined,
      priceRange,
      tags: [
        category,
        subCategory.trim(),
        neighborhood.trim(),
        activeType === 'event' ? 'Evento' : 'Empresa Cadastrada',
        'BairrosCity',
      ].filter(Boolean),
    });

    onClose();
  };

  return (
    <div
      id="register-modal-backdrop"
      className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="register-modal-content"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Cadastrar no Mapa da Região
            </h2>
            <p className="text-xs text-slate-500">
              Divulgue sua empresa, loja, praça de lazer ou evento comunitário
            </p>
          </div>
          <button
            id="close-register-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Empresa vs Evento */}
        <div className="px-4 sm:px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveType('business')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeType === 'business'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Empresa / Estabelecimento</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveType('event')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeType === 'event'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Evento / Feira / Passeio</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do {activeType === 'event' ? 'Evento' : 'Estabelecimento'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  activeType === 'event'
                    ? 'Ex: Feira de Artesanato & Sabores'
                    : 'Ex: Restaurante Sabor da Vila'
                }
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoria Principal *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {activeType === 'business' ? (
                  <>
                    <option value="restaurant">Restaurante & Gastronomia</option>
                    <option value="cafe">Café & Padaria</option>
                    <option value="shopping">Shopping & Centro Comercial</option>
                    <option value="leisure">Praça, Parque & Lazer</option>
                    <option value="nightlife">Bar & Vida Noturna</option>
                    <option value="services">Serviços & Comércio Geral</option>
                  </>
                ) : (
                  <>
                    <option value="event">Evento & Festival</option>
                    <option value="leisure">Passeio Público / Parque</option>
                    <option value="restaurant">Feira Gastronômica</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Subcategory & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo / Subcategoria
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Ex: Pizzaria Forno a Lenha, Parque Infantil, Feira"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faixa de Preço
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="$">$ Econômico / Gratuito</option>
                <option value="$$">$$ Médio / Acessível</option>
                <option value="$$$">$$$ Premium</option>
                <option value="$$$$">$$$$ Sofisticado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição do Local ou Programação
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que a sua empresa oferece, diferenciais, pratos principais, atrações ou regras..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
            />
          </div>

          {/* EVENT-SPECIFIC FIELDS */}
          {activeType === 'event' && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
              <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Configurações do Evento</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                    Horário
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="Ex: 17:00 às 23:00"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-purple-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Evento com Entrada Gratuita para o público</span>
                </label>
              </div>
            </div>
          )}

          {/* Address & Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Endereço Completo (Rua e Número) *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 120"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bairro *
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {NEIGHBORHOODS.map((nb) => (
                  <option key={nb} value={nb}>
                    {nb}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Map Location Pin Picker */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Localização Exata no Mapa
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onStartPickingLocation();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200 shrink-0"
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>Marcar Clicando no Mapa</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Latitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 mt-0.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Longitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 mt-0.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              💡 Dica: Você pode clicar no botão acima para selecionar a posição diretamente no mapa da sua cidade ou bairro!
            </p>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp (com DDD)</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 11987654321"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Horário</span>
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Ex: Seg a Sex: 8h - 18h"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Ex: @minhaempresa"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* LOGO / FOTO DA EMPRESA (Diferencial no Mapa) */}
          <div className="p-3.5 rounded-2xl bg-lime-50/70 border border-lime-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-lime-600" />
                <span>Logo / Foto da Empresa (Aparece como foto no mapa)</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-200 text-lime-800">
                Destaque no Mapa
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Empresas cadastradas no BairrosCity aparecem com a sua própria foto/logo em um círculo destacado no mapa para se diferenciar!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2 space-y-2">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="URL do Logo ou Foto (ex: https://...)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white"
                />

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-lime-600" />
                    <span>Carregar Foto do Computador</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
              </div>

              {/* Live Pin Preview */}
              <div className="p-2.5 rounded-xl bg-white border border-lime-200 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 mb-1.5">Prévia no Mapa:</span>
                <div className="relative flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-full border-2 border-lime-500 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                    {logoUrl || imageUrl ? (
                      <img
                        src={logoUrl || imageUrl}
                        alt="Prévia"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-5 h-5 text-slate-400" />
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-lime-500 text-slate-950 font-black rounded-full text-[8px] flex items-center justify-center border border-white">
                      ✓
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">
                      {name.trim() || 'Sua Empresa'}
                    </div>
                    <span className="text-[9px] font-extrabold text-lime-700 bg-lime-100 px-1 rounded">
                      BairrosCity
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Selection / Banner */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Foto de Capa / Fachada ou Selecione uma Foto Sugerida</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Cole o link da foto de capa ou escolha abaixo..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'image')}
                />
              </label>
            </div>

            {/* Quick preset gallery */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(PRESET_IMAGES[category] || PRESET_IMAGES.restaurant).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(img)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    imageUrl === img ? 'border-indigo-600 ring-2 ring-indigo-400' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Preset" className="w-full h-full object-cover" />
                  {imageUrl === img && (
                    <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="confirm-register-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Salvar e Publicar no Mapa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
