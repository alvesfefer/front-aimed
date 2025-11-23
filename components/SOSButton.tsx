import React, { useState } from 'react';
import { Phone, ShieldAlert, X, HeartPulse, Siren, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerSOS } = useApp();

  const handleActivateSOS = () => {
    setIsOpen(true);
    
    // Attempt to get user location when SOS is triggered
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          triggerSOS(`Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}`);
        },
        (error) => {
          console.warn("Location access denied or error:", error);
          triggerSOS('Localização indisponível');
        }
      );
    } else {
      triggerSOS('Geolocalização não suportada');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#00323d] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border-t-8 border-red-500 relative transform transition-all scale-100 ring-1 ring-white/10 mb-4 sm:mb-0">
             <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-8">
               <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse border border-red-500/30">
                 <Siren size={32} />
               </div>
               <h2 className="text-2xl font-bold text-white">Central de Emergência</h2>
               <p className="text-teal-200/50 text-center mt-1">Sua localização foi compartilhada e um alerta enviado.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <EmergencyBtn 
                number="192" 
                label="SAMU" 
                icon={<HeartPulse size={24} />} 
                color="bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40" 
              />
              <EmergencyBtn 
                number="190" 
                label="Polícia" 
                icon={<ShieldAlert size={24} />} 
                color="bg-slate-700/30 text-slate-300 border-slate-500/30 hover:bg-slate-700/50" 
              />
              <EmergencyBtn 
                number="193" 
                label="Bombeiros" 
                icon={<Activity size={24} />} 
                color="bg-orange-900/20 text-orange-400 border-orange-500/30 hover:bg-orange-900/40" 
              />
              <EmergencyBtn 
                number="188" 
                label="CVV" 
                icon={<Phone size={24} />} 
                color="bg-yellow-900/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-900/40" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger */}
      <button
        onClick={handleActivateSOS}
        className="fixed bottom-6 right-4 sm:right-6 z-50 bg-red-600 text-white rounded-full p-4 shadow-lg shadow-red-900/50 transition-all duration-300 hover:scale-110 hover:bg-red-700 flex items-center justify-center gap-3 group pr-6 border border-white/10"
      >
        <Siren size={24} className="animate-bounce-slow" />
        <span className="font-bold tracking-wide hidden sm:inline">SOS</span>
        <span className="font-bold tracking-wide sm:hidden">AJUDA</span>
      </button>
    </>
  );
};

const EmergencyBtn = ({ number, label, icon, color }: any) => (
  <button 
    onClick={() => window.location.href = `tel:${number}`} 
    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${color}`}
  >
    <div className="mb-2">{icon}</div>
    <span className="text-2xl font-black">{number}</span>
    <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
  </button>
);

export default SOSButton;