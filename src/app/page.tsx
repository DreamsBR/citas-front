'use client';

import { useState, useEffect } from 'react';
import { publicApi } from '@/lib/api';
import type { Specialty, Specialist, CreateAppointmentDto } from '@/types';

export default function Home() {
  const [step, setStep] = useState(1);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uniqueToken, setUniqueToken] = useState('');

  // Form data
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Cargar especialidades al inicio
  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const data = await publicApi.getSpecialties();
      setSpecialties(data);
    } catch (error) {
      console.error('Error cargando especialidades:', error);
    }
  };

  const handleSpecialtySelect = async (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setLoading(true);
    try {
      const data = await publicApi.getSpecialists(specialty.id);
      setSpecialists(data);
      setStep(2);
    } catch (error) {
      console.error('Error cargando especialistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialistSelect = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setStep(3);
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');

    if (selectedSpecialist && date) {
      setLoading(true);
      try {
        const { slots } = await publicApi.getAvailableSlots(selectedSpecialist.id, date);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error cargando slots:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialty || !selectedSpecialist || !selectedDate || !selectedTime) {
      return;
    }

    setLoading(true);
    try {
      const dto: CreateAppointmentDto = {
        specialtyId: selectedSpecialty.id,
        specialistId: selectedSpecialist.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        patientName,
        patientEmail,
        patientPhone,
        notes,
      };

      const appointment = await publicApi.bookAppointment(dto);
      setUniqueToken(appointment.uniqueToken);
      setSuccess(true);
    } catch (error: any) {
      console.error('Error reservando cita:', error);
      alert(error.response?.data?.message || 'Error al reservar la cita');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const appointmentLink = `${window.location.origin}/appointment/${uniqueToken}`;

    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Cita Solicitada Exitosamente!
            </h1>

            <p className="text-gray-600 mb-6">
              Tu cita está <strong>pendiente de confirmación</strong> por nuestro equipo.
              Recibirás un email de confirmación con todos los detalles.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="font-semibold text-gray-800 mb-2">
                Guarda este link para gestionar tu cita:
              </p>
              <div className="bg-white border border-gray-300 rounded p-3 mb-3">
                <code className="text-sm text-blue-600 break-all">{appointmentLink}</code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(appointmentLink)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Copiar Link
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p><strong>Especialidad:</strong> {selectedSpecialty?.name}</p>
              <p><strong>Especialista:</strong> {selectedSpecialist?.firstName} {selectedSpecialist?.lastName}</p>
              <p><strong>Fecha:</strong> {selectedDate}</p>
              <p><strong>Hora:</strong> {selectedTime}</p>
              <p><strong>Precio:</strong> ${selectedSpecialty?.basePrice}</p>
            </div>

            <a
              href={appointmentLink}
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition mb-4"
            >
              Ver Mi Cita
            </a>

            <br />

            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline"
            >
              Reservar otra cita
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            Fisioterapia Profesional
          </h1>
          <p className="text-xl text-gray-600">
            Reserva tu cita en 4 simples pasos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-12 mt-2 text-sm text-gray-600">
            <span>Especialidad</span>
            <span>Especialista</span>
            <span>Fecha/Hora</span>
            <span>Datos</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* STEP 1: Seleccionar Especialidad */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Paso 1: Selecciona una Especialidad
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => handleSpecialtySelect(specialty)}
                    disabled={loading}
                    className="text-left p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {specialty.name}
                    </h3>
                    {specialty.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {specialty.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold">
                        ${specialty.basePrice}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {specialty.duration} min
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Seleccionar Especialista */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:underline mb-4"
              >
                ← Volver
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Paso 2: Selecciona un Especialista
              </h2>
              <div className="space-y-4">
                {specialists.map((specialist) => (
                  <button
                    key={specialist.id}
                    onClick={() => handleSpecialistSelect(specialist)}
                    className="w-full text-left p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <h3 className="text-xl font-semibold text-gray-800">
                      {specialist.firstName} {specialist.lastName}
                    </h3>
                    {specialist.bio && (
                      <p className="text-gray-600 text-sm mt-2">{specialist.bio}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Seleccionar Fecha y Hora */}
          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-blue-600 hover:underline mb-4"
              >
                ← Volver
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Paso 3: Selecciona Fecha y Hora
              </h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Horario Disponible
                  </label>
                  {loading ? (
                    <p className="text-gray-600">Cargando horarios...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-600">No hay horarios disponibles para esta fecha.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            setStep(4);
                          }}
                          className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Datos del Paciente */}
          {step === 4 && (
            <div>
              <button
                onClick={() => setStep(3)}
                className="text-blue-600 hover:underline mb-4"
              >
                ← Volver
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Paso 4: Completa tus Datos
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="juan@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+34 600 123 456"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Información adicional sobre tu consulta..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Resumen de tu Cita</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Especialidad:</strong> {selectedSpecialty?.name}<br />
                    <strong>Especialista:</strong> {selectedSpecialist?.firstName} {selectedSpecialist?.lastName}<br />
                    <strong>Fecha:</strong> {selectedDate}<br />
                    <strong>Hora:</strong> {selectedTime}<br />
                    <strong>Precio:</strong> ${selectedSpecialty?.basePrice}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Reservando...' : 'Confirmar Reserva'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
