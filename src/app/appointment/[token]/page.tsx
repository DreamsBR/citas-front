"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import type { Appointment } from "@/types";

export default function AppointmentPage({
  params,
}: {
  params: { token: string };
}) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadAppointment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAppointment = async () => {
    try {
      const data = await publicApi.getAppointmentByToken(params.token);
      setAppointment(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Cita no encontrada");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      return;
    }

    setCancelling(true);
    try {
      await publicApi.cancelAppointment(params.token);
      await loadAppointment();
      alert("Cita cancelada exitosamente");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cancelar la cita");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cita...</p>
        </div>
      </main>
    );
  }

  if (error || !appointment) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Cita no encontrada
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const statusText = {
    pending: "Pendiente de Confirmación",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              Mi Cita de Fisioterapia
            </h1>
            <p className="text-gray-600">
              Aquí puedes ver los detalles de tu cita
            </p>
          </div>

          {/* Estado de la Cita */}
          <div
            className={`mb-6 p-4 rounded-lg border-2 text-center ${
              statusColors[appointment.status]
            }`}
          >
            <p className="font-semibold text-lg">
              Estado: {statusText[appointment.status]}
            </p>
            {appointment.status === "pending" && (
              <p className="text-sm mt-1">
                Recibirás un email cuando tu cita sea confirmada por nuestro
                equipo
              </p>
            )}
            {appointment.status === "confirmed" && (
              <p className="text-sm mt-1">
                ¡Tu cita ha sido confirmada! Te esperamos en la fecha y hora
                indicadas
              </p>
            )}
          </div>

          {/* Detalles de la Cita */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Detalles de la Cita
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Especialidad</p>
                <p className="text-lg font-semibold text-gray-800">
                  {appointment.specialty?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Especialista</p>
                <p className="text-lg font-semibold text-gray-800">
                  {appointment.specialist?.firstName}{" "}
                  {appointment.specialist?.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha</p>
                <p className="text-lg font-semibold text-gray-800">
                  {(() => {
                    // Parsear fecha sin conversión UTC (Perú UTC-5)
                    const dateStr = appointment.appointmentDate.split('T')[0];
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day);

                    return dateObj.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Hora</p>
                <p className="text-lg font-semibold text-gray-800">
                  {appointment.appointmentTime} hrs
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Duración</p>
                <p className="text-lg font-semibold text-gray-800">
                  {appointment.specialty?.duration || 60} minutos
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Precio</p>
                <p className="text-lg font-semibold text-green-600">
                  ${appointment.price}
                </p>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Notas</p>
                <p className="text-gray-800">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Datos del Paciente */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Tus Datos
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="text-lg text-gray-800">
                  {appointment.patientName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg text-gray-800">
                  {appointment.patientEmail}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-lg text-gray-800">
                  {appointment.patientPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Acciones
            </h2>

            {appointment.status === "pending" ||
            appointment.status === "confirmed" ? (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling ? "Cancelando..." : "Cancelar Cita"}
              </button>
            ) : (
              <p className="text-center text-gray-600">
                {appointment.status === "cancelled"
                  ? "Esta cita ha sido cancelada"
                  : "Esta cita ya ha sido completada"}
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-2">
                ¿Perdiste este link? Guárdalo en tus favoritos
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copiado al portapapeles");
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Copiar Link de esta Página
              </button>
            </div>
          </div>

          {/* Volver al inicio */}
          <div className="text-center mt-8">
            <a href="/" className="text-blue-600 hover:underline">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
