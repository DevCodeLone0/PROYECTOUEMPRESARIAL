import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tu Futuro Dual — Descubre tu carrera ideal",
  description:
    "Test vocacional gamificado de Uniempresarial. Descubre cuál carrera universitaria se adapta mejor a tus intereses, personalidad y habilidades.",
  keywords: [
    "orientación vocacional",
    "carrera universitaria",
    "Uniempresarial",
    "test vocacional",
    "Bogotá",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-black text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
