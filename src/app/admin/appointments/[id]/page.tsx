'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi, authApi } from '@/lib/api';
import type { Appointment } from '@/types';

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await authApi.getProfile();
      loadData();
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadData = async () => {
    try {
      const data = await adminApi.getAppointment(appointmentId);
      setAppointment(data);
    } catch (error) {
      console.error('Error cargando cita:', error);
      alert('Error cargando los detalles de la cita');
      router.push('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!appointment) return null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Detalles de Cita</h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Volver
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Estado y Acciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Estado de la Cita</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[appointment.status]}`}>
                  {statusLabels[appointment.status]}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">ID de Cita</p>
                <p className="text-xs font-mono text-gray-800">{appointment.id}</p>
              </div>
            </div>
          </div>

          {/* Información del Paciente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Paciente
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-800">{appointment.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-lg text-gray-800">{appointment.patientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                <p className="text-lg text-gray-800">{appointment.patientPhone}</p>
              </div>
              {appointment.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Notas del Paciente</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de la Cita */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Detalles de la Cita
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha</p>
                <p className="text-lg font-semibold text-gray-800">{appointment.appointmentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Hora</p>
                <p className="text-lg font-semibold text-gray-800">{appointment.appointmentTime} hrs</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Duración</p>
                <p className="text-lg text-gray-800">1 hora</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Precio</p>
                <p className="text-2xl font-bold text-green-600">${appointment.price}</p>
              </div>
            </div>
          </div>

          {/* Información del Servicio */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Servicio y Especialista
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Especialidad</p>
                <p className="text-lg font-semibold text-gray-800">{appointment.specialty?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Especialista</p>
                <p className="text-lg font-semibold text-gray-800">
                  {appointment.specialist?.firstName} {appointment.specialist?.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Confirmación */}
          {appointment.confirmedAt && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información de Confirmación</h2>
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmada el</p>
                <p className="text-gray-800">{new Date(appointment.confirmedAt).toLocaleString('es-ES')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
