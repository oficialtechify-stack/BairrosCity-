import React, { useState } from 'react';
import { X, Building2, User, CheckCircle2, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { auth, db, googleProvider, signInWithPopup, getDoc, doc, setDoc } from '../lib/firebase';
import { NEIGHBORHOODS } from '../data/initialPlaces';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
}

// Official Google 'G' icon
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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<'morador' | 'empresa'>('morador');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('Curado IV');
  const [companyName, setCompanyName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Handle Sign-in / Sign-up with Google
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoadingGoogle(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        throw new Error('Nenhum usuário retornado na autenticação.');
      }

      // Check if user profile exists in Firestore
      let profile: UserProfile;
      let existingProfile: UserProfile | null = null;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          existingProfile = userDoc.data() as UserProfile;
        }
      } catch (dbReadErr) {
        console.warn('Could not read existing profile from Firestore', dbReadErr);
      }

      if (existingProfile) {
        // If registering specifically as company, ensure role is set to empresa
        const finalRole = (isRegisterMode && role === 'empresa') ? 'empresa' : (existingProfile.role || role);
        profile = {
          ...existingProfile,
          role: finalRole,
          companyName: finalRole === 'empresa' ? (companyName.trim() || existingProfile.companyName || user.displayName || 'Minha Empresa') : existingProfile.companyName,
          email: user.email || existingProfile.email,
          photoURL: user.photoURL || existingProfile.photoURL,
          name: existingProfile.name || user.displayName || 'Usuário Google',
        };
        try {
          await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
        } catch (e) {
          console.warn(e);
        }
      } else {
        // Create new profile for Google user
        profile = {
          id: user.uid,
          name: user.displayName || name.trim() || 'Usuário Google',
          email: user.email || '',
          role: role,
          neighborhood: neighborhood,
          companyName: role === 'empresa' ? (companyName.trim() || user.displayName || 'Minha Empresa') : undefined,
          phone: phone.trim() || undefined,
          photoURL: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
        } catch (dbWriteErr) {
          console.warn('Could not persist profile in Firestore', dbWriteErr);
        }
      }

      // Save to localStorage for instant recovery
      localStorage.setItem('bairromap_user', JSON.stringify(profile));

      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Erro Google Auth:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela de autenticação do Google foi fechada.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('O navegador bloqueou o pop-up do Google. Por favor, permita pop-ups nesta janela.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setErrorMsg(err.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const uid = `user-${Date.now()}`;

      const userProfile: UserProfile = {
        id: uid,
        name: name.trim() || (role === 'empresa' ? companyName.trim() : 'Usuário'),
        email: email.trim(),
        role,
        neighborhood,
        companyName: role === 'empresa' ? companyName.trim() : undefined,
        phone: phone.trim(),
        createdAt: new Date().toISOString(),
      };

      // Save user profile in Firestore
      try {
        await setDoc(doc(db, 'users', uid), userProfile);
      } catch (dbErr) {
        console.warn('Firestore user save warning', dbErr);
      }

      // Save to localStorage for quick session persistence
      localStorage.setItem('bairromap_user', JSON.stringify(userProfile));

      onLoginSuccess(userProfile);
      onClose();
    } catch (err: any) {
      setErrorMsg('Erro ao conectar com o banco de dados. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header styling matching LeadsPay dark & neon style */}
        <div className="relative p-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acesso Regional • BairrosCity</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {isRegisterMode ? 'Criar Nova Conta' : 'Entrar na Plataforma'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Conectado em tempo real com o banco de dados Firebase Firestore
          </p>
        </div>

        <div className="p-6 pt-5">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl mb-4 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setRole('morador')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'morador'
                  ? 'bg-lime-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Sou Morador</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('empresa')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'empresa'
                  ? 'bg-lime-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Sou Empresa</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PRIMARY GOOGLE SIGN-IN BUTTON */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 border border-slate-200"
            >
              {loadingGoogle ? (
                <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span>
                {isRegisterMode ? 'Cadastrar com o Google' : 'Entrar com o Google'}
              </span>
            </button>
          </div>

          {/* Visual Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative px-3 bg-slate-900 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              ou com e-mail
            </div>
          </div>

          {/* Manual Form (Registration or Login) */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegisterMode && role === 'empresa' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Empresa / Comércio *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Padaria Central, Barbearia Silva"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {role === 'empresa' ? 'Nome do Responsável *' : 'Seu Nome Completo *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {isRegisterMode && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp / Celular
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(81) 98888-7777"
                      className="w-full pl-9 pr-3 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bairro Principal *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-lime-400"
                    >
                      {NEIGHBORHOODS.map((nb) => (
                        <option key={nb} value={nb} className="bg-slate-900 text-white">
                          {nb}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || loadingGoogle}
              className="w-full py-2.5 mt-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRegisterMode ? 'Concluir Cadastro' : 'Entrar com E-mail'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setIsRegisterMode(!isRegisterMode);
              }}
              className="text-xs text-slate-400 hover:text-lime-400 transition-colors cursor-pointer"
            >
              {isRegisterMode
                ? 'Já tem uma conta? Clique para Entrar'
                : 'Não tem conta ainda? Clique para Cadastrar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
