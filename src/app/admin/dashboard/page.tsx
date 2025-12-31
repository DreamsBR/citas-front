'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, authApi } from '@/lib/api';
import type { Appointment, DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  // Recargar datos cuando cambia el filtro
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [filter]);

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
      const [appointmentsData, statsData] = await Promise.all([
        adminApi.getAllAppointments(filter),
        adminApi.getDashboardStats(),
      ]);
      setAppointments(appointmentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!confirm('¿Confirmar esta cita?')) return;

    try {
      await adminApi.confirmAppointment(id, 'confirmed');
      await loadData();
      alert('Cita confirmada. Email enviado al paciente.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error confirmando cita');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('¿Rechazar esta cita?')) return;

    try {
      await adminApi.confirmAppointment(id, 'cancelled');
      await loadData();
      alert('Cita rechazada');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error rechazando cita');
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Panel Admin - Fisioterapia</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/calendar')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendario
            </button>
            <button
              onClick={() => router.push('/admin/specialists')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Especialistas
            </button>
            <button
              onClick={() => router.push('/admin/reports')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reportes
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-1">Total Citas</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-1">Confirmadas</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmedAppointments}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-1">Ingresos</p>
              <p className="text-3xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtrar Citas</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded transition-colors ${filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded transition-colors ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded transition-colors ${filter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Confirmadas
            </button>
          </div>
        </div>

        {/* Tabla de Citas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Citas ({appointments.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialista</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{apt.patientName}</p>
                        <p className="text-sm text-gray-500">{apt.patientEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{apt.specialty?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {apt.specialist?.firstName} {apt.specialist?.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-800">{apt.appointmentDate}</p>
                        <p className="text-gray-500">{apt.appointmentTime}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[apt.status]}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">${apt.price}</td>
                    <td className="px-6 py-4">
                      {apt.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleReject(apt.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {appointments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No hay citas para mostrar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
