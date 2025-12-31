'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { adminApi, authApi } from '@/lib/api';
import type { Appointment } from '@/types';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadCalendarData();
    }
  }, [date, view]);

  const checkAuth = async () => {
    try {
      await authApi.getProfile();
      setLoading(false);
      loadCalendarData();
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadCalendarData = async () => {
    try {
      // Calcular rango de fechas según la vista
      let startDate: Date;
      let endDate: Date;

      if (view === 'week') {
        startDate = moment(date).startOf('week').toDate();
        endDate = moment(date).endOf('week').toDate();
      } else if (view === 'day') {
        startDate = moment(date).startOf('day').toDate();
        endDate = moment(date).endOf('day').toDate();
      } else {
        startDate = moment(date).startOf('month').toDate();
        endDate = moment(date).endOf('month').toDate();
      }

      // Formatear fechas SIN conversión UTC (zona horaria local)
      const formatDateLocal = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const appointments = await adminApi.getCalendarAppointments(
        formatDateLocal(startDate),
        formatDateLocal(endDate)
      );

      // Convertir citas a eventos del calendario
      const calendarEvents: CalendarEvent[] = appointments.map((apt) => {
        // Parsear fecha correctamente sin conversión de zona horaria
        const dateStr = apt.appointmentDate.split('T')[0]; // "2025-12-31"
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = apt.appointmentTime.split(':').map(Number);

        // Crear fecha en zona horaria local (sin conversión UTC)
        const start = new Date(year, month - 1, day, hours, minutes, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + 1); // Duración de 1 hora

        return {
          id: apt.id,
          title: `${apt.patientName} - ${apt.specialty?.name}`,
          start,
          end,
          resource: apt,
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error cargando calendario:', error);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const { status } = event.resource;

    let backgroundColor = '#3b82f6'; // azul por defecto
    let borderColor = '#2563eb';

    if (status === 'confirmed') {
      backgroundColor = '#22c55e'; // verde
      borderColor = '#16a34a';
    } else if (status === 'pending') {
      backgroundColor = '#eab308'; // amarillo
      borderColor = '#ca8a04';
    } else if (status === 'cancelled') {
      backgroundColor = '#ef4444'; // rojo
      borderColor = '#dc2626';
    } else if (status === 'completed') {
      backgroundColor = '#6366f1'; // índigo
      borderColor = '#4f46e5';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 500,
      }
    };
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Cita',
    noEventsInRange: 'No hay citas en este rango',
    showMore: (total: number) => `+ Ver más (${total})`,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Calendario de Citas</h1>
            <p className="text-gray-600 mt-1">Vista de horarios ocupados y disponibles</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Leyenda:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Pendiente</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Confirmada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-indigo-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Completada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Cancelada</span>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow p-6" style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            view={view}
            date={date}
            messages={messages}
            eventPropGetter={eventStyleGetter}
            min={new Date(2024, 0, 1, 8, 0, 0)} // 8:00 AM
            max={new Date(2024, 0, 1, 22, 0, 0)} // 10:00 PM
            step={60}
            timeslots={1}
          />
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Detalles de la Cita</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-semibold text-gray-800">{selectedEvent.resource.patientName}</p>
                <p className="text-sm text-gray-600">{selectedEvent.resource.patientEmail}</p>
                <p className="text-sm text-gray-600">{selectedEvent.resource.patientPhone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Especialidad</p>
                <p className="font-semibold text-gray-800">{selectedEvent.resource.specialty?.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Especialista</p>
                <p className="font-semibold text-gray-800">
                  {selectedEvent.resource.specialist?.firstName} {selectedEvent.resource.specialist?.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Fecha y Hora</p>
                <p className="font-semibold text-gray-800">
                  {moment(selectedEvent.start).format('dddd, D [de] MMMM [de] YYYY')}
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedEvent.resource.appointmentTime} hrs
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedEvent.resource.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  selectedEvent.resource.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedEvent.resource.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedEvent.resource.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Precio</p>
                <p className="text-xl font-bold text-blue-600">${selectedEvent.resource.price}</p>
              </div>

              {selectedEvent.resource.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="text-gray-700">{selectedEvent.resource.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleCloseModal}
              className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
