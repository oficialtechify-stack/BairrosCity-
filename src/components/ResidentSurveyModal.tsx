import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Instagram, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Lock,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { NEIGHBORHOODS } from '../data/initialPlaces';
import { UserProfile } from '../types';
import { saveResidentVerification } from '../services/bairrosService';

interface ResidentSurveyModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onSurveyCompleted: (updatedUser: UserProfile) => void;
}

export const ResidentSurveyModal: React.FC<ResidentSurveyModalProps> = ({
  isOpen,
  currentUser,
  onSurveyCompleted,
}) => {
  const [neighborhood, setNeighborhood] = useState<string>(currentUser?.neighborhood || 'Curado IV');
  const [searchNeighborhood, setSearchNeighborhood] = useState<string>('');
  const [age, setAge] = useState<string>(currentUser?.age ? String(currentUser.age) : '');
  const [instagram, setInstagram] = useState<string>(currentUser?.instagram || '');
  const [cpf, setCpf] = useState<string>(currentUser?.cpf || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !currentUser) return null;

  // Mask CPF as user types: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length > 9) {
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (val.length > 3) {
      val = val.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(val);
  };

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (val && !val.startsWith('@')) {
      val = '@' + val;
    }
    setInstagram(val);
  };

  const filteredNeighborhoods = NEIGHBORHOODS.filter((n) =>
    n.toLowerCase().includes(searchNeighborhood.toLowerCase().trim())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!neighborhood) {
      setErrorMsg('Por favor, selecione o seu bairro.');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 14 || parsedAge > 120) {
      setErrorMsg('Por favor, informe uma idade válida (mínimo 14 anos).');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setErrorMsg('Por favor, insira um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);

    try {
      await saveResidentVerification({
        userId: currentUser.id,
        name: currentUser.name || 'Morador',
        email: currentUser.email || '',
        neighborhood,
        age: parsedAge,
        instagram: instagram.trim(),
        cpf: cpf.trim(),
      });

      const updatedUser: UserProfile = {
        ...currentUser,
        neighborhood,
        age: parsedAge,
        instagram: instagram.trim(),
        cpf: cpf.trim(),
        surveyCompleted: true,
        surveyCompletedAt: new Date().toISOString(),
      };

      // Save locally
      localStorage.setItem('bairromap_user', JSON.stringify(updatedUser));
      onSurveyCompleted(updatedUser);
    } catch (err: any) {
      console.error('Error saving resident survey:', err);
      setErrorMsg('Ocorreu um erro ao registrar as informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Decorative Top Glow */}
        <div className="h-2 bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400" />

        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Bem-vindo ao BairrosCity!
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                  Morador
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valide seu cadastro para se conectar com moradores e comércios do seu bairro.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Seleção do Bairro */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                Selecione o seu Bairro de Residência *
              </label>

              {/* Search bar inside selector */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar bairro (ex: Curado IV, Várzea, Boa Viagem)..."
                  value={searchNeighborhood}
                  onChange={(e) => setSearchNeighborhood(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Quick Pills for Most Popular or filtered */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                {filteredNeighborhoods.map((nb) => (
                  <button
                    key={nb}
                    type="button"
                    onClick={() => setNeighborhood(nb)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      neighborhood === nb
                        ? 'bg-lime-400 text-slate-950 shadow-sm font-bold scale-102'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {nb}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-lime-400 font-medium mt-1">
                Bairro selecionado: <span className="font-bold text-white underline">{neighborhood}</span>
              </p>
            </div>

            {/* 2. Idade & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-lime-400" />
                  Sua Idade *
                </label>
                <input
                  type="number"
                  min="14"
                  max="120"
                  required
                  placeholder="Ex: 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  Instagram (opcional)
                </label>
                <input
                  type="text"
                  placeholder="@seuperfil"
                  value={instagram}
                  onChange={handleInstagramChange}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>
            </div>

            {/* 3. CPF com máscara */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-lime-400" />
                  CPF para Verificação de Autenticidade *
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" /> Protegido
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors tracking-wider"
              />
            </div>

            {/* LGPD Notice - Escrito de forma profissional */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Garantia de Privacidade e Segurança Cadastral</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Suas informações de identificação e validação cadastral são processadas em ambiente restrito e criptografado estritamente para comprovação de autenticidade da comunidade e prevenção contra perfis fraudulentos. Em conformidade com as diretrizes da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), os dados sensíveis são arquivados de forma confidencial para auditoria administrativa e descartados/anonimizados após a validação cadastral.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 active:scale-[0.99] text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Validando e Vinculando ao Bairro...</span>
                </>
              ) : (
                <>
                  <span>Concluir Cadastro e Acessar Meu Bairro</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
