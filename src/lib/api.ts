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

  updateAppointment: async (
    id: string,
    updateData: Partial<Appointment>
  ): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}`, updateData);
    return data;
  },

  confirmAppointment: async (
    id: string,
    status: string
  ): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}/confirm`, { status });
    return data;
  },

  completeAppointment: async (id: string): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}/complete`);
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

  getSpecialistRevenue: async (
    specialistId: string,
    startDate: string,
    endDate: string
  ): Promise<any> => {
    const { data } = await api.get('/analytics/specialist-revenue', {
      params: { specialistId, startDate, endDate },
    });
    return data;
  },

  getSpecialistHours: async (
    specialistId: string,
    startDate: string,
    endDate: string
  ): Promise<any> => {
    const { data } = await api.get('/analytics/specialist-hours', {
      params: { specialistId, startDate, endDate },
    });
    return data;
  },

  getSpecialistProfit: async (
    specialistId: string,
    startDate: string,
    endDate: string
  ): Promise<any> => {
    const { data } = await api.get('/analytics/specialist-profit', {
      params: { specialistId, startDate, endDate },
    });
    return data;
  },

  // Specialties
  getSpecialties: async (): Promise<Specialty[]> => {
    const { data } = await api.get('/specialties/all');
    return data;
  },

  createSpecialty: async (specialtyData: Partial<Specialty>): Promise<Specialty> => {
    const { data } = await api.post('/specialties', specialtyData);
    return data;
  },

  updateSpecialty: async (
    id: string,
    specialtyData: Partial<Specialty>
  ): Promise<Specialty> => {
    const { data } = await api.patch(`/specialties/${id}`, specialtyData);
    return data;
  },

  deleteSpecialty: async (id: string): Promise<void> => {
    await api.delete(`/specialties/${id}`);
  },

  // Specialists
  getSpecialists: async (): Promise<Specialist[]> => {
    const { data } = await api.get('/specialists');
    return data;
  },

  getSpecialist: async (id: string): Promise<Specialist> => {
    const { data } = await api.get(`/specialists/${id}`);
    return data;
  },

  createSpecialist: async (specialistData: Partial<Specialist>): Promise<Specialist> => {
    const { data } = await api.post('/specialists', specialistData);
    return data;
  },

  updateSpecialist: async (
    id: string,
    specialistData: Partial<Specialist>
  ): Promise<Specialist> => {
    const { data } = await api.patch(`/specialists/${id}`, specialistData);
    return data;
  },

  deleteSpecialist: async (id: string): Promise<void> => {
    await api.delete(`/specialists/${id}`);
  },

  uploadSpecialistPhoto: async (id: string, file: File): Promise<Specialist> => {
    const formData = new FormData();
    formData.append('photo', file);
    const { data } = await api.post(`/specialists/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteSpecialistPhoto: async (id: string): Promise<Specialist> => {
    const { data } = await api.delete(`/specialists/${id}/photo`);
    return data;
  },
};

export default api;
