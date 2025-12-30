import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fisioterapia - Reserva tu Cita",
  description: "Sistema de reservas de citas de fisioterapia profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
