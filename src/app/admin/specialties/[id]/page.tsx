'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi, authApi } from '@/lib/api';
import type { Specialty } from '@/types';

export default function EditSpecialtyPage() {
  const router = useRouter();
  const params = useParams();
  const specialtyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    duration: '',
    isActive: true,
  });

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
      const allSpecialties = await adminApi.getSpecialties();
      const found = allSpecialties.find((s) => s.id === specialtyId);

      if (!found) {
        alert('Especialidad no encontrada');
        router.push('/admin/specialties');
        return;
      }

      setSpecialty(found);
      setFormData({
        name: found.name,
        description: found.description || '',
        basePrice: found.basePrice.toString(),
        duration: found.duration.toString(),
        isActive: found.isActive,
      });
    } catch (error) {
      console.error('Error cargando especialidad:', error);
      alert('Error al cargar la especialidad');
      router.push('/admin/specialties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.basePrice || !formData.duration) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setSaving(true);
    try {
      await adminApi.updateSpecialty(specialtyId, {
        name: formData.name,
        description: formData.description || undefined,
        basePrice: parseFloat(formData.basePrice),
        duration: parseInt(formData.duration),
        isActive: formData.isActive,
      });
      alert('Especialidad actualizada correctamente');
      router.push('/admin/specialties');
    } catch (error) {
      console.error('Error actualizando especialidad:', error);
      alert('Error al actualizar la especialidad');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!specialty) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Editar Especialidad</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Fisioterapia Deportiva"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Descripción de la especialidad..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Base (S/) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                  <option value="120">120 minutos</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Especialidad activa
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500">
                ID: <span className="font-mono">{specialty.id}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Creado: {new Date(specialty.createdAt).toLocaleString('es-ES')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Actualizado: {new Date(specialty.updatedAt).toLocaleString('es-ES')}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/specialties')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
