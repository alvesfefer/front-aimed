import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, Appointment } from '../../types';
import { 
  Calendar, Video, FileText, Activity, Send, Plus, Loader2, 
  Check, Pill, Thermometer, Heart, LogOut, Clock, MessageSquare, 
  ShoppingBag, ChevronRight, AlertCircle, MapPin, User, FileCheck, Menu, X, Settings, Save
} from 'lucide-react';
import { summarizeSymptoms } from '../../services/geminiService';

const PatientDashboard: React.FC = () => {
  const { 
    user, users, appointments, addAppointment, messages, sendMessage, prescriptions, updateSymptomSummary,
    medications, toggleMedicationTaken, vitals, addVitalSign, logout, addMedication, updateUser
  } = useApp();
  
  const [activeView, setActiveView] = useState<'HOME' | 'BOOK' | 'CHAT' | 'DOCS' | 'SYMPTOMS' | 'VITALS' | 'PHARMACY' | 'PROFILE'>('HOME');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [symptomsText, setSymptomsText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editSus, setEditSus] = useState(user?.details?.susNumber || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || '');

  // Sync local state if user updates from context (e.g. cloud sync)
  useEffect(() => {
    if (user) {
        setEditName(user.name);
        setEditEmail(user.email);
        setEditSus(user.details?.susNumber || '');
        setEditAvatar(user.avatarUrl || '');
    }
  }, [user]);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Vitals Input
  const [tempInput, setTempInput] = useState('');
  const [bpmInput, setBpmInput] = useState('');

  const doctors = users.filter(u => u.role === UserRole.DOCTOR);
  const myAppointments = appointments.filter(a => a.patientId === user?.id);
  const myPrescriptions = prescriptions.filter(p => p.patientId === user?.id);
  const myMedications = medications.filter(m => m.patientId === user?.id);
  
  // Sort appointments
  const sortedAppointments = [...myAppointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const nextAppointment = sortedAppointments.find(a => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS');

  // Chat Data
  const currentChatMessages = messages.filter(m => 
    myAppointments.some(a => a.id === m.appointmentId)
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (activeView === 'CHAT') {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChatMessages, activeView]);

  const handleBook = () => {
    if (!selectedDoctor) return;
    const doc = doctors.find(d => d.id === selectedDoctor);
    if (!doc) return;

    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: user!.id,
      patientName: user!.name,
      doctorId: doc.id, 
      doctorName: doc.name,
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'SCHEDULED',
      urgency: 'LOW'
    };
    addAppointment(newAppt);
    setActiveView('HOME');
    
    sendMessage({
        id: Math.random().toString(36).substr(2, 9),
        appointmentId: newAppt.id,
        senderId: 'SYSTEM',
        senderName: 'AIMED',
        content: `Consulta agendada com Dr. ${doc.name}. Aguarde o chamado.`,
        type: 'SYSTEM',
        timestamp: Date.now()
    });

    alert('Consulta agendada com sucesso! O médico foi notificado.');
  };

  const handleSymptomSubmit = async () => {
    if (!symptomsText) return;
    setIsSummarizing(true);
    
    const nextAppt = myAppointments.find(a => a.status === 'SCHEDULED');
    
    if (!nextAppt) {
      alert("Você precisa agendar uma consulta antes de enviar sintomas.");
      setIsSummarizing(false);
      return;
    }

    const summary = await summarizeSymptoms(symptomsText, `Paciente: ${user?.name}, ID: ${user?.id}`);
    updateSymptomSummary(nextAppt.id, summary);
    
    sendMessage({
        id: Math.random().toString(36).substr(2, 9),
        appointmentId: nextAppt.id,
        senderId: user!.id,
        senderName: user!.name,
        content: `[Relato de Sintomas]: ${symptomsText}`,
        type: 'SYSTEM', 
        timestamp: Date.now()
    });
    
    setIsSummarizing(false);
    setSymptomsText('');
    setActiveView('HOME');
    alert('Sintomas enviados e analisados pela IA. Prioridade atualizada.');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const targetAppt = nextAppointment || sortedAppointments[0];
    
    if (!targetAppt) {
        alert('Agende uma consulta para iniciar o chat.');
        return;
    }

    sendMessage({
      id: Math.random().toString(36).substr(2, 9),
      appointmentId: targetAppt.id,
      senderId: user!.id,
      senderName: user!.name,
      content: chatInput,
      type: 'TEXT',
      timestamp: Date.now()
    });
    setChatInput('');
  };

  const handleVitalsSubmit = () => {
    if(tempInput) {
        addVitalSign({
            id: Math.random().toString(36).substr(2, 9),
            patientId: user!.id,
            type: 'TEMP',
            value: tempInput,
            timestamp: Date.now(),
            status: parseFloat(tempInput) > 37.5 ? 'WARNING' : 'NORMAL'
        });
    }
    if(bpmInput) {
        addVitalSign({
            id: Math.random().toString(36).substr(2, 9),
            patientId: user!.id,
            type: 'BPM',
            value: bpmInput,
            timestamp: Date.now(),
            status: parseInt(bpmInput) > 100 ? 'WARNING' : 'NORMAL'
        });
    }
    setTempInput('');
    setBpmInput('');
    alert('Sinais vitais registrados e sincronizados com o médico.');
  };

  const handleBuyMedication = (prescription: any) => {
    const parts = prescription.content.split(' ');
    const name = parts[0] || 'Medicamento';
    const dosage = parts.slice(1).join(' ') || 'Uso contínuo';

    addMedication({
        id: Math.random().toString(36).substr(2, 9),
        patientId: user!.id,
        name: name,
        dosage: dosage,
        frequency: 'A cada 8h', 
        prescribedBy: prescription.doctorName,
        nextDose: new Date().toISOString(),
        icon: 'PILL'
    });
    alert(`Compra de ${name} realizada! Adicionado à sua farmacinha.`);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      updateUser({
          name: editName,
          email: editEmail,
          avatarUrl: editAvatar,
          details: {
              ...user?.details,
              susNumber: editSus
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
      <span className={`block lg:block text-sm ${active ? 'translate-x-1' : ''} transition-transform`}>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_5px_#2dd4bf]"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#002A32] font-inter text-slate-100 overflow-hidden">
        {/* Mobile Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#002229] border-r border-white/5 flex flex-col z-50 shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="p-6 flex items-center justify-between lg:justify-start gap-3 mb-2 h-20 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)]">A</div>
                    <span className="font-bold text-xl tracking-tight text-white">AIMED</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-400"><X size={24}/></button>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto custom-scrollbar">
                <NavItem active={activeView === 'HOME'} onClick={() => setActiveView('HOME')} icon={<Calendar size={20} />} label="Início" />
                <NavItem active={activeView === 'CHAT'} onClick={() => setActiveView('CHAT')} icon={<MessageSquare size={20} />} label="Chat Médico" />
                <NavItem active={activeView === 'PHARMACY'} onClick={() => setActiveView('PHARMACY')} icon={<ShoppingBag size={20} />} label="Farmácia" />
                <NavItem active={activeView === 'BOOK'} onClick={() => setActiveView('BOOK')} icon={<Plus size={20} />} label="Nova Consulta" />
                <NavItem active={activeView === 'SYMPTOMS'} onClick={() => setActiveView('SYMPTOMS')} icon={<Activity size={20} />} label="Triagem IA" />
                <NavItem active={activeView === 'DOCS'} onClick={() => setActiveView('DOCS')} icon={<FileText size={20} />} label="Documentos" />
                <NavItem active={activeView === 'VITALS'} onClick={() => setActiveView('VITALS')} icon={<Heart size={20} />} label="Sinais Vitais" />
                <div className="pt-4 mt-4 border-t border-white/5">
                     <NavItem active={activeView === 'PROFILE'} onClick={() => setActiveView('PROFILE')} icon={<Settings size={20} />} label="Meu Perfil" />
                </div>
            </nav>

            <div className="p-4 border-t border-white/5 bg-[#001E24]/50">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group relative">
                     <img src={user?.avatarUrl} className="w-10 h-10 rounded-full bg-slate-700 border border-white/10 object-cover" alt="Avatar" />
                     <div className="overflow-hidden flex-1">
                         <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                         <p className="text-xs text-teal-200/50 truncate">Paciente</p>
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
            {/* Ambient Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center mb-8 h-12">
                <div className="flex items-center gap-4">
                    <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 bg-white/10 rounded-lg text-white">
                        <Menu size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight truncate max-w-[200px] lg:max-w-none">
                            {activeView === 'HOME' && 'Meu Painel'}
                            {activeView === 'CHAT' && 'Conversas'}
                            {activeView === 'PHARMACY' && 'Farmácia Digital'}
                            {activeView === 'BOOK' && 'Agendar Consulta'}
                            {activeView === 'SYMPTOMS' && 'Triagem Inteligente'}
                            {activeView === 'DOCS' && 'Documentos Médicos'}
                            {activeView === 'VITALS' && 'Monitoramento'}
                            {activeView === 'PROFILE' && 'Editar Perfil'}
                        </h1>
                        <p className="text-teal-200/50 text-xs lg:text-sm hidden sm:block">Bem-vindo de volta, {user?.name.split(' ')[0]}.</p>
                    </div>
                </div>
                
                <div className="lg:hidden">
                    <img src={user?.avatarUrl} className="w-8 h-8 rounded-full border border-white/20 object-cover" alt="" />
                </div>
            </header>

            <div className="relative z-10">
            {/* VIEW: HOME */}
            {activeView === 'HOME' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Next Appointment Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-teal-600/20 to-cyan-900/20 border border-white/10 backdrop-blur-md rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-teal-200 font-medium mb-1 text-xs uppercase tracking-wider">Próximo Atendimento</p>
                            {nextAppointment ? (
                                <>
                                    <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-white">Hoje, {nextAppointment.time}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-teal-500/30 shrink-0">
                                            <Video size={24} className="text-teal-300"/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{nextAppointment.doctorName}</p>
                                            <p className="text-sm text-teal-200/70">Telemedicina • {nextAppointment.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Agendado'}</p>
                                        </div>
                                    </div>
                                    {nextAppointment.status === 'IN_PROGRESS' && (
                                        <div className="mt-6 bg-teal-500/20 border border-teal-500/30 text-teal-100 px-6 py-4 rounded-xl font-bold shadow-lg flex items-center gap-3 animate-pulse">
                                            <div className="w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_10px_#2dd4bf]"></div>
                                            O médico iniciou o atendimento. Entre na sala.
                                        </div>
                                    )}
                                    {nextAppointment.status === 'WAITING' && (
                                        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 text-amber-100 px-6 py-4 rounded-xl font-bold shadow-lg flex items-center gap-3">
                                            <Clock size={16} className="text-amber-400"/>
                                            Na fila de espera. O médico irá chamá-lo em breve.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-8">
                                    <h2 className="text-2xl font-bold mb-2 text-white">Tudo certo por aqui!</h2>
                                    <p className="text-teal-200/60 mb-6">Você não tem consultas agendadas para hoje.</p>
                                    <button onClick={() => setActiveView('BOOK')} className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-6 py-2 rounded-xl font-bold transition-all text-white">
                                        Agendar Agora
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    </div>

                    {/* Medicine Cabinet */}
                    <div className="bg-[#00323d]/50 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Pill size={18} className="text-cyan-400"/> Minha Farmacinha</h3>
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[300px]">
                            {myMedications.map(med => (
                                <div key={med.id} className="flex items-center justify-between p-3 bg-[#002229] border border-white/5 rounded-xl group hover:bg-[#002A32] hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-cyan-900/30 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold border border-cyan-500/20 shrink-0">
                                            {med.icon === 'PILL' ? 'Cp' : 'Gt'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-200">{med.name}</p>
                                            <p className="text-[10px] text-slate-500 group-hover:text-cyan-400">{med.frequency}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleMedicationTaken(med.id)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${med.lastTaken && new Date(med.lastTaken).getDate() === new Date().getDate() ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-slate-500 hover:bg-teal-500/10 hover:text-teal-400'}`}
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            ))}
                            {myMedications.length === 0 && (
                                <div className="text-center py-6">
                                    <p className="text-slate-500 text-sm mb-2">Nenhum medicamento ativo.</p>
                                    <button onClick={() => setActiveView('PHARMACY')} className="text-teal-400 text-xs font-bold hover:underline">Ir para Farmácia</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: PROFILE */}
            {activeView === 'PROFILE' && (
                 <div className="max-w-2xl mx-auto">
                     <div className="bg-[#00323d]/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-lg">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="relative group cursor-pointer">
                                <img src={editAvatar} className="w-24 h-24 rounded-2xl bg-slate-700 border-2 border-teal-500/30 object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white">Alterar</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Configurações de Perfil</h2>
                                <p className="text-teal-200/50 text-sm">Mantenha seus dados atualizados.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Nome Completo</label>
                                <input 
                                    type="text" 
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-teal-500/50 outline-none placeholder-teal-900/50"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Email de Acesso</label>
                                <input 
                                    type="email" 
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-teal-500/50 outline-none placeholder-teal-900/50"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Cartão SUS / Documento</label>
                                <input 
                                    type="text" 
                                    value={editSus}
                                    onChange={e => setEditSus(e.target.value)}
                                    className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-teal-500/50 outline-none placeholder-teal-900/50 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">URL do Avatar (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={editAvatar}
                                    onChange={e => setEditAvatar(e.target.value)}
                                    className="w-full bg-[#002229] border border-white/10 text-white rounded-xl p-4 focus:ring-1 focus:ring-teal-500/50 outline-none placeholder-teal-900/50 text-xs"
                                />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20">
                                    <Save size={20} /> Salvar Alterações
                                </button>
                            </div>
                        </form>
                     </div>
                 </div>
            )}

            {/* VIEW: CHAT */}
            {activeView === 'CHAT' && (
                <div className="bg-[#00323d]/50 backdrop-blur-md rounded-3xl shadow-lg border border-white/5 flex flex-col h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-white/5 bg-[#002229]/50 rounded-t-3xl">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <MessageSquare size={18} className="text-teal-400"/> Canal Direto com Médico
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#002A32]/30 custom-scrollbar">
                        {currentChatMessages.length === 0 ? (
                            <div className="text-center py-12 opacity-30">
                                <MessageSquare size={48} className="mx-auto mb-2 text-teal-200"/>
                                <p className="text-teal-200 text-sm">Nenhuma mensagem ainda.</p>
                            </div>
                        ) : (
                            currentChatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === 'SYSTEM' ? 'justify-center' : msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                    {msg.senderId === 'SYSTEM' ? (
                                        <div className="bg-white/10 border border-white/5 text-teal-200 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-lg ${
                                            msg.senderId === user?.id 
                                            ? 'bg-teal-600 text-white rounded-tr-none shadow-teal-900/20' 
                                            : 'bg-[#002229] text-slate-200 rounded-tl-none border border-white/5'
                                        }`}>
                                            {msg.content}
                                            <span className={`text-[10px] block mt-1 opacity-50 ${msg.senderId === user?.id ? 'text-teal-100' : 'text-slate-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 bg-[#002229] border-t border-white/5 rounded-b-3xl">
                        <div className="flex gap-2">
                            <input 
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 bg-[#001a20] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all placeholder-teal-800/50"
                            />
                            <button onClick={handleSendMessage} className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-500 transition-colors shadow-lg shadow-teal-900/30">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: PHARMACY */}
            {activeView === 'PHARMACY' && (
                <div className="space-y-6">
                    {/* Active Prescriptions Section */}
                    <div>
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-cyan-400"/> Receitas Disponíveis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myPrescriptions.filter(p => p.type === 'MEDICATION').map(presc => (
                                <div key={presc.id} className="bg-[#00323d]/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                                    <div className="absolute top-0 right-0 bg-cyan-600/20 text-cyan-400 border-b border-l border-cyan-500/20 text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase tracking-wider">Nova Receita</div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                                                <Pill size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-100">{presc.content.split(' ')[0]}</p>
                                                <p className="text-xs text-slate-400">Dr. {presc.doctorName}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 bg-[#002229] p-3 rounded-lg mb-4 border border-white/5 font-mono">{presc.content}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleBuyMedication(presc)}
                                        className="w-full py-2 bg-cyan-700/50 border border-cyan-500/30 text-cyan-100 rounded-xl font-bold text-sm hover:bg-cyan-600/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={16} /> Comprar / Adicionar
                                    </button>
                                </div>
                            ))}
                            {myPrescriptions.filter(p => p.type === 'MEDICATION').length === 0 && (
                                <div className="col-span-full bg-white/5 rounded-2xl p-8 text-center text-slate-500 border border-dashed border-white/10">
                                    <p>Nenhuma receita digital pendente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Store Shelf */}
                    <div>
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <ShoppingBag size={20} className="text-teal-400"/> Farmácia Popular
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Paracetamol', 'Dipirona', 'Vitamina C', 'Omeprazol'].map((item, i) => (
                                <div key={i} className="bg-[#00323d]/50 backdrop-blur-md p-4 rounded-xl border border-white/5 hover:shadow-lg hover:bg-[#003843] transition-all cursor-pointer group">
                                    <div className="h-24 bg-[#002229] rounded-lg mb-3 flex items-center justify-center text-teal-900/50 group-hover:text-teal-500/30 transition-colors">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <p className="font-bold text-slate-200 text-sm">{item}</p>
                                    <p className="text-xs text-slate-500 mt-1">R$ {(Math.random() * 20 + 5).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: BOOK */}
            {activeView === 'BOOK' && (
                <div className="max-w-2xl mx-auto">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-xl">
                        <Plus size={24} className="text-teal-400"/> Agendar Nova Consulta
                    </h3>
                    <div className="bg-[#00323d]/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl">
                         <label className="block text-sm font-bold text-teal-200/70 mb-2 uppercase tracking-wider">Selecione o Médico</label>
                         <div className="space-y-3 mb-6">
                             {doctors.map(doc => (
                                 <div 
                                    key={doc.id}
                                    onClick={() => setSelectedDoctor(doc.id)} 
                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedDoctor === doc.id ? 'border-teal-500/50 bg-teal-900/20' : 'border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                                 >
                                     <img src={doc.avatarUrl} className="w-12 h-12 rounded-full bg-slate-700 border border-white/10 shrink-0 object-cover" alt=""/>
                                     <div className="flex-1">
                                         <p className="font-bold text-white">{doc.name}</p>
                                         <p className="text-xs text-slate-400">{doc.details?.specialty} • CRM {doc.details?.crm}</p>
                                     </div>
                                     <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selectedDoctor === doc.id ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-600 bg-transparent'}`}>
                                         {selectedDoctor === doc.id && <Check size={14} />}
                                     </div>
                                 </div>
                             ))}
                         </div>
                         
                         <button 
                            onClick={handleBook}
                            disabled={!selectedDoctor}
                            className="w-full bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-black/20 disabled:opacity-50 disabled:shadow-none transition-all border-t border-white/10"
                         >
                             Confirmar Agendamento
                         </button>
                    </div>
                </div>
            )}

            {/* VIEW: SYMPTOMS */}
            {activeView === 'SYMPTOMS' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-[#003843] to-[#002229] border border-white/10 rounded-3xl p-8 text-white shadow-xl mb-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-2xl mb-2 flex items-center gap-2 text-teal-300"><Activity/> Triagem IA</h3>
                            <p className="text-teal-100/60 mb-6 text-sm">Descreva o que você está sentindo. Nossa Inteligência Artificial analisará seu relato e priorizará seu atendimento com o médico.</p>
                            <textarea
                                value={symptomsText}
                                onChange={e => setSymptomsText(e.target.value)}
                                placeholder="Ex: Estou com febre de 38 graus há 2 dias, dor de cabeça forte e tosse seca..."
                                className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white placeholder-teal-200/30 focus:outline-none focus:bg-black/30 focus:border-teal-500/30 transition-all h-32 resize-none"
                            ></textarea>
                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={handleSymptomSubmit}
                                    disabled={isSummarizing || !symptomsText}
                                    className="bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-100 px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSummarizing ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Enviar Relato</>}
                                </button>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            )}

            {/* VIEW: DOCS */}
            {activeView === 'DOCS' && (
                <div className="space-y-6">
                     <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-xl">
                        <FileText size={24} className="text-cyan-400"/> Documentos Médicos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myPrescriptions.map(doc => (
                            <div key={doc.id} className="bg-[#00323d]/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-lg hover:border-cyan-500/30 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 bg-[#002229] rounded-lg text-cyan-400 border border-white/5">
                                        {doc.type === 'MEDICATION' ? <Pill size={20} /> : <FileText size={20} />}
                                    </div>
                                    <span className="text-[10px] font-bold bg-white/5 text-slate-300 px-2 py-1 rounded-full uppercase">{doc.type}</span>
                                </div>
                                <p className="font-mono text-xs text-slate-500 mb-1">Token: {doc.token}</p>
                                <p className="font-bold text-white text-lg mb-1">Dr. {doc.doctorName}</p>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{doc.content}</p>
                                <button className="w-full py-2 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors">Visualizar PDF</button>
                            </div>
                        ))}
                        {myPrescriptions.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <FileCheck size={48} className="mx-auto mb-3 opacity-20"/>
                                <p>Nenhum documento emitido ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW: VITALS */}
            {activeView === 'VITALS' && (
                 <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#00323d]/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-lg">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Heart size={20} className="text-rose-500"/> Registrar Sinais</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Temperatura (°C)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={tempInput}
                                            onChange={e => setTempInput(e.target.value)}
                                            className="flex-1 bg-[#002229] border border-white/10 text-white rounded-xl p-3 focus:ring-1 focus:ring-teal-500/50 outline-none placeholder-teal-900/50"
                                            placeholder="36.5"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-teal-200/50 uppercase mb-1 block">Batimentos (BPM)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={bpmInput}
                                            onChange={e => setBpmInput(e.target.value)}
                                            className="flex-1 bg-[#002229] border border-white/10 text-white rounded-xl p-3 focus:ring-1 focus:ring-teal-500/50 outline-none placeholder-teal-900/50"
                                            placeholder="80"
                                        />
                                    </div>
                                </div>
                                <button onClick={handleVitalsSubmit} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-all border border-white/10">Salvar Registro</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <h3 className="font-bold text-white flex items-center gap-2"><Activity size={20} className="text-teal-500"/> Histórico Recente</h3>
                             {vitals.length === 0 ? (
                                 <p className="text-slate-500 text-sm italic">Nenhum registro.</p>
                             ) : (
                                 vitals.map(v => (
                                     <div key={v.id} className="bg-[#00323d]/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                                         <div className="flex items-center gap-3">
                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#002229] border border-white/5`}>
                                                 {v.type === 'TEMP' ? <Thermometer size={20} className="text-amber-500"/> : <Heart size={20} className="text-rose-500"/>}
                                             </div>
                                             <div>
                                                 <p className="font-bold text-slate-200">{v.value} {v.type === 'TEMP' ? '°C' : 'bpm'}</p>
                                                 <p className="text-xs text-slate-500">{new Date(v.timestamp).toLocaleDateString()} • {new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                             </div>
                                         </div>
                                         {v.status === 'WARNING' && <span className="text-[10px] font-bold bg-amber-900/30 text-amber-500 px-2 py-1 rounded-full border border-amber-500/20">ATENÇÃO</span>}
                                     </div>
                                 ))
                             )}
                        </div>
                    </div>
                 </div>
            )}

            </div>
        </main>
    </div>
  );
};

export default PatientDashboard;