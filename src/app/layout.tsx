import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sora.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
