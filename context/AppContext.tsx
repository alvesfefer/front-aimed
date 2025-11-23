import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Appointment, Message, Prescription, Medication, VitalSign, ClinicalNote, Alert } from '../types';
import { api } from '../services/api';

interface AppContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  users: User[];

  appointments: Appointment[];
  addAppointment: (appt: Appointment) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  updateSymptomSummary: (apptId: string, summary: string) => Promise<void>;

  messages: Message[];
  sendMessage: (msg: Message) => Promise<void>;

  prescriptions: Prescription[];
  addPrescription: (p: Prescription) => Promise<void>;
  validateToken: (token: string) => Prescription | undefined;

  medications: Medication[];
  addMedication: (med: Medication) => Promise<void>;
  toggleMedicationTaken: (id: string) => Promise<void>;

  vitals: VitalSign[];
  addVitalSign: (vital: VitalSign) => Promise<void>;

  clinicalNotes: ClinicalNote[];
  addClinicalNote: (note: ClinicalNote) => Promise<void>;

  alerts: Alert[];
  triggerSOS: (location?: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('aimed_token');
      if (token && !user) {
        try {
          const userData = await api.auth.me();
          setUser(userData);
        } catch {
          logout();
        }
      }

      if (user) {
        try {
          const [apps, msgs, prescs, meds, vts, alrts, allUsers] = await Promise.all([
            api.appointments.list(),
            api.messages.list(),
            api.prescriptions.list(),
            api.medications.list(),
            api.vitals.list(),
            api.alerts.list(),
            api.users.list()
          ]);

          setAppointments(apps);
          setMessages(msgs);
          setPrescriptions(prescs);
          setMedications(meds);
          setVitals(vts);
          setAlerts(alrts);
          setUsers(allUsers);
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await api.auth.login(email, password, role);
      localStorage.setItem('aimed_token', response.token);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const response = await api.auth.register({ name, email, password, role });
      localStorage.setItem('aimed_token', response.token);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('aimed_token');
    setUser(null);
    setAppointments([]);
    setMessages([]);
    setPrescriptions([]);
    setMedications([]);
    setVitals([]);
    setClinicalNotes([]);
    setAlerts([]);
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await api.auth.updateProfile(user.id, updatedData);
      setUser(updated);
    } catch (error) {
      console.error("Update user failed", error);
    }
  };

  // Actions wrappers
  const addAppointment = async (appt: Appointment) => {
    try { const newAppt = await api.appointments.create(appt); setAppointments(prev => [...prev, newAppt]); } catch(e) { console.error(e); }
  };
  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try { await api.appointments.updateStatus(id, status); setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a)); } catch(e) { console.error(e); }
  };
  const updateSymptomSummary = async (apptId: string, summary: string) => {
    try { await api.appointments.updateSummary(apptId, summary); setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, symptomsSummary: summary } : a)); } catch(e) { console.error(e); }
  };
  const sendMessage = async (msg: Message) => { try { const newMsg = await api.messages.send(msg); setMessages(prev => [...prev, newMsg]); } catch(e) { console.error(e); } };
  const addPrescription = async (p: Prescription) => { try { const newP = await api.prescriptions.create(p); setPrescriptions(prev => [...prev, newP]); } catch(e) { console.error(e); } };
  const validateToken = (token: string) => prescriptions.find(p => p.token === token);
  const addMedication = async (med: Medication) => { try { const newMed = await api.medications.create(med); setMedications(prev => [...prev, newMed]); } catch(e) { console.error(e); } };
  const toggleMedicationTaken = async (id: string) => { try { const updatedMed = await api.medications.toggleTaken(id); setMedications(prev => prev.map(m => m.id === id ? updatedMed : m)); } catch(e) { console.error(e); } };
  const addVitalSign = async (vital: VitalSign) => { try { const newVital = await api.vitals.create(vital); setVitals(prev => [newVital, ...prev]); } catch(e) { console.error(e); } };
  const addClinicalNote = async (note: ClinicalNote) => setClinicalNotes(prev => [...prev, note]);
  const triggerSOS = async (location?: string) => { try { const newAlert = await api.alerts.create({ id: '', type: 'SOS', timestamp: Date.now(), resolved: false, location: location || 'Desconhecida' }); setAlerts(prev => [newAlert, ...prev]); } catch(e) { console.error(e); } };
  const resolveAlert = async (id: string) => { try { await api.alerts.resolve(id); setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a)); } catch(e) { console.error(e); } };

  return (
    <AppContext.Provider value={{
      user, users, login, register, logout, updateUser,
      appointments, addAppointment, updateAppointmentStatus, updateSymptomSummary,
      messages, sendMessage,
      prescriptions, addPrescription, validateToken,
      medications, addMedication, toggleMedicationTaken,
      vitals, addVitalSign,
      clinicalNotes, addClinicalNote,
      alerts, triggerSOS, resolveAlert
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
        