import axios from 'axios';
import type {
  Specialty,
  Specialist,
  Appointment,
  CreateAppointmentDto,
  LoginDto,
  LoginResponse,
  DashboardStats,
  TopSpecialistStats,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ========== PUBLIC ENDPOINTS ==========

export const publicApi = {
  // Especialidades
  getSpecialties: async (): Promise<Specialty[]> => {
    const { data } = await api.get('/specialties');
    return data;
  },

  // Especialistas
  getSpecialists: async (specialtyId?: string): Promise<Specialist[]> => {
    const params = specialtyId ? { specialtyId } : {};
    const { data } = await api.get('/specialists', { params });
    return data;
  },

  // Slots disponibles
  getAvailableSlots: async (
    specialistId: string,
    date: string
  ): Promise<{ slots: string[] }> => {
    const { data } = await api.get('/appointments/public/available-slots', {
      params: { specialistId, date },
    });
    return data;
  },

  // Reservar cita
  bookAppointment: async (dto: CreateAppointmentDto): Promise<Appointment> => {
    const { data } = await api.post('/appointments/public/book', dto);
    return data;
  },

  // Ver cita con token
  getAppointmentByToken: async (token: string): Promise<Appointment> => {
    const { data } = await api.get(`/appointments/public/token/${token}`);
    return data;
  },

  // Cancelar cita
  cancelAppointment: async (token: string): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/public/token/${token}/cancel`);
    return data;
  },
};

// ========== AUTH ENDPOINTS ==========

export const authApi = {
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', dto);
    // Guardar token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

// ========== ADMIN ENDPOINTS ==========

export const adminApi = {
  // Appointments
  getAllAppointments: async (status?: string): Promise<Appointment[]> => {
    const params = status ? { status } : {};
    const { data } = await api.get('/appointments', { params });
    return data;
  },

  getAppointment: async (id: string): Promise<Appointment> => {
    const { data } = await api.get(`/appointments/${id}`);
    return data;
  },

  confirmAppointment: async (
    id: string,
    status: string
  ): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}/confirm`, { status });
    return data;
  },

  getCalendarAppointments: async (
    startDate: string,
    endDate: string
  ): Promise<Appointment[]> => {
    const { data } = await api.get('/appointments/calendar', {
      params: { startDate, endDate },
    });
    return data;
  },

  // Analytics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },

  getTopSpecialists: async (limit?: number): Promise<TopSpecialistStats[]> => {
    const params = limit ? { limit } : {};
    const { data } = await api.get('/analytics/top-specialists', { params });
    return data;
  },

  // Specialties
  getSpecialties: async (): Promise<Specialty[]> => {
    const { data } = await api.get('/specialties/all');
    return data;
  },

  // Specialists
  getSpecialists: async (): Promise<Specialist[]> => {
    const { data } = await api.get('/specialists');
    return data;
  },
};

export default api;
