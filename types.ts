export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  INSTITUTION = 'INSTITUTION'
}

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  details?: {
    crm?: string; // Doctor
    susNumber?: string; // Patient
    institutionId?: string; // Institution
    specialty?: string; // Doctor
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO string
  time: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'WAITING';
  urgency: UrgencyLevel;
  symptomsSummary?: string;
  meetLink?: string;
}

export interface Message {
  id: string;
  appointmentId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'SYSTEM';
  timestamp: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  content: string;
  date: string;
  token: string; 
  type: 'MEDICATION' | 'EXAM' | 'PROCEDURE' | 'CERTIFICATE' | 'REFERRAL';
  validUntil: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  nextDose: string;
  lastTaken?: string;
  icon: 'PILL' | 'SYRUP' | 'INJECTION' | 'DROPS';
}

export interface VitalSign {
  id: string;
  patientId: string;
  type: 'TEMP' | 'BPM' | 'PRESSURE' | 'OXYGEN';
  value: string;
  timestamp: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  content: string;
  isPrivate: boolean;
  timestamp: number;
}

export interface Alert {
  id: string;
  type: 'SOS' | 'URGENT_CARE';
  patientId?: string;
  location?: string;
  timestamp: number;
  resolved: boolean;
}
