'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, authApi } from '@/lib/api';
import type { Specialty } from '@/types';

export default function SpecialtiesPage() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
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
      const data = await adminApi.getSpecialties();
      setSpecialties(data);
    } catch (error) {
      console.error('Error cargando especialidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta especialidad?')) return;

    try {
      await adminApi.deleteSpecialty(id);
      alert('Especialidad eliminada correctamente');
      loadData();
    } catch (error) {
      console.error('Error eliminando especialidad:', error);
      alert('Error al eliminar la especialidad. Puede que tenga especialistas asignados.');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Especialidades</h1>
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Listado de Especialidades ({specialties.length})
            </h2>
            <button
              onClick={() => router.push('/admin/specialties/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Nueva Especialidad
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {specialties.map((specialty) => (
                  <tr key={specialty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {specialty.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {specialty.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ${specialty.basePrice}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {specialty.duration} min
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          specialty.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {specialty.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/specialties/${specialty.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(specialty.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {specialties.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No hay especialidades registradas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
