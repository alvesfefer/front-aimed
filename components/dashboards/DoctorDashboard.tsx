import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, Clock, CheckCircle2, 
  LogOut, Pill, FileText, Activity, 
  ShieldAlert, User, LayoutDashboard, 
  Menu, X, BrainCircuit, Video, Settings, Save,
  Mic, MicOff, VideoOff, PhoneOff, FilePlus, Send
} from 'lucide-react';
import { Prescription } from '../../types';
import api from "../../services/api";


type ViewMode = 'DASHBOARD' | 'CONSULTATION' | 'AGENDA' | 'PHARMACY' | 'SOS' | 'DOCUMENTS' | 'SETTINGS' | 'PROFILE';

const DoctorDashboard: React.FC = () => {
  const { 
    user, appointments, updateAppointmentStatus, logout, alerts, updateUser, addPrescription 
  } = useApp();
  
  const [activeView, setActiveView] = useState<ViewMode>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Flow State
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Prescription Form State
  const [prescType, setPrescType] = useState<Prescription['type']>('MEDICATION');
  const [prescContent, setPrescContent] = useState('');
  const [prescValid, setPrescValid] = useState('');

  // Profile Edit
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editSpecialty, setEditSpecialty] = useState(user?.details?.specialty || '');

  const myAppointments = appointments.filter(a => a.doctorId === user?.id);
  const waitingList = myAppointments.filter(a => a.status === 'SCHEDULED' || a.status === 'WAITING');
  
  // Sort by urgency and time
  const sortedWaitingList = waitingList.sort((a, b) => {
      if (a.status === 'WAITING' && b.status !== 'WAITING') return -1;
      if (b.status === 'WAITING' && a.status !== 'WAITING') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  const nextPatient = sortedWaitingList[0];
  
  // Current Active Appointment Data
  const activeAppointment = appointments.find(a => a.id === selectedAppointmentId);

  const stats = {
    waiting: waitingList.length,
    inProgress: myAppointments.filter(a => a.status === 'IN_PROGRESS').length,
    completed: myAppointments.filter(a => a.status === 'COMPLETED').length,
    emergency: alerts.filter(a => !a.resolved).length
  };

  const handleStartConsultation = (id: string) => {
    setSelectedAppointmentId(id);
    updateAppointmentStatus(id, 'IN_PROGRESS');
    setActiveView('CONSULTATION');
  };

  const handleFinishConsultation = () => {
    if (selectedAppointmentId) {
        updateAppointmentStatus(selectedAppointmentId, 'COMPLETED');
        // Automatically redirect to Pharmacy view to create prescription/docs
        setActiveView('PHARMACY');
    }
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAppointmentId || !activeAppointment) {
          alert("Erro: Nenhum paciente selecionado.");
          return;
      }

      if (!prescContent) {
          alert("Preencha o conteúdo da prescrição.");
          return;
      }

      const newPrescription: Prescription = {
          id: Math.random().toString(36).substr(2, 9),
          patientId: activeAppointment.patientId,
          doctorId: user!.id,
          doctorName: user!.name,
          content: prescContent,
          date: new Date().toISOString(),
          token: Math.random().toString(36).substr(2, 6).toUpperCase(),
          type: prescType,
          validUntil: prescValid || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default 30 days
      };

      addPrescription(newPrescription);
      
      // Reset form
      setPrescContent('');
      setPrescValid('');
      
      alert(`${prescType === 'MEDICATION' ? 'Receita' : 'Documento'} enviado para o paciente com sucesso!`);
      
      // Optional: Return to dashboard or stay to add more
      if (window.confirm("Deseja emitir outro documento para este paciente?")) {
          // Stay
      } else {
          setSelectedAppointmentId(null);
          setActiveView('DASHBOARD');
      }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      updateUser({
          name: editName,
          email: editEmail,
          details: {
              ...user?.details,
              specialty: editSpecialty
          }
      });
      alert('Perfil atualizado com sucesso!');
  };

  const NavItem = ({ active, onClick, icon, label }: any) => (
    <button
      onClick={() => { onClick(); setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
        active 
        ? 'bg-teal-500/10 text-white font-bold shadow-[0_0_15px_rgba(20,184,166,0.15)] border border-teal-500/20' 
        : 'text-teal-200/40 hover:bg-white/5 hover:text-teal-100'
      }`}
    >
      <div className={`transition-transform group-hover:scale-110 ${active ? 'text-teal-400' : ''}`}>{icon}</div>
      <span className={`block text-sm ${active ? 'translate-x-1' : ''} transition-transform`}>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_5px_#2dd4bf]"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#002A32] font-inter text-slate-100 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#002229] border-r border-white/5 flex flex-col z-50 shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 flex items-center justify-between lg:justify-start gap-3 mb-2 h-20 border-b border-white/5">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">M</div>
                  <span className="font-bold text-xl tracking-tight text-white">AIMED <span className="text-xs font-light text-cyan-400">PRO</span></span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-400"><X size={24}/></button>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto custom-scrollbar">
              <NavItem active={activeView === 'DASHBOARD'} onClick={() => setActiveView('DASHBOARD')} icon={<LayoutDashboard size={20} />} label="Visão Geral" />
              <NavItem active={activeView === 'AGENDA'} onClick={() => setActiveView('AGENDA')} icon={<Calendar size={20} />} label="Minha Agenda" />
              <NavItem active={activeView === 'CONSULTATION'} onClick={() => setActiveView('CONSULTATION')} icon={<Video size={20} />} label="Consultório" />
              <NavItem active={activeView === 'PHARMACY'} onClick={() => setActiveView('PHARMACY')} icon={<FileText size={20} />} label="Prescrições" />
              <div className="pt-4 mt-4 border-t border-white/5">
                <NavItem active={activeView === 'SOS'} onClick={() => setActiveView('SOS')} icon={<ShieldAlert size={20} className={stats.emergency > 0 ? 'text-red-500 animate-pulse' : ''} />} label="Emergências" />
                <NavItem active={activeView === 'PROFILE'} onClick={() => setActiveView('PROFILE')} icon={<Settings size={20} />} label="Meu Perfil" />
              </div>
          </nav>

          <div className="p-4 border-t border-white/5 bg-[#001E24]/50">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group relative">
                   <img src={user?.avatarUrl} className="w-10 h-10 rounded-full bg-slate-700 border border-white/10 object-cover" alt="Avatar" />
                   <div className="overflow-hidden flex-1">
                       <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                       <p className="text-xs text-cyan-200/50 truncate">{user?.details?.specialty}</p>
                   </div>
                   <button 
                      onClick={logout} 
                      className="text-teal-200/50 hover:text-red-400 p-2 rounded-lg transition-colors" 
                      title="Sair"
                   >
                       <LogOut size={18} />
                   </button>
              </div>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative bg-[#002A32]">
          <header className="relative z-10 flex justify-between items-center mb-8 h-12">
              <div className="flex items-center gap-4">
                  <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 bg-white/10 rounded-lg text-white">
                      <Menu size={24} />
                  </button>
                  <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                          {activeView === 'DASHBOARD' && 'Painel Médico'}
                          {activeView === 'CONSULTATION' && 'Sala de Teleatendimento'}
                          {activeView === 'AGENDA' && 'Gestão de Agenda'}
                          {activeView === 'PHARMACY' && 'Emissão de Documentos'}
                          {activeView === 'PROFILE' && 'Editar Perfil'}
                      </h1>
                  </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#002229] rounded-full border border-white/5">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold text-green-400">Online</span>
              </div>
          </header>

          {/* Dashboard View */}
          {activeView === 'DASHBOARD' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard 
                    icon={<Video className="text-blue-400"/>} 
                    label="Consultas em Andamento" 
                    value={stats.inProgress} 
                    color="bg-blue-900/10 border-blue-500/20"
                  />
                  <StatsCard 
                    icon={<Clock className="text-yellow-400"/>} 
                    label="Pacientes em Espera" 
                    value={stats.waiting} 
                    color="bg-yellow-900/10 border-yellow-500/20"
                  />
                  <StatsCard 
                    icon={<CheckCircle2 className="text-emerald-400"/>} 
                    label="Consultas Concluídas" 
                    value={stats.completed} 
                    color="bg-emerald-900/10 border-emerald-500/20"
                  />
                  <StatsCard 
                    icon={<ShieldAlert className="text-red-400"/>} 
                    label="Alertas SOS" 
                    value={stats.emergency} 
                    color="bg-red-900/10 border-red-500/20" 
                    animate={stats.emergency > 0}
                  />
               </div>

               <div className="lg:col-span-2 bg-[#00323d]/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-cyan-400"/> Próximo Paciente
                  </h3>
                  
                  {nextPatient ? (
                    <div className="bg-[#002229] rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase">
                         {nextPatient.status === 'WAITING' ? 'Aguardando' : nextPatient.time}
                       </div>
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                          <img src={nextPatient.patientAvatar} alt="" className="w-16 h-16 rounded-2xl bg-slate-700 object-cover"/>
                          <div>
                             <h2 className="text-xl font-bold text-white">{nextPatient.patientName}</h2>
                             <p className="text-cyan-200/60 text-sm">{nextPatient.status === 'WAITING' ? 'Entrou na sala de espera' : 'Retorno • Teleconsulta'}</p>
                          </div>
                       </div>

                       {nextPatient.symptomsSummary && (
                         <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-xl mb-4">
                            <p className="text-xs font-bold text-amber-500 uppercase mb-1 flex items-center gap-2"><BrainCircuit size={14}/> Resumo IA (Triagem)</p>
                            <p className="text-sm text-amber-100/80 leading-relaxed">{nextPatient.symptomsSummary}</p>
                         </div>
                       )}

                       <div className="flex gap-3 mt-4">
                          <button 
                            onClick={() => handleStartConsultation(nextPatient.id)}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                          >
                            <Video size={18} /> Iniciar Atendimento
                          </button>
                          <button className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-bold border border-white/10 transition-all">
                            Prontuário
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 bg-[#002229]/50 rounded-2xl border border-dashed border-white/10">
                      <Clock size={48} className="mx-auto mb-3 opacity-20"/>
                      <p>Sem pacientes na fila no momento.</p>
                    </div>
                  )}
               </div>

               <div className="bg-[#00323d]/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                     <Activity size={20} className="text-teal-400"/> Monitoramento
                  </h3>
                  <div className="flex-1 bg-[#002229] rounded-2xl border border-white/5 flex items-center justify-center text-slate-500 text-xs p-4 text-center">
                     Selecione um paciente para ver sinais vitais em tempo real.
                  </div>
               </div>
            </div>
          )}

          {/* Consultation View */}
          {activeView === 'CONSULTATION' && (
            <div className="flex flex-col h-[calc(100vh-140px)]">
                {activeAppointment ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        {/* Video Area */}
                        <div className="lg:col-span-2 bg-[#000] rounded-3xl relative overflow-hidden border border-white/10 flex flex-col shadow-2xl">
                            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-red-500 flex items-center gap-2 border border-white/5">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> REC
                            </div>
                            
                            {/* Fake Video Stream */}
                            <div className="flex-1 flex items-center justify-center bg-[#111] relative">
                                <img 
                                    src={activeAppointment.patientAvatar} 
                                    alt="Patient" 
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
                                    <h3 className="text-2xl font-bold text-white">{activeAppointment.patientName}</h3>
                                    <p className="text-teal-200/50">{activeAppointment.urgency} Prioridade • {activeAppointment.symptomsSummary?.slice(0, 50)}...</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="h-20 bg-[#001a20] flex items-center justify-center gap-4 border-t border-white/10">
                                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><Mic size={20}/></button>
                                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><Video size={20}/></button>
                                <button 
                                    onClick={handleFinishConsultation}
                                    className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-transform hover:scale-105"
                                >
                                    <PhoneOff size={20}/> Encerrar & Prescrever
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#00323d]/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 flex-1">
                                <h3 className="font-bold text-white mb-4">Notas Clínicas</h3>
                                <textarea 
                                    className="w-full h-[calc(100%-40px)] bg-[#002229] border border-white/10 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-teal-500/50 resize-none text-sm"
                                    placeholder="Registre as observações durante o atendimento..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full flex-col">
                        <p className="text-slate-500">Nenhuma consulta ativa.</p>
                        <button onClick={() => setActiveView('DASHBOARD')} className="mt-4 text-teal-400 underline">Voltar</button>
                    </div>
                )}
            </div>
          )}

          {/* Pharmacy / Prescriptions View */}
          {activeView === 'PHARMACY' && (
              <div className="max-w-4xl mx-auto">
                  <div className="bg-[#00323d]/50 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                      <div className="p-6 border-b border-white/5 bg-[#002229]/50 flex justify-between items-center">
                          <div>
                              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                  <FilePlus size={24} className="text-cyan-400"/> Emitir Documento
                              </h2>
                              <p className="text-sm text-teal-200/50">Gere receitas, atestados e pedidos de exame com assinatura digital.</p>
                          </div>
                          {activeAppointment && (
                              <div className="flex items-center gap-3 bg-cyan-900/20 border border-cyan-500/20 px-4 py-2 rounded-xl">
                                  <img src={activeAppointment.patientAvatar} className="w-8 h-8 rounded-full" alt=""/>
                                  <div className="text-right">
                                      <p className="text-xs font-bold text-cyan-400 uppercase">Paciente</p>
                                      <p className="text-sm font-bold text-white">{activeAppointment.patientName}</p>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      <div className="p-8">
                          {!selectedAppointmentId ? (
                               <div className="text-center py-12 bg-[#002229]/30 rounded-xl border border-dashed border-white/10">
                                   <User size={48} className="mx-auto text-slate-600 mb-4"/>
                                   <p className="text-slate-400 mb-4">Nenhum paciente selecionado para prescrição.</p>
                                   <button onClick={() => setActiveView('DASHBOARD')} className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold">Selecionar Paciente na Fila</button>
                               </div>
                          ) : (
                              <form onSubmit={handleIssuePrescription} className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                          <label className="block text-xs font-bold text-teal-200/50 uppercase mb-2">Tipo de Documento</label>
                                          <div className="grid grid-cols-2 gap-2">
                                              <button 
                                                type="button"
                                                onClick={() => setPrescType('MEDICATION')}
                                                className={`p-3 rounded-xl text-sm font-bold border transition-all ${prescType === 'MEDICATION' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-[#002229] text-slate-400 border-white/5 hover:bg-white/5'}`}
                                              >
                                                  Receita Médica
                                              </button>
                                              <button 
                                                type="button"
                                                onClick={() => setPrescType('EXAM')}
                                                className={`p-3 rounded-xl text-sm font-bold border transition-all ${prescType === 'EXAM' ? 'bg-purple-600 text-white border-purple-500' : 'bg-[#002229] text-slate-400 border-white/5 hover:bg-white/5'}`}
                                              >
                                                  Pedido de Exame
                                              </button>
                                              <button 
                                                type="button"
                                                onClick={() => setPrescType('CERTIFICATE')}
                                                className={`p-3 rounded-xl text-sm font-bold border transition-all ${prescType === 'CERTIFICATE' ? 'bg-amber-600 text-white border-amber-500' : 'bg-[#002229] text-slate-400 border-white/5 hover:bg-white/5'}`}
                                              >
                                                  Atestado
                                              </button>
                                              <button 
                                                type="button"
                                                onClick={() => setPrescType('REFERRAL')}
                                                className={`p-3 rounded-xl text-sm font-bold border transition-all ${prescType === 'REFERRAL' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#002229] text-slate-400 border-white/5 hover:bg-white/5'}`}
                                              >
                                                  Encaminhamento
                                              </button>
                                          </div>
                                      </div>

                                      <div>
                                          <label className="block text-xs font-bold text-teal-200/50 uppercase mb-2">Validade (Opcional)</label>
                                          <input 
                                              type="date"
                                              value={prescValid}
                                              onChange={e => setPrescValid(e.target.value)}
                                              className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-3 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                                          />
                                          <p className="text-[10px] text-slate-500 mt-2">Se não preenchido, validade padrão de 30 dias.</p>
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold text-teal-200/50 uppercase mb-2">Conteúdo da Prescrição</label>
                                      <textarea 
                                          value={prescContent}
                                          onChange={e => setPrescContent(e.target.value)}
                                          className="w-full h-40 bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-cyan-500/50 outline-none font-mono"
                                          placeholder={
                                              prescType === 'MEDICATION' ? "Ex: Amoxicilina 500mg - 1 cx\nTomar 1 cp de 8/8h por 7 dias." :
                                              prescType === 'EXAM' ? "Ex: Hemograma Completo, Colesterol Total e Frações..." :
                                              "Descreva o conteúdo do documento..."
                                          }
                                      ></textarea>
                                  </div>

                                  <div className="flex gap-4 pt-4 border-t border-white/5">
                                      <button 
                                        type="button"
                                        onClick={() => setActiveView('DASHBOARD')}
                                        className="px-6 py-4 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-colors"
                                      >
                                          Cancelar
                                      </button>
                                      <button 
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all"
                                      >
                                          <Send size={20} /> Assinar & Enviar Digitalmente
                                      </button>
                                  </div>
                              </form>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* Profile View */}
          {activeView === 'PROFILE' && (
             <div className="max-w-2xl mx-auto">
                 <div className="bg-[#00323d]/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-lg">
                    <div className="flex items-center gap-4 mb-8">
                         <img src={user?.avatarUrl} className="w-24 h-24 rounded-2xl bg-slate-700 border-2 border-cyan-500/30 object-cover" alt="" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Perfil Médico</h2>
                            <p className="text-teal-200/50 text-sm">Gerencie suas credenciais.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Nome Completo</label>
                            <input 
                                type="text" 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder-teal-900/50"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Email Profissional</label>
                            <input 
                                type="email" 
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder-teal-900/50"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Especialidade</label>
                            <input 
                                type="text" 
                                value={editSpecialty}
                                onChange={e => setEditSpecialty(e.target.value)}
                                className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder-teal-900/50"
                            />
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20">
                                <Save size={20} /> Salvar Dados
                            </button>
                        </div>
                    </form>
                 </div>
             </div>
          )}

          {/* Placeholder for other views */}
          {activeView !== 'DASHBOARD' && activeView !== 'PROFILE' && activeView !== 'CONSULTATION' && activeView !== 'PHARMACY' && (
            <div className="bg-[#00323d]/50 backdrop-blur-md rounded-3xl p-12 border border-white/5 shadow-xl text-center">
                <LayoutDashboard size={64} className="mx-auto text-teal-500/20 mb-4"/>
                <h2 className="text-2xl font-bold text-white mb-2">Área em Desenvolvimento</h2>
                <p className="text-teal-200/50 mb-6">Esta funcionalidade estará disponível na próxima versão.</p>
                <button onClick={() => setActiveView('DASHBOARD')} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white border border-white/10">Voltar ao Painel</button>
            </div>
          )}

      </main>
    </div>
  );
};

const StatsCard = ({ icon, label, value, color, animate }: any) => (
  <div className={`p-6 rounded-2xl border ${color} flex flex-col items-center justify-center text-center transition-transform hover:scale-105 relative overflow-hidden ${animate ? 'animate-pulse' : ''}`}>
    <div className="mb-3 p-3 bg-[#002229] border border-white/5 rounded-full shadow-sm relative z-10">{icon}</div>
    <h4 className="text-3xl font-bold text-white relative z-10">{value}</h4>
    <p className="text-xs text-slate-400 uppercase font-bold mt-1 relative z-10">{label}</p>
    {animate && <div className="absolute inset-0 bg-red-500/10 z-0"></div>}
  </div>
);

export default DoctorDashboard;