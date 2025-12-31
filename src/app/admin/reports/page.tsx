'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, authApi } from '@/lib/api';
import type { Specialist } from '@/types';

export default function ReportsPage() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [hoursReport, setHoursReport] = useState<any>(null);
  const [profitReport, setProfitReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const checkAuth = async () => {
    try {
      await authApi.getProfile();
      loadSpecialists();
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadSpecialists = async () => {
    try {
      const data = await adminApi.getSpecialists();
      setSpecialists(data.filter(s => s.isActive));
    } catch (error) {
      console.error('Error cargando especialistas:', error);
    }
  };

  const loadReports = async () => {
    if (!selectedSpecialist || !startDate || !endDate) {
      alert('Por favor selecciona un especialista y el rango de fechas');
      return;
    }

    setLoading(true);
    try {
      const [revenue, hours, profit] = await Promise.all([
        adminApi.getSpecialistRevenue(selectedSpecialist, startDate, endDate),
        adminApi.getSpecialistHours(selectedSpecialist, startDate, endDate),
        adminApi.getSpecialistProfit(selectedSpecialist, startDate, endDate),
      ]);

      setRevenueReport(revenue);
      setHoursReport(hours);
      setProfitReport(profit);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error cargando reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Reportes de Especialistas</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Volver
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
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Seleccionar Criterios</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialista
              </label>
              <select
                value={selectedSpecialist}
                onChange={(e) => setSelectedSpecialist(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={loadReports}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
        </div>

        {/* Reportes */}
        {revenueReport && hoursReport && profitReport && (
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Especialista</p>
                  <p className="text-lg font-semibold text-gray-800">{revenueReport.specialistName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Especialidad</p>
                  <p className="text-lg font-semibold text-gray-800">{revenueReport.specialtyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Periodo</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {revenueReport.period.startDate} al {revenueReport.period.endDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Reporte de Ingresos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reporte de Ingresos
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total de Citas</p>
                  <p className="text-3xl font-bold text-green-600">{revenueReport.appointmentCount}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-green-600">${revenueReport.totalRevenue}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Promedio por Cita</p>
                  <p className="text-3xl font-bold text-green-600">${revenueReport.averageRevenuePerAppointment}</p>
                </div>
              </div>
            </div>

            {/* Reporte de Horas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reporte de Horas Trabajadas
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total de Citas</p>
                  <p className="text-3xl font-bold text-blue-600">{hoursReport.appointmentCount}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Horas Totales</p>
                  <p className="text-3xl font-bold text-blue-600">{hoursReport.totalHours}h</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Promedio por Día</p>
                  <p className="text-3xl font-bold text-blue-600">{hoursReport.averageHoursPerDay}h</p>
                </div>
              </div>
            </div>

            {/* Reporte de Profit */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Análisis de Rentabilidad
              </h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-purple-600">${profitReport.totalRevenue}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Salario Mensual</p>
                  <p className="text-3xl font-bold text-purple-600">${profitReport.monthlySalary}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Salario Proporcional (Periodo)</p>
                  <p className="text-3xl font-bold text-orange-600">${profitReport.proportionalSalary}</p>
                </div>
                <div className={`rounded-lg p-4 ${profitReport.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Profit</p>
                  <p className={`text-3xl font-bold ${profitReport.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profitReport.profit}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Margen: {profitReport.profitMargin.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!revenueReport && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600 text-lg">
              Selecciona un especialista y rango de fechas para generar los reportes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
