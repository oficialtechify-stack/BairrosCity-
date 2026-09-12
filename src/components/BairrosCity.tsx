import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  MapPin, 
  Plus, 
  Newspaper, 
  AlertTriangle, 
  Calendar, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Clock, 
  Building2, 
  Search, 
  X, 
  Sparkles, 
  ArrowLeft,
  Share2,
  Filter,
  Landmark,
  ShieldAlert,
  Phone,
  Instagram,
  Mail,
  Edit3,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { NeighborhoodPost, PostType, ProblemStatus, UserProfile, CouncilMember, Place } from '../types';
import { NEIGHBORHOODS, NEIGHBORHOOD_POPULATION } from '../data/initialPlaces';
import { 
  subscribeNeighborhoodPosts, 
  createNeighborhoodPost, 
  upvotePost, 
  updateProblemStatus,
  subscribeCouncilMemberByNeighborhood,
  subscribeNeighborhoodResidents
} from '../services/bairrosService';

interface BairrosCityProps {
  initialNeighborhood?: string;
  onNavigateToMap: (filterNeighborhood?: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onBackToHome: () => void;
  onOpenAdminPanel?: () => void;
  places?: Place[];
}

export const BairrosCity: React.FC<BairrosCityProps> = ({
  initialNeighborhood = 'Curado IV',
  onNavigateToMap,
  currentUser,
  onOpenAuth,
  onBackToHome,
  onOpenAdminPanel,
  places = [],
}) => {
  // User neighborhood enforcement:
  // If user is a resident with a linked neighborhood, lock strictly to their neighborhood
  const userNeighborhood = currentUser?.neighborhood?.trim();
  const isLockedToNeighborhood = Boolean(userNeighborhood && currentUser?.role === 'morador');

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(
    (isLockedToNeighborhood && userNeighborhood) ? userNeighborhood : initialNeighborhood
  );

  useEffect(() => {
    if (isLockedToNeighborhood && userNeighborhood && selectedNeighborhood !== userNeighborhood) {
      setSelectedNeighborhood(userNeighborhood);
    }
  }, [isLockedToNeighborhood, userNeighborhood, selectedNeighborhood]);

  const [activeTab, setActiveTab] = useState<'all' | 'noticia' | 'problema' | 'evento' | 'discussao' | 'vereador'>('all');
  const [posts, setPosts] = useState<NeighborhoodPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Council member state
  const [councilMember, setCouncilMember] = useState<CouncilMember | null>(null);
  const [loadingCouncil, setLoadingCouncil] = useState<boolean>(true);

  // Residents count state
  const [residentsCountMap, setResidentsCountMap] = useState<Record<string, number>>({});

  // Check admin
  const isAdmin = 
    currentUser?.email?.toLowerCase() === 'bairroscity@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'rickmarketing81@gmail.com';

  // Count registered companies in this neighborhood
  const companiesInNeighborhood = useMemo(() => {
    return places.filter((p) => {
      if (!p.neighborhood) return false;
      const sameNeighborhood = p.neighborhood.toLowerCase().trim() === selectedNeighborhood.toLowerCase().trim();
      return sameNeighborhood && (p.isRegisteredCompany || !p.isEvent);
    }).length;
  }, [places, selectedNeighborhood]);

  const estimatedPopulation = NEIGHBORHOOD_POPULATION[selectedNeighborhood] || 15000;
  const registeredResidents = residentsCountMap[selectedNeighborhood] || 0;

  // New post form state
  const [postType, setPostType] = useState<PostType>('noticia');
  const [postTitle, setPostTitle] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(currentUser?.name || '');
  const [authorRole, setAuthorRole] = useState<string>(
    currentUser?.role === 'empresa' ? 'Comerciante' : 'Morador Local'
  );
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Subscribe to resident counts
  useEffect(() => {
    const unsubscribeResidents = subscribeNeighborhoodResidents((counts) => {
      setResidentsCountMap(counts);
    });
    return () => unsubscribeResidents();
  }, []);

  // Subscribe to council member for selected neighborhood
  useEffect(() => {
    setLoadingCouncil(true);
    const unsubscribeCouncil = subscribeCouncilMemberByNeighborhood(selectedNeighborhood, (member) => {
      setCouncilMember(member);
      setLoadingCouncil(false);
    });
    return () => unsubscribeCouncil();
  }, [selectedNeighborhood]);

  // Subscribe to posts from Firestore
  useEffect(() => {
    setLoading(true);
    const activeNeighborhood = (isLockedToNeighborhood && userNeighborhood) ? userNeighborhood : selectedNeighborhood;
    const unsubscribe = subscribeNeighborhoodPosts(activeNeighborhood, (fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedNeighborhood, isLockedToNeighborhood, userNeighborhood]);

  const filteredPosts = posts.filter((p) => {
    if (activeTab !== 'all' && p.type !== activeTab) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setSubmitting(true);
    const targetNeighborhood = (isLockedToNeighborhood && userNeighborhood) ? userNeighborhood : selectedNeighborhood;
    try {
      await createNeighborhoodPost({
        neighborhood: targetNeighborhood,
        type: postType,
        title: postTitle.trim(),
        content: postContent.trim(),
        author: authorName.trim() || currentUser?.name || 'Morador Local',
        authorRole: authorRole.trim() || 'Morador Local',
        status: postType === 'problema' ? 'aberto' : undefined,
        eventDate: postType === 'evento' ? eventDate : undefined,
        eventTime: postType === 'evento' ? eventTime : undefined,
        eventLocation: postType === 'evento' ? eventLocation : undefined,
        imageUrl: imageUrl.trim() || undefined,
      });

      // Reset modal
      setIsNewPostModalOpen(false);
      setPostTitle('');
      setPostContent('');
      setEventDate('');
      setEventTime('');
      setEventLocation('');
      setImageUrl('');
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Erro ao publicar. Verifique sua conexão com o Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      await upvotePost(postId);
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: ProblemStatus) => {
    try {
      await updateProblemStatus(postId, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const countNoticias = posts.filter((p) => p.type === 'noticia').length;
  const countProblemas = posts.filter((p) => p.type === 'problema').length;
  const countEventos = posts.filter((p) => p.type === 'evento').length;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans pb-16">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#070b12]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Voltar para o Mapa"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-white text-sm sm:text-base tracking-wide truncate">BAIRROSCITY</span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400 border border-lime-400/30 shrink-0">
                  {isLockedToNeighborhood ? selectedNeighborhood : 'REGIONAL'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden xs:block">
                Notícias, problemas e eventos por bairro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Acesso restrito ao Painel de Administrador"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Painel Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateToMap(selectedNeighborhood)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Ver no Mapa</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewPostModalOpen(true)}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-lime-400/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Publicar</span>
              <span className="xs:hidden">Postar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Neighborhood Selector Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 py-3.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {isLockedToNeighborhood ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-lime-500/30">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs text-slate-300 font-medium">Bairro Vinculado ao seu Perfil:</span>
                    <span className="text-xs font-black text-lime-400 uppercase tracking-wide bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/30">
                      {selectedNeighborhood}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      Morador Exclusivo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Como morador registrado, você visualiza e publica exclusivamente no feed do <strong>{selectedNeighborhood}</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-lime-400" />
                  ESCOLHA SEU BAIRRO:
                </span>

                <div className="text-xs text-lime-400 font-semibold">
                  Bairro Ativo: <span className="font-bold underline text-white">{selectedNeighborhood}</span>
                </div>
              </div>

              {/* Neighborhood Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {NEIGHBORHOODS.map((neighborhood) => (
                  <button
                    key={neighborhood}
                    type="button"
                    onClick={() => setSelectedNeighborhood(neighborhood)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedNeighborhood === neighborhood
                        ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20 scale-105'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{neighborhood}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bairro Dashboard Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8">
        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PAINEL COMUNITÁRIO DO BAIRRO</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {selectedNeighborhood}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Espaço comunitário oficial de {selectedNeighborhood}. Acompanhe avisos e notícias, reporte buracos ou problemas na
              iluminação, e descubra os próximos eventos no seu bairro.
            </p>
          </div>

          {/* Stat counters for this neighborhood: Habitantes, Comércios, Notícias, Problemas, Eventos */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Habitantes */}
            <div className="px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center flex flex-col justify-center">
              <div className="flex items-center justify-center gap-1 text-lime-400 mb-0.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs sm:text-base font-black text-white">
                  {estimatedPopulation.toLocaleString('pt-BR')}
                </span>
              </div>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">
                Habitantes
              </span>
            </div>

            {/* Empresas / Comércios */}
            <div className="px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center flex flex-col justify-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-xs sm:text-base font-black text-white">
                  {companiesInNeighborhood}
                </span>
              </div>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">Comércios</span>
            </div>

            {/* Notícias */}
            <div className="px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center flex flex-col justify-center">
              <span className="text-xs sm:text-base font-black text-white">{countNoticias}</span>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">Notícias</span>
            </div>

            {/* Problemas */}
            <div className="px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center flex flex-col justify-center">
              <span className="text-xs sm:text-base font-black text-yellow-400">{countProblemas}</span>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">Problemas</span>
            </div>

            {/* Eventos */}
            <div className="col-span-2 sm:col-span-1 px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center flex flex-col justify-center">
              <span className="text-xs sm:text-base font-black text-purple-400">{countEventos}</span>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">Eventos</span>
            </div>
          </div>
        </div>

        {/* Content Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          
          {/* Feed Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-lime-400 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('noticia')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'noticia'
                  ? 'bg-lime-400 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Notícias ({countNoticias})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('problema')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'problema'
                  ? 'bg-lime-400 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Problemas ({countProblemas})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('evento')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'evento'
                  ? 'bg-lime-400 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Eventos ({countEventos})</span>
            </button>

            {/* NEW TAB: VEREADOR DO BAIRRO */}
            <button
              type="button"
              onClick={() => setActiveTab('vereador')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'vereador'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 text-amber-300 hover:text-white border border-amber-500/30'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Vereador do Bairro</span>
            </button>
          </div>

          {/* Search in Feed */}
          {activeTab !== 'vereador' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar no bairro..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
            </div>
          )}

        </div>

        {/* TAB VIEW: VEREADOR DO BAIRRO */}
        {activeTab === 'vereador' && (
          <div className="mb-12">
            {loadingCouncil ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Carregando dados do vereador de {selectedNeighborhood}...</span>
              </div>
            ) : councilMember ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
                  
                  {/* Foto Oficial */}
                  <div className="shrink-0 flex flex-col items-center">
                    {councilMember.photoUrl ? (
                      <img
                        src={councilMember.photoUrl}
                        alt={councilMember.name}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-2 border-amber-400/50 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-slate-800 border-2 border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                        <Landmark className="w-16 h-16" />
                      </div>
                    )}

                    <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {councilMember.party || 'Mandato Oficial'}
                    </span>
                  </div>

                  {/* Informações */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-black text-white">
                            Vereador {councilMember.name}
                          </h2>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {councilMember.mandatePeriod || '2025 - 2028'}
                          </span>
                        </div>
                        <p className="text-xs text-lime-400 font-semibold mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          Representante e atuação em {councilMember.neighborhood}
                        </p>
                      </div>

                      {isAdmin && onOpenAdminPanel && (
                        <button
                          type="button"
                          onClick={onOpenAdminPanel}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Vereador no Admin</span>
                        </button>
                      )}
                    </div>

                    {/* Biografia / Atuação */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <h4 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Atuação Comunitária e Propostas no Bairro
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {councilMember.bio || 'Atuando ativamente junto às lideranças comunitárias e moradores locais na melhoria de iluminação pública, pavimentação, saneamento e postos de saúde da região.'}
                      </p>
                    </div>

                    {/* Contatos Oficiais */}
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {councilMember.whatsapp && (
                        <a
                          href={`https://wa.me/55${councilMember.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%20Gabinete%20do%20Vereador%2C%20sou%20morador%20de%20${encodeURIComponent(selectedNeighborhood)}%20via%20BairrosCity`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp do Gabinete</span>
                        </a>
                      )}

                      {councilMember.instagram && (
                        <a
                          href={`https://instagram.com/${councilMember.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>{councilMember.instagram}</span>
                        </a>
                      )}

                      {councilMember.email && (
                        <a
                          href={`mailto:${councilMember.email}?subject=Contato%20Morador%20${encodeURIComponent(selectedNeighborhood)}`}
                          className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{councilMember.email}</span>
                        </a>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 mx-auto flex items-center justify-center mb-4">
                  <Landmark className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Nenhum vereador cadastrado para {selectedNeighborhood}</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                  A área administrativa do BairrosCity realiza o cadastramento oficial dos representantes municipais atuantes em cada comunidade.
                </p>

                {isAdmin && onOpenAdminPanel ? (
                  <button
                    type="button"
                    onClick={onOpenAdminPanel}
                    className="mt-6 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Vereador de {selectedNeighborhood} no Admin</span>
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-4">
                    Se você é vereador ou membro do gabinete desta região, entre em contato com a administração.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Posts Feed (quando não estiver na aba vereador) */}
        {activeTab !== 'vereador' && (
          <>
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Sincronizando publicações com o banco de dados Firebase...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-lime-400/10 text-lime-400 mx-auto flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhuma publicação em {selectedNeighborhood} ainda</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              Seja o primeiro morador ou comerciante a postar uma notícia, relatar um problema na rua ou convidar para um evento!
            </p>
            <button
              type="button"
              onClick={() => setIsNewPostModalOpen(true)}
              className="mt-6 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-lime-400/20"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar a Primeira Notícia ou Problema</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const isProblema = post.type === 'problema';
              const isEvento = post.type === 'evento';

              return (
                <div
                  key={post.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header with Type Badge & Date */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isProblema
                            ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                            : isEvento
                            ? 'bg-purple-400/10 text-purple-400 border border-purple-400/30'
                            : 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                        }`}
                      >
                        {isProblema ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : isEvento ? (
                          <Calendar className="w-3 h-3" />
                        ) : (
                          <Newspaper className="w-3 h-3" />
                        )}
                        <span>
                          {isProblema
                            ? 'Problema do Bairro'
                            : isEvento
                            ? 'Evento & Lazer'
                            : 'Notícia'}
                        </span>
                      </span>

                      <span className="text-[11px] text-slate-500 font-medium">
                        {post.date}
                      </span>
                    </div>

                    {/* Problem Status Badge */}
                    {isProblema && (
                      <div className="mb-3 flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <span className="text-slate-400 text-[11px]">Status da Demanda:</span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              post.status === 'resolvido'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : post.status === 'em_andamento'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {post.status === 'resolvido'
                              ? 'Resolvido'
                              : post.status === 'em_andamento'
                              ? 'Em Andamento'
                              : 'Aberto'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Event Details Badge */}
                    {isEvento && (post.eventDate || post.eventLocation) && (
                      <div className="mb-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 text-xs space-y-1">
                        {post.eventDate && (
                          <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                            <Clock className="w-3 h-3" />
                            <span>{post.eventDate} {post.eventTime ? `• ${post.eventTime}` : ''}</span>
                          </div>
                        )}
                        {post.eventLocation && (
                          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            <span>{post.eventLocation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optional Image */}
                    {post.imageUrl && (
                      <div className="mb-3 rounded-2xl overflow-hidden h-40 w-full bg-slate-800">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-none">{post.author}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{post.authorRole}</p>
                      </div>
                    </div>

                    {/* Upvote / Apoiar button */}
                    <button
                      type="button"
                      onClick={() => handleUpvote(post.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Apoiar este post"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-lime-400" />
                      <span className="font-bold">{post.upvotes}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
        </>
        )}

      </div>

      {/* Modal: Nova Publicação no Bairro */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Publicar em {selectedNeighborhood}</h3>
                <p className="text-xs text-slate-400">
                  Compartilhe notícias, reporte problemas ou divulgue eventos
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto space-y-4">
              
              {/* Post Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Tipo de Publicação *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('noticia')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      postType === 'noticia'
                        ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Newspaper className="w-4 h-4" />
                    <span>Notícia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostType('problema')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      postType === 'problema'
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Problema</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostType('evento')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      postType === 'evento'
                        ? 'bg-purple-400 text-slate-950 border-purple-400 shadow-md'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Evento</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Publicação *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder={
                    postType === 'problema'
                      ? 'Ex: Lâmpadas apagadas na Rua 15'
                      : postType === 'evento'
                      ? 'Ex: Feira de Artesanato e Comidas Típicas'
                      : 'Ex: Inauguração do novo posto de saúde'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Event Specific fields */}
              {postType === 'evento' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                      Data do Evento
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                      Horário
                    </label>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="Ex: 19:00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                      Local / Endereço do Evento
                    </label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Ex: Praça Central do Curado IV"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Content Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detalhes e Descrição *
                </label>
                <textarea
                  required
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Escreva as informações detalhadas para os moradores do bairro..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 resize-none"
                />
              </div>

              {/* Image URL (optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de Imagem / Foto (Opcional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Author info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex: Maria José"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Identificação
                  </label>
                  <select
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Morador Local">Morador Local</option>
                    <option value="Comerciante">Comerciante do Bairro</option>
                    <option value="Líder Comunitário">Líder Comunitário</option>
                    <option value="Associação de Moradores">Associação de Moradores</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs tracking-wider transition-all shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>PUBLICAR AGORA NO FIREBASE</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
