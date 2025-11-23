import React, { useState } from 'react';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { User, Briefcase, Building2, ArrowRight, Loader2, Lock, Activity } from 'lucide-react';

const Auth: React.FC = () => {
  const { login, register } = useApp();
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.PATIENT);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let success = false;
      if (isRegistering) {
        if (!name || !email || !password) { setError('Preencha todos os campos.'); setIsLoading(false); return; }
        success = await register(name, email, password, activeTab);
      } else {
        if (!email || !password) { setError('Preencha email e senha.'); setIsLoading(false); return; }
        success = await login(email, password, activeTab);
      }
      if (!success) setError(isRegistering ? 'Erro ao criar conta.' : 'Credenciais inválidas.');
    } catch {
      setError('Erro de conexão com o servidor.');
    } finally { setIsLoading(false); }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setName(''); setEmail(''); setPassword('');
  };

  const getRoleColor = (role: UserRole) => {
    if (activeTab === role) {
      switch (role) {
        case UserRole.PATIENT:
          return "bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] border-teal-400";
        case UserRole.DOCTOR:
          return "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border-cyan-400";
        case UserRole.INSTITUTION:
          return "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-400";
      }
    }
    return "bg-[#003840]/50 text-slate-400 hover:bg-[#004d57]/50 border border-white/5 hover:border-white/10";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#002A32] relative overflow-hidden font-inter selection:bg-teal-500/30 selection:text-teal-200">

      <div className="absolute inset-0 bg-gradient-to-b from-[#00323d] via-[#002A32] to-[#001a20]"></div>

      <div className="absolute top-[-10%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-teal-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-cyan-600/5 rounded-full blur-[100px]"></div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#00323d]/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 z-10 animate-fade-in overflow-hidden relative ring-1 ring-white/5">

        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>

        <div className="p-6 md:p-8 pb-0 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-[#004d57] to-[#002A32] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 border border-white/10 rotate-3 transition">
            <Activity className="text-teal-400" size={32} />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
            AIMED <span className="text-teal-400 font-light">CONNECT</span>
          </h1>
          <p className="text-teal-200/40 text-xs md:text-sm font-medium">
            {isRegistering
              ? "Crie sua conta para acessar o ecossistema."
              : "Acesso seguro ao ecossistema de saúde."}
          </p>
        </div>

        {/* Seleção de Perfil */}
        <div className="flex justify-center gap-2 md:gap-3 px-4 md:px-6 mt-6">
          <RoleButton
            active={activeTab === UserRole.PATIENT}
            onClick={() => setActiveTab(UserRole.PATIENT)}
            icon={<User size={16} />}
            label="Paciente"
            colorClass={getRoleColor(UserRole.PATIENT)}
          />
          <RoleButton
            active={activeTab === UserRole.DOCTOR}
            onClick={() => setActiveTab(UserRole.DOCTOR)}
            icon={<Briefcase size={16} />}
            label="Médico"
            colorClass={getRoleColor(UserRole.DOCTOR)}
          />
          <RoleButton
            active={activeTab === UserRole.INSTITUTION}
            onClick={() => setActiveTab(UserRole.INSTITUTION)}
            icon={<Building2 size={16} />}
            label="Admin"
            colorClass={getRoleColor(UserRole.INSTITUTION)}
          />
        </div>

        <form onSubmit={handleAuth} className="p-6 md:p-8 pt-6 flex flex-col gap-5">

          {isRegistering && (
            <div className="space-y-1.5 animate-slide-up">
              <label className="text-[10px] font-bold text-teal-200/50 uppercase tracking-wider ml-1">
                Nome Completo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-teal-700" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 pl-11 bg-[#001e26]/80 border border-white/5 rounded-xl text-teal-50 text-sm"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-teal-200/50 uppercase tracking-wider ml-1">
              Identificação (Email)
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-teal-700" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 pl-11 bg-[#001e26]/80 border border-white/5 rounded-xl text-teal-50 text-sm"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-teal-200/50 uppercase tracking-wider ml-1">
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-teal-700" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-11 bg-[#001e26]/80 border border-white/5 rounded-xl text-teal-50 text-sm"
                placeholder="•••••••"
              />
            </div>
          </div>

          {/* Erros */}
          {error && (
            <div className="text-rose-400 text-xs bg-rose-950/30 border border-rose-900/30 p-3 rounded-lg text-center font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-gradient-to-r from-teal-600 to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : isRegistering ? (
              "Criar Conta"
            ) : (
              "Entrar na Plataforma"
            )}
            {!isLoading && <ArrowRight size={18} className="inline ml-2" />}
          </button>

          <div className="text-center mt-2 pb-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-teal-400 hover:text-teal-300 font-bold transition"
            >
              {isRegistering
                ? "Já tem uma conta? Entrar"
                : "Novo por aqui? Criar conta"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center z-10 opacity-40">
        <p className="text-teal-100 text-[10px] font-medium tracking-wider">
          © 2025 AIMED • SAÚDE CONECTADA
        </p>
      </div>
    </div>
  );
};

const RoleButton = ({ active, onClick, icon, label, colorClass }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-2 md:px-3 py-3 rounded-xl text-xs font-bold transition-all flex-1 backdrop-blur-md ${colorClass}`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default Auth;
