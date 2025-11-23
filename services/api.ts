import { User, Appointment, Message, Prescription, Medication, VitalSign, Alert } from '../types';

const API_URL = 'https://back-aimed.vercel.app';

const getHeaders = () => {
  const token = localStorage.getItem('aimed_token');
  return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(err.message || res.statusText);
  }
  return res.json();
};

export const api = {
  auth: {
    login: (email: string, password: string, role: string) => fetch(`${API_URL}/auth/login`, { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email,password,role}) }).then(handleResponse),
    register: (userData: Partial<User> & { password: string, role: string }) => fetch(`${API_URL}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(userData) }).then(handleResponse),
    me: () => fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
    updateProfile: (id: string, data: Partial<User>) => fetch(`${API_URL}/users/${id}`, { method:'PUT', headers:getHeaders(), body:JSON.stringify(data) }).then(handleResponse)
  },
  appointments: {
    list: () => fetch(`${API_URL}/appointments`, { headers: getHeaders() }).then(handleResponse),
    create: (data: Appointment) => fetch(`${API_URL}/appointments`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handleResponse),
    updateStatus: (id: string, status: string) => fetch(`${API_URL}/appointments/${id}/status`, { method:'PATCH', headers:getHeaders(), body:JSON.stringify({status}) }).then(handleResponse),
    updateSummary: (id: string, summary: string) => fetch(`${API_URL}/appointments/${id}/summary`, { method:'PATCH', headers:getHeaders(), body:JSON.stringify({summary}) }).then(handleResponse)
  },
  messages: {
    list: (appointmentId?: string) => fetch(`${API_URL}/messages${appointmentId ? `?appointmentId=${appointmentId}` : ''}`, { headers:getHeaders() }).then(handleResponse),
    send: (data: Message) => fetch(`${API_URL}/messages`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handleResponse)
  },
  prescriptions: {
    list: () => fetch(`${API_URL}/prescriptions`, { headers:getHeaders() }).then(handleResponse),
    create: (data: Prescription) => fetch(`${API_URL}/prescriptions`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handleResponse)
  },
  medications: {
    list: () => fetch(`${API_URL}/medications`, { headers:getHeaders() }).then(handleResponse),
    create: (data: Medication) => fetch(`${API_URL}/medications`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handleResponse),
    toggleTaken: (id: string) => fetch(`${API_URL}/medications/${id}/toggle`, { method:'PATCH', headers:getHeaders() }).then(handleResponse)
  },
  vitals: {
    list: () => fetch(`${API_URL}/vitals`, { headers:getHeaders() }).then(handleResponse),
    create: (data: VitalSign) => fetch(`${API_URL}/vitals`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handleResponse)
  },
  alerts: {
    list: () => fetch(`${API_URL}/alerts`, { headers:getHeaders() }).then(handleResponse),
    create: (data: Alert) => fetch(`${API_URL}/alerts`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handleResponse),
    resolve: (id: string) => fetch(`${API_URL}/alerts/${id}/resolve`, { method:'PATCH', headers:getHeaders() }).then(handleResponse)
  },
  users: {
    list: () => fetch(`${API_URL}/users`, { headers:getHeaders() }).then(handleResponse)
  }
};
