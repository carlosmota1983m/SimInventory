import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIM Manager Pro — Inventario de Dispositivos y SIMs",
  description:
    "Gestiona tus dispositivos móviles, líneas telefónicas (SIM/eSIM) y cuentas digitales. Inventario profesional autoalojado.",
  keywords: ["SIM", "eSIM", "inventario", "dispositivos", "cuentas", "gestión"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-screen"
        style={{
          background: '#0a0a0a',
          color: '#f2f2f2',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
