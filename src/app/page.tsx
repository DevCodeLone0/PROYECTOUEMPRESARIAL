"use client";

import Link from "next/link";
import { useTestStore } from "@/stores/test-store";
import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/layout/Header";

const photos = [
  "/images/DSC_0191.JPG",
  "/images/DSC_0294.JPG",
  "/images/DSC_0228.JPG",
  "/images/DSC_0299.JPG",
];

export default function HomePage() {
  const resetTest = useTestStore((s) => s.resetTest);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Carousel auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhoto((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/audio/Bella Ciao.mp3");
    audioRef.current.loop = false;
    audioRef.current.volume = 0.15;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleFirstInteraction = useCallback(() => {
    if (!audioStarted && audioRef.current) {
      audioRef.current.play().then(() => {
        setAudioStarted(true);
        setAudioPlaying(true);
      }).catch(() => {
        setAudioStarted(true);
      });
    }
  }, [audioStarted]);

  useEffect(() => {
    const handler = () => handleFirstInteraction();
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [handleFirstInteraction]);

  const toggleAudio = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setAudioPlaying(!audioPlaying);
    }
  }, [audioPlaying]);

  const handleStart = () => {
    resetTest();
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll("[data-reveal]");
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Autoconocimiento",
      desc: "Explora tus intereses, personalidad y habilidades de forma interactiva.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: "12 Programas",
      desc: "Compara carreras de Uniempresarial con un modelo Dual de negocio.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Gamificado",
      desc: "Gana puntos, sube de nivel y descubre tu arquetipo profesional.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Audio toggle */}
      {audioStarted && (
        <button
          onClick={toggleAudio}
          className="fixed top-4 right-4 z-50 glass rounded-full p-3 hover:bg-white/10 transition-all"
          aria-label={audioPlaying ? "Pausar música" : "Reproducir música"}
        >
          {audioPlaying ? (
            <svg className="w-5 h-5 text-neon-green" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          )}
        </button>
      )}

      {/* Header */}
      <Header />

      {/* Hero Section — Asymmetric layout with carousel */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background carousel */}
        <div className="absolute inset-0 z-0">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: currentPhoto === i ? 1 : 0 }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${photo})`,
                  filter: "brightness(0.85) saturate(1.15)",
                  transform: currentPhoto === i ? "scale(1)" : "scale(1.05)",
                  transition: "transform 4s ease-out",
                }}
              />
            </div>
          ))}
          {/* Dark overlay gradient — lighter to show images */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 via-transparent to-transparent" />
        </div>

        {/* Hero Content — Chaptr-style asymmetric */}
        <div className="relative z-10 w-full px-6 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Bold typography */}
            <div className="space-y-8 bg-[#0a0a0a]/70 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/5">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-[0.85] animate-slide-up">
                <span className="gradient-text drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">Descubre</span>
                <br />
                <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">tu carrera</span>
                <br />
                <span className="text-white font-light text-5xl md:text-6xl lg:text-7xl">ideal</span>
              </h1>

              <p className="text-2xl md:text-3xl text-white/70 max-w-lg leading-relaxed animate-fade-in font-light" style={{ animationDelay: "0.3s" }}>
                16 preguntas. 4 dimensiones. 12 programas. Un resultado que puede
                cambiar tu futuro.
              </p>

              <div className="flex flex-wrap items-center gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <Link
                  href="/test"
                  onClick={handleStart}
                  className="group relative inline-flex items-center gap-3 bg-white text-[#0a0a0a] font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:text-white hover:scale-105"
                >
                  Empezar el test
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <div className="flex items-center gap-6 text-sm text-white/40">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ~5 min
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Gratis
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Carousel indicator dots + decorative */}
            <div className="hidden lg:flex flex-col items-end space-y-6">
              {/* Photo index indicator */}
              <div className="flex gap-3">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      currentPhoto === i
                        ? "bg-[#00ff88] w-8"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>

              {/* Floating decorative elements */}
              <div className="relative w-80 h-80">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D51933]/10 rounded-3xl rotate-12 animate-float" />
                <div className="absolute bottom-10 left-0 w-24 h-24 bg-[#00ff88]/10 rounded-2xl -rotate-6 animate-float" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#ff0080]/10 rounded-xl rotate-45 animate-float" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30 text-sm animate-float">
          <span>Scroll</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section — Light background (Chaptr editorial feel) */}
      <section
        id="features"
        data-reveal
        className={`py-24 md:py-32 bg-[#fafafa] text-[#0a0a0a] transition-all duration-700 ${
          visibleSections.has("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="px-6 md:px-10">
          <div className="max-w-2xl mb-16">
            <span className="text-sm font-semibold tracking-widest text-[#D51933] uppercase">
              Cómo funciona
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 tracking-tight leading-tight">
              No es solo un test.
              <br />
              <span className="text-[#D51933]">Es tu mapa de futuro.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#D51933]/30 hover:shadow-xl hover:shadow-[#D51933]/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#D51933]/10 flex items-center justify-center text-[#D51933] mb-6 group-hover:bg-[#D51933] group-hover:text-white transition-all duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section — Dark gamified */}
      <section
        id="stats"
        data-reveal
        className={`py-24 bg-[#0a0a0a] transition-all duration-700 delay-100 ${
          visibleSections.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "16", label: "Preguntas" },
              { value: "4", label: "Dimensiones" },
              { value: "12", label: "Programas" },
              { value: "~5", label: "Minutos" },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-extrabold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section — Mixed light/dark (Chaptr editorial) */}
      <section
        id="cta"
        data-reveal
        className={`py-24 md:py-32 bg-[#fafafa] text-[#0a0a0a] transition-all duration-700 delay-100 ${
          visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="px-6 md:px-10 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Tu futuro no espera.
            <br />
            <span className="gradient-text">Empieza ahora.</span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Toma el test y descubre qué carrera se alinea con quién eres.
            Sin costos, sin compromisos.
          </p>
          <Link
            href="/test"
            onClick={handleStart}
            className="group inline-flex items-center gap-3 bg-[#0a0a0a] text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:scale-105 hover:shadow-2xl"
          >
            Comenzar ahora
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/30 bg-[#0a0a0a]">
        <p>
          Fundación Universitaria Empresarial de la CCB — Uniempresarial
        </p>
      </footer>
    </div>
  );
}
