import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Compass, 
  Star, 
  Navigation, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  Layers, 
  MessageSquare, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Search,
  Users,
  Eye,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Place, CategoryType, UserProfile } from '../types';
import { CATEGORY_CONFIG, NEIGHBORHOODS } from '../data/initialPlaces';

// Google Brand Icon
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

interface LandingPageProps {
  places: Place[];
  onNavigateToMap: (place?: Place) => void;
  onNavigateToBairrosCity: (neighborhood?: string) => void;
  onOpenRegisterCompany: () => void;
  onOpenAuth: () => void;
  currentUser: UserProfile | null;
  onLogout?: () => void;
  onRequestLocation: () => void;
  onGoogleSignIn?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  places,
  onNavigateToMap,
  onNavigateToBairrosCity,
  onOpenRegisterCompany,
  onOpenAuth,
  currentUser,
  onLogout,
  onRequestLocation: _onRequestLocation,
  onGoogleSignIn,
}) => {
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<CategoryType | 'all'>('all');

  const filteredCatalogPlaces = places.filter((p) => {
    if (selectedCatalogCategory === 'all') return true;
    return p.category === selectedCatalogCategory;
  });

  const totalReviewsCount = places.reduce((acc, p) => acc + (p.reviewsCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-150 font-sans selection:bg-lime-400 selection:text-slate-950">
      
      {/* 1. Header Navigation Bar (LeadsPay Style) */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070b12]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-yellow-500 p-0.5 flex items-center justify-center shadow-lg shadow-lime-400/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-lime-400 fill-lime-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-white">BAIRROSCITY</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400 border border-lime-400/30">
                  MAP & GUIA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Curado & Cidades de Pernambuco
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider text-slate-300">
            <button 
              type="button" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-white hover:text-lime-400 transition-colors cursor-pointer"
            >
              INÍCIO
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateToMap()}
              className="hover:text-lime-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-lime-400" />
              <span>MAPA REGIONAL</span>
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateToBairrosCity()}
              className="hover:text-lime-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-lime-400" />
              <span>BAIRROSCITY (COMUNIDADE)</span>
            </button>
            <button 
              type="button" 
              onClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-lime-400 transition-colors cursor-pointer"
            >
              EMPRESAS
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-2 shadow-sm">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover border border-lime-400"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                  )}
                  <span className="font-semibold truncate max-w-[120px]">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">({currentUser.role === 'empresa' ? 'Empresa' : 'Morador'})</span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 transition-colors cursor-pointer"
                  >
                    Sair
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn || onOpenAuth}
                className="hidden sm:inline-flex text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
              >
                Entrar
              </button>
            )}

            <button
              type="button"
              onClick={onOpenRegisterCompany}
              className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs tracking-wider transition-all shadow-lg shadow-lime-400/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>CADASTRAR EMPRESA</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Top Banner Pill - LeadsPay style */}
      <div className="border-b border-slate-800/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-2.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 text-xs text-slate-300 text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold text-[11px]">
            <Radio className="w-3 h-3 animate-pulse" />
            FIREBASE FIRESTORE EM TEMPO REAL
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Cadastro 100% aberto para empresas locais e feed comunitário no BairrosCity
          </span>
        </div>
      </div>

      {/* 3. Hero Section (LeadsPay Aesthetic) */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        
        {/* Neon green glow background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-lime-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-lime-400/30 text-lime-400 text-xs font-bold mb-6 shadow-md shadow-lime-500/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O MAPA DEFINITIVO DO SEU BAIRRO E DA SUA CIDADE</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            A PLATAFORMA REGIONAL QUE CONECTA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-yellow-300 to-lime-300">
              EMPRESAS E MORADORES
            </span>{' '}
            TODOS OS DIAS.
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
            Uma infraestrutura comunitária viva: empresas locais cadastram seu comércio no mapa com
            WhatsApp, fotos e localização exata. Moradores encontram estabelecimentos por raio de distância
            e participam da aba <span className="text-lime-400 font-bold">BairrosCity</span> com notícias,
            problemas comunitários e eventos individuais de cada bairro.
          </p>

          {/* Direct Google Access Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {currentUser ? (
              <button
                type="button"
                onClick={() => onNavigateToMap()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-base tracking-wide transition-all shadow-xl shadow-lime-400/25 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border-2 border-slate-950"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <span>ENTRAR NO SITE COMO {currentUser.name.toUpperCase()}</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn || onOpenAuth}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base tracking-normal transition-all shadow-2xl flex items-center justify-center gap-3.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-slate-200"
              >
                <GoogleIcon className="w-6 h-6" />
                <span className="text-slate-900 font-black tracking-wide">ENTRAR COM O GOOGLE</span>
                <ArrowRight className="w-5 h-5 text-slate-600" />
              </button>
            )}
          </div>

          {/* Quick specs chips */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Empresas Reais</p>
                <p className="text-[11px] text-slate-400">Autocadastro livre</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">BairrosCity</p>
                <p className="text-[11px] text-slate-400">Notícias e problemas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">GPS Real</p>
                <p className="text-[11px] text-slate-400">Localização exata</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Firebase Conectado</p>
                <p className="text-[11px] text-slate-400">Nuvem persistente</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Live Real-Time Metrics (LeadsPay Style) */}
      <section className="py-16 bg-slate-950 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-bold mb-3">
              <Radio className="w-3 h-3 text-lime-400" />
              <span>DADOS REAIS EM TEMPO REAL (BANCO FIRESTORE)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Métricas Reais do Ecossistema BairrosCity
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Números sincronizados diretamente da nossa base de dados ativa.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Metric 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 relative overflow-hidden group hover:border-lime-400/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-lime-400/10 text-lime-400 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                +{places.length}
              </p>
              <p className="text-xs font-bold text-slate-300 mt-1">Empresas Cadastradas</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Cadastradas no mapa</p>
            </div>

            {/* Metric 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 relative overflow-hidden group hover:border-lime-400/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 text-yellow-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                +{NEIGHBORHOODS.length}
              </p>
              <p className="text-xs font-bold text-slate-300 mt-1">Bairros Ativos</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Curado I a V & Região</p>
            </div>

            {/* Metric 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 relative overflow-hidden group hover:border-lime-400/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-400/10 text-blue-400 flex items-center justify-center mb-4">
                <Star className="w-5 h-5 fill-blue-400/20" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                +{totalReviewsCount}
              </p>
              <p className="text-xs font-bold text-slate-300 mt-1">Avaliações Feitas</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Comentários e notas</p>
            </div>

            {/* Metric 4 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 relative overflow-hidden group hover:border-lime-400/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-400/10 text-purple-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                +{places.filter(p => p.isEvent).length}
              </p>
              <p className="text-xs font-bold text-slate-300 mt-1">Eventos & Lazer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Praças, feiras e passeios</p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Dual Target Section (LeadsPay style): Para Empresas vs Para Moradores */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            A PONTE DEFINITIVA ENTRE QUEM CRIA NEGÓCIOS E QUEM VIVE O BAIRRO.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3">
            O BairrosCity nasceu para unificar a região: uma vitrine interativa onde as empresas expõem
            seus serviços e os moradores encontram soluções, relatam problemas e acompanham os eventos locais.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card: Para Empresas */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 relative hover:border-lime-400/50 transition-all shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-bold mb-4">
              <Building2 className="w-3.5 h-3.5" />
              <span>PARA EMPRESAS & COMERCIANTES</span>
            </div>

            <h3 className="text-2xl font-black text-white mb-3">
              Divulgue sua Empresa no Mapa sem Custos
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6">
              Tenha uma página própria na plataforma com endereço, horário de funcionamento, fotos, botão direto de WhatsApp e localização no Google Maps.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Cadastro simplificado aberto para comércios, restaurantes e serviços</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Pino e ícone temático de categoria destacados no mapa regional</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Receba avaliações e estrelas de clientes que frequentam seu local</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Publique comunicados e eventos diretamente no seu bairro</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={onOpenRegisterCompany}
              className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-lime-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>CADASTRAR MINHA EMPRESA NO MAPA</span>
            </button>
          </div>

          {/* Card: Para Moradores */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 relative hover:border-blue-400/50 transition-all shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/30 text-xs font-bold mb-4">
              <Users className="w-3.5 h-3.5" />
              <span>PARA MORADORES & USUÁRIOS</span>
            </div>

            <h3 className="text-2xl font-black text-white mb-3">
              Descubra Tudo no seu Bairro em Segundos
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6">
              Use sua localização GPS real para filtrar restaurantes, padarias, serviços e praças perto de você, e participe da aba de notícias e problemas comunitários.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Filtro de raio por distância (1km, 3km, 5km, 10km)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Aba BairrosCity: reporte problemas (buracos, luz apagada) com fotos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Acompanhe eventos, feiras livres e lazer no seu bairro</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Avalie os locais com comentários e classificação em estrelas</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => onNavigateToBairrosCity()}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              <Users className="w-4 h-4" />
              <span>ACESSAR COMUNIDADE BAIRROSCITY</span>
            </button>
          </div>

        </div>
      </section>

      {/* 6. Como Funciona (LeadsPay 4 Steps) */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-lime-400 tracking-wider uppercase">FLUXO OPERACIONAL COMPLETO</span>
            <h2 className="text-3xl font-black text-white mt-2">Como Funciona a Plataforma BairrosCity</h2>
            <p className="text-xs text-slate-400 mt-2">Desenvolvemos um fluxo simples, seguro e automatizado para conectar negócios e moradores.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-black text-lime-400">PASSO 01</span>
              <h4 className="text-base font-bold text-white mt-2">Cadastre sua Empresa</h4>
              <p className="text-xs text-slate-400 mt-2">
                O comerciante ou morador preenche o nome, categoria, contato de WhatsApp e aponta a localização no mapa.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-black text-lime-400">PASSO 02</span>
              <h4 className="text-base font-bold text-white mt-2">Localização GPS Real</h4>
              <p className="text-xs text-slate-400 mt-2">
                O usuário clica no botão de GPS para identificar sua posição e calcular distâncias reais em quilômetros.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-black text-lime-400">PASSO 03</span>
              <h4 className="text-base font-bold text-white mt-2">Aba BairrosCity</h4>
              <p className="text-xs text-slate-400 mt-2">
                Cada bairro possui seu espaço exclusivo para postar notícias, denunciar problemas da rua e divulgar eventos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-black text-lime-400">PASSO 04</span>
              <h4 className="text-base font-bold text-white mt-2">Estrelas & Avaliações</h4>
              <p className="text-xs text-slate-400 mt-2">
                Moradores e clientes dão notas e comentários reais aos estabelecimentos, fortalecendo o comércio do bairro.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Active Catalog of Real Companies */}
      <section id="catalog-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>CATÁLOGO ATIVO • SINCRONIZADO COM BANCO DE DADOS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              EMPRESAS & NEGÓCIOS CADASTRADOS
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Conecte-se às empresas reais cadastradas pelos próprios proprietários.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenRegisterCompany}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Minha Empresa no Catálogo</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCatalogCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCatalogCategory === 'all'
                ? 'bg-lime-400 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas as Categorias ({places.length})
          </button>
          {(Object.keys(CATEGORY_CONFIG) as CategoryType[]).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const count = places.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCatalogCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCatalogCategory === cat
                    ? 'bg-lime-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cfg.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Companies Grid or Empty State */}
        {filteredCatalogPlaces.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-lime-400/10 text-lime-400 mx-auto flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhuma empresa cadastrada nesta categoria</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              Como solicitado, limpamos as empresas mock para que os próprios comércios reais se cadastrem no banco de dados. Seja a primeira empresa a se cadastrar!
            </p>
            <button
              type="button"
              onClick={onOpenRegisterCompany}
              className="mt-6 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-lime-400/20"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Minha Empresa Agora</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogPlaces.map((place) => {
              const catCfg = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.restaurant;
              return (
                <div
                  key={place.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-lime-400/50 transition-all flex flex-col group"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold text-slate-950 bg-lime-400 shadow">
                      {catCfg.name}
                    </div>
                    {place.rating && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[11px] font-bold bg-slate-950/80 text-yellow-400 flex items-center gap-1 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span>{place.rating.toFixed(1)}</span>
                        <span className="text-slate-400 text-[9px]">({place.reviewsCount})</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-lime-400 transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {place.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
                        <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                        <span className="truncate">{place.address} • {place.neighborhood}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigateToMap(place)}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-lime-400" />
                        <span>Ver no Mapa</span>
                      </button>

                      {place.whatsapp && (
                        <a
                          href={`https://wa.me/55${place.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* 8. Call to Action Footer Section */}
      <section className="py-16 bg-gradient-to-t from-black to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            PRONTO PARA COLOCAR SUA EMPRESA NO MAPA OU ACOMPANHAR SEU BAIRRO?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-xl mx-auto">
            Junte-se à maior rede comunitária e comercial da região metropolitana.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenRegisterCompany}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs tracking-wider transition-all shadow-xl shadow-lime-400/30 cursor-pointer"
            >
              CADASTRAR MINHA EMPRESA AGORA
            </button>
            <button
              type="button"
              onClick={() => onNavigateToBairrosCity()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider border border-slate-700 cursor-pointer"
            >
              EXPLORAR A ABA BAIRROSCITY
            </button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-8 bg-black border-t border-slate-900 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">BAIRROSCITY</span>
            <span>• Conectado ao Firebase Firestore</span>
          </div>
          <p className="text-[11px]">
            © 2026 BairrosCity - Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
};
