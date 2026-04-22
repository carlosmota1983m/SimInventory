import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SIM Manager Pro — Inventario de Dispositivos y SIMs",
  description: "Gestiona tus dispositivos móviles, líneas telefónicas (SIM/eSIM) y cuentas digitales. Inventario profesional autoalojado.",
  keywords: ["SIM", "eSIM", "inventario", "dispositivos", "cuentas", "gestión"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#121212] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
