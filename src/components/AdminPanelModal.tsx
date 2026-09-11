import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  Users, 
  Landmark, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Search, 
  Phone, 
  Instagram, 
  Mail, 
  Eye, 
  EyeOff, 
  Save, 
  Sparkles,
  MapPin,
  Upload,
  Calendar
} from 'lucide-react';
import { NEIGHBORHOODS } from '../data/initialPlaces';
import { CouncilMember, ResidentVerificationRecord, UserProfile } from '../types';
import { 
  subscribeAllCouncilMembers, 
  saveCouncilMember, 
  deleteCouncilMember, 
  subscribeResidentVerifications, 
  deleteResidentVerification 
} from '../services/bairrosService';
import { uploadCompanyImage } from '../services/storageService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  initialNeighborhood?: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialNeighborhood = 'Curado IV'
}) => {
  const [activeTab, setActiveTab] = useState<'vereadores' | 'moradores'>('vereadores');

  // Council Members State
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(initialNeighborhood);
  const [name, setName] = useState<string>('');
  const [party, setParty] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [officeAddress, setOfficeAddress] = useState<string>('');
  const [mandatePeriod, setMandatePeriod] = useState<string>('2025 - 2028');
  const [savingCouncil, setSavingCouncil] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [councilSuccessMsg, setCouncilSuccessMsg] = useState<string>('');

  // Resident Verifications State
  const [residents, setResidents] = useState<ResidentVerificationRecord[]>([]);
  const [residentSearch, setResidentSearch] = useState<string>('');
  const [residentNeighborhoodFilter, setResidentNeighborhoodFilter] = useState<string>('all');
  const [revealedCpfs, setRevealedCpfs] = useState<Record<string, boolean>>({});

  // Check admin authorization
  const isAdmin = 
    currentUser?.email?.toLowerCase() === 'bairroscity@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'rickmarketing81@gmail.com';

  // Subscriptions
  useEffect(() => {
    if (!isOpen) return;

    const unsubCouncil = subscribeAllCouncilMembers((list) => {
      setCouncilMembers(list);
    });

    const unsubResidents = subscribeResidentVerifications((list) => {
      setResidents(list);
    });

    return () => {
      unsubCouncil();
      unsubResidents();
    };
  }, [isOpen]);

  // When selected neighborhood changes in form, populate if exists
  useEffect(() => {
    const existing = councilMembers.find((c) => c.neighborhood === selectedNeighborhood);
    if (existing) {
      setName(existing.name || '');
      setParty(existing.party || '');
      setPhotoUrl(existing.photoUrl || '');
      setBio(existing.bio || '');
      setPhone(existing.phone || '');
      setWhatsapp(existing.whatsapp || '');
      setInstagram(existing.instagram || '');
      setEmail(existing.email || '');
      setOfficeAddress(existing.officeAddress || '');
      setMandatePeriod(existing.mandatePeriod || '2025 - 2028');
    } else {
      setName('');
      setParty('');
      setPhotoUrl('');
      setBio('');
      setPhone('');
      setWhatsapp('');
      setInstagram('');
      setEmail('');
      setOfficeAddress('');
      setMandatePeriod('2025 - 2028');
    }
  }, [selectedNeighborhood, councilMembers]);

  if (!isOpen) return null;

  // Handle Photo Upload from Gallery
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadCompanyImage('vereador_' + selectedNeighborhood.toLowerCase().replace(/\s+/g, '_'), file);
      setPhotoUrl(url);
    } catch (err) {
      console.error('Erro no upload da foto do vereador:', err);
      alert('Erro ao carregar a imagem. Tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save Council Member
  const handleSaveCouncilMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do vereador.');
      return;
    }

    setSavingCouncil(true);
    try {
      await saveCouncilMember({
        neighborhood: selectedNeighborhood,
        name: name.trim(),
        party: party.trim(),
        photoUrl: photoUrl.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        email: email.trim(),
        officeAddress: officeAddress.trim(),
        mandatePeriod: mandatePeriod.trim() || '2025 - 2028',
      });

      setCouncilSuccessMsg(`✅ Vereador de ${selectedNeighborhood} salvo com sucesso!`);
      setTimeout(() => setCouncilSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Erro ao salvar vereador:', err);
      alert('Erro ao salvar vereador no Firestore.');
    } finally {
      setSavingCouncil(false);
    }
  };

  // Delete Council Member
  const handleDeleteCouncil = async (neighborhoodToDelete: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o vereador de ${neighborhoodToDelete}?`)) return;
    try {
      await deleteCouncilMember(neighborhoodToDelete);
      setCouncilSuccessMsg(`Vereador de ${neighborhoodToDelete} removido.`);
      setTimeout(() => setCouncilSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Resident Verification (LGPD Data Removal)
  const handleDeleteResident = async (userId: string, residentName: string) => {
    if (!window.confirm(`Confirma o descarte/anonimização dos dados de auditoria de ${residentName} conforme a LGPD?`)) return;
    try {
      await deleteResidentVerification(userId);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle CPF visibility
  const toggleCpf = (id: string) => {
    setRevealedCpfs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredResidents = residents.filter((r) => {
    if (residentNeighborhoodFilter !== 'all' && r.neighborhood !== residentNeighborhoodFilter) return false;
    if (residentSearch.trim()) {
      const q = residentSearch.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.cpf.includes(q) ||
        r.instagram.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Admin Banner Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  ÁREA ADMINISTRATIVA BAIRROSCITY
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Acesso Restrito
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestão restrita para <span className="text-lime-400 font-mono">bairroscity@gmail.com</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('vereadores')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vereadores'
                ? 'border-lime-400 text-lime-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Cadastro Manual de Vereadores ({councilMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('moradores')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'moradores'
                ? 'border-lime-400 text-lime-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Auditoria de Moradores & Questionários ({residents.length})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* TAB 1: CADASTRO MANUAL DE VEREADORES */}
          {activeTab === 'vereadores' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Column */}
              <div className="lg:col-span-7 bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-lime-400" />
                    Cadastrar ou Editar Vereador do Bairro
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Bairro: <span className="text-lime-400 font-bold">{selectedNeighborhood}</span>
                  </span>
                </div>

                {councilSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-lime-400/20 border border-lime-400/40 text-lime-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{councilSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCouncilMember} className="space-y-4">
                  {/* Select Bairro */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Bairro Representado *
                    </label>
                    <select
                      value={selectedNeighborhood}
                      onChange={(e) => setSelectedNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-lime-400"
                    >
                      {NEIGHBORHOODS.map((nb) => (
                        <option key={nb} value={nb}>
                          {nb} {councilMembers.some((c) => c.neighborhood === nb) ? '✓ (Já cadastrado)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nome & Partido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Nome do Vereador *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João da Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-lime-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Partido Político
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: PSB, PT, PL, PSD..."
                        value={party}
                        onChange={(e) => setParty(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-lime-400"
                      />
                    </div>
                  </div>

                  {/* Foto (Upload da Galeria) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Foto Oficial do Vereador (Galeria)
                    </label>
                    <div className="flex items-center gap-3">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Foto"
                          className="w-14 h-14 rounded-xl object-cover border border-lime-400 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                          <Landmark className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors border border-slate-700">
                          <Upload className="w-3.5 h-3.5 text-lime-400" />
                          <span>{uploadingPhoto ? 'Carregando Foto...' : 'Selecionar da Galeria'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingPhoto}
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Foto nítida de rosto ou campanha oficial.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Biografia / Propostas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Biografia / Atuação Comunitária no Bairro
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Principais frentes de atuação, propostas para o bairro, melhorias aprovadas..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-lime-400"
                    />
                  </div>

                  {/* Contatos: WhatsApp, Instagram, Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="81988880000"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-lime-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <Instagram className="w-3 h-3 text-pink-400" />
                        Instagram
                      </label>
                      <input
                        type="text"
                        placeholder="@vereador"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-lime-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-sky-400" />
                        E-mail
                      </label>
                      <input
                        type="email"
                        placeholder="gabinete@..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-lime-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingCouncil}
                    className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-lime-400/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingCouncil ? 'Salvando no Firestore...' : `Salvar Vereador de ${selectedNeighborhood}`}</span>
                  </button>
                </form>
              </div>

              {/* List Column */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Vereadores Cadastrados ({councilMembers.length})</span>
                </h4>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {councilMembers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                      Nenhum vereador cadastrado ainda. Selecione um bairro e preencha o formulário ao lado.
                    </div>
                  ) : (
                    councilMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <Landmark className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{member.name}</h5>
                            <p className="text-[11px] text-lime-400 font-semibold">{member.neighborhood}</p>
                            <p className="text-[10px] text-slate-400">{member.party || 'Sem partido declarado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedNeighborhood(member.neighborhood)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCouncil(member.neighborhood)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AUDITORIA DE MORADORES & QUESTIONÁRIOS */}
          {activeTab === 'moradores' && (
            <div className="space-y-4">
              
              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar morador por nome, email, instagram ou CPF..."
                    value={residentSearch}
                    onChange={(e) => setResidentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-lime-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Filtrar Bairro:</span>
                  <select
                    value={residentNeighborhoodFilter}
                    onChange={(e) => setResidentNeighborhoodFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-lime-400"
                  >
                    <option value="all">Todos os Bairros</option>
                    {NEIGHBORHOODS.map((nb) => (
                      <option key={nb} value={nb}>{nb}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Residents Table / Cards */}
              {filteredResidents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  Nenhum questionário de morador encontrado com os filtros atuais.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredResidents.map((res) => {
                    const isRevealed = Boolean(revealedCpfs[res.id]);
                    const maskedCpf = res.cpf 
                      ? res.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.***-$4')
                      : 'Não informado';

                    return (
                      <div
                        key={res.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{res.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 border border-lime-400/30">
                              {res.neighborhood}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {res.age} anos
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                            <span className="text-slate-300">{res.email}</span>
                            {res.instagram && (
                              <span className="text-pink-400 font-semibold">{res.instagram}</span>
                            )}
                            <span className="text-[11px] text-slate-500">
                              Cadastrado em: {new Date(res.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* CPF and LGPD Action */}
                        <div className="flex items-center gap-3 self-end md:self-auto">
                          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center gap-2">
                            <span className="text-slate-400 text-[10px]">CPF:</span>
                            <span className="text-white font-bold tracking-wider">
                              {isRevealed ? res.cpf : maskedCpf}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCpf(res.id)}
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title={isRevealed ? 'Ocultar CPF' : 'Ver CPF Completo'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteResident(res.userId, res.name)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Excluir dados após auditoria (LGPD)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Descartar (LGPD)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
