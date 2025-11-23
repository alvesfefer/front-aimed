import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Clock, Activity, Search, QrCode, FileCheck, LogOut, Bed, MapPin } from 'lucide-react';
import { Prescription } from '../../types';

const InstitutionDashboard: React.FC = () => {
  const { user, appointments, validateToken, logout } = useApp();
  const [tokenInput, setTokenInput] = useState('');
  const [validatedPrescription, setValidatedPrescription] = useState<Prescription | null>(null);
  const [tokenError, setTokenError] = useState('');

  // Statistics
  const activePatients = appointments.filter(a => a.status === 'IN_PROGRESS').length;
  const waitingList = appointments.filter(a => a.status === 'SCHEDULED').length;

  const handleValidate = () => {
    setTokenError('');
    setValidatedPrescription(null);
    if (!tokenInput) return;
    
    const result = validateToken(tokenInput.toUpperCase());
    if (result) {
      setValidatedPrescription(result);
    } else {
      setTokenError('Token inválido ou não encontrado.');
    }
  };

  return (
    <div className="min-h-screen bg-[#002A32] p-4 md:p-6 font-inter text-slate-100">
      {/* Header - Updated to Deep Teal Theme */}
      <header className="flex justify-between items-center mb-8 bg-[#002229]/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.name}</h1>
            <p className="text-xs text-teal-200/50 uppercase tracking-wider font-bold">Gestão Hospitalar & Leitos</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full text-teal-200/50 hover:text-red-400 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Status & Bed Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard icon={<Users className="text-blue-400" />} label="Atendimentos" value={activePatients} color="bg-blue-900/10 border-blue-500/20" />
            <StatsCard icon={<Clock className="text-orange-400" />} label="Fila de Espera" value={waitingList} color="bg-orange-900/10 border-orange-500/20" />
            <StatsCard icon={<Bed className="text-emerald-400" />} label="Leitos Livres" value="12" color="bg-emerald-900/10 border-emerald-500/20" />
          </div>

          {/* Bed Occupancy Map */}
          <div className="bg-[#00323d]/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/5">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-slate-400" /> Mapa de Ocupação (UTI & Internação)
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 ${i < 4 ? 'bg-red-900/20 border-red-500/30' : i < 10 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-[#002229] border-white/5 opacity-50'}`}>
                       <Bed size={24} className={i < 4 ? 'text-red-500' : i < 10 ? 'text-emerald-500' : 'text-slate-500'} />
                       <span className="text-xs font-bold text-slate-400">Leito {i+1}</span>
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${i < 4 ? 'bg-red-500/20 text-red-400' : i < 10 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                          {i < 4 ? 'Ocupado' : i < 10 ? 'Livre' : 'Limpeza'}
                       </span>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Col: Token Validator & Actions */}
        <div className="space-y-8">
          <div className="bg-[#00323d]/40 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/5 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-[#002229] border border-white/10 rounded-lg text-teal-400"><QrCode size={20} /></div>
              <h3 className="font-bold text-white">Check-in & Validação</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-teal-200/50">Valide tokens de encaminhamento ou receitas para liberar procedimentos.</p>
              
              <div className="relative">
                <input 
                  type="text" 
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className="w-full p-4 bg-[#001a20] border-2 border-white/10 rounded-xl text-center font-mono text-xl tracking-widest focus:outline-none focus:border-teal-500/50 text-white transition-colors uppercase placeholder-slate-700"
                  placeholder="XXXX-XXXX"
                  maxLength={10}
                />
                <button 
                  onClick={handleValidate}
                  className="absolute right-2 top-2 bottom-2 bg-teal-600 text-white px-4 rounded-lg hover:bg-teal-500 transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>

              {tokenError && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                  <Activity size={16} /> {tokenError}
                </div>
              )}

              {validatedPrescription && (
                <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl animate-slide-up">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                    <FileCheck size={20} /> Token Válido
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                     <p><span className="font-semibold text-slate-500">Tipo:</span> {validatedPrescription.type}</p>
                     <p><span className="font-semibold text-slate-500">Médico:</span> {validatedPrescription.doctorName}</p>
                     <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="font-mono text-xs text-slate-400 bg-black/20 p-2 rounded">{validatedPrescription.content}</p>
                     </div>
                     <button className="w-full mt-2 py-2 bg-emerald-600/80 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 border border-emerald-500/30">
                       Autorizar Procedimento
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon, label, value, color }: any) => (
  <div className={`p-6 rounded-2xl border ${color} flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}>
    <div className="mb-3 p-3 bg-[#002229] border border-white/5 rounded-full shadow-sm">{icon}</div>
    <h4 className="text-3xl font-bold text-white">{value}</h4>
    <p className="text-xs text-slate-400 uppercase font-bold mt-1">{label}</p>
  </div>
);

export default InstitutionDashboard;