// Enums
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
}

// Entities
export interface Specialty {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialist {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  isActive: boolean;
  specialtyId: string;
  specialty?: Specialty;
  availabilities?: Availability[];
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: string;
  specialistId: string;
  dayOfWeek: number; // 0=domingo, 6=sábado
  startTime: string; // HH:MM
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  specialtyId: string;
  specialistId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  status: AppointmentStatus;
  price: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  uniqueToken: string;
  notes?: string;
  confirmedAt?: string;
  confirmedById?: string;
  specialty?: Specialty;
  specialist?: Specialist;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreateAppointmentDto {
  specialtyId: string;
  specialistId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: Admin;
  token: string;
}

// Analytics
export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalRevenue: number;
}

export interface TopSpecialistStats {
  specialistId: string;
  specialistName: string;
  specialtyName: string;
  appointmentCount: number;
  totalRevenue: number;
}
