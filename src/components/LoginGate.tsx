import React, { useState } from 'react';
import { Building2, User, Sparkles, MapPin, Compass, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginWithGoogle } from '../services/authService';
import { UserProfile } from '../types';

interface LoginGateProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenEmailAuth: () => void;
}

// Google Official Icon
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

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess, onOpenEmailAuth }) => {
  const [selectedRole, setSelectedRole] = useState<'morador' | 'empresa'>('morador');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setErrorMessage('');
    try {
      const profile = await loginWithGoogle(selectedRole);
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Erro ao conectar com Google. Tente novamente.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto text-slate-100 select-none">
      {/* Background styling elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-lime-500 to-lime-400 text-slate-950 shadow-lg shadow-lime-500/20 mb-1">
            <MapPin className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            BAIRROSCITY
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            O mapa e guia da sua comunidade em Pernambuco
          </p>
        </div>

        {/* Informative notice */}
        <div className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-700/60 text-center">
          <p className="text-xs text-slate-300 leading-relaxed">
            Para acessar o mapa regional, estabelecimentos e a comunidade, entre com sua conta.
          </p>
        </div>

        {/* Role toggle */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Como você deseja entrar?
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-800/80 border border-slate-700 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedRole('morador')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'morador'
                  ? 'bg-lime-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Morador</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('empresa')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'empresa'
                  ? 'bg-lime-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Empresa</span>
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {/* Primary Login CTAs */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm tracking-wide transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {loadingGoogle ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            <span>Entrar com o Google</span>
          </button>

          <button
            type="button"
            onClick={onOpenEmailAuth}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700 active:scale-[0.99]"
          >
            <span>Entrar ou Criar com E-mail e Senha</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
          </button>
        </div>

        {/* Security badge footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
          <span>Autenticação segura via Google & Firebase</span>
        </div>
      </div>
    </div>
  );
};
