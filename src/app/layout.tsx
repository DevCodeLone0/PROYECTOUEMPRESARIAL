import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// metadataBase: en Vercel apunta al dominio real vía AUTH_URL/NEXTAUTH_URL
const siteUrl =
  process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Tu Futuro Dual — Descubre tu carrera ideal",
    template: "%s — Tu Futuro Dual",
  },
  description:
    "Test vocacional gamificado de Uniempresarial. Descubre cuál carrera universitaria se adapta mejor a tus intereses, personalidad y habilidades.",
  keywords: [
    "orientación vocacional",
    "carrera universitaria",
    "Uniempresarial",
    "test vocacional",
    "Bogotá",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Tu Futuro Dual",
    title: "Tu Futuro Dual — Descubre tu carrera ideal",
    description:
      "Test vocacional gamificado de Uniempresarial. Descubre cuál carrera universitaria se adapta mejor a tus intereses, personalidad y habilidades.",
    images: [{ url: "/images/poster-img0263.jpeg", width: 1280, height: 720 }],
  },
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
