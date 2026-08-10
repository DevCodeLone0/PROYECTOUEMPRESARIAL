"use client";

import Link from "next/link";
import { useTestStore } from "@/stores/test-store";
import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/layout/Header";
import { getUniquePrograms } from "@/lib/programs";
import BackgroundCarousel, { type BackgroundSlide } from "@/components/ui/BackgroundCarousel";

// Slides del carousel de fondo del hero: video primero, luego fotos originales y del moodboard
const heroSlides: BackgroundSlide[] = [
  { type: "video", src: "/videos/IMG_0229.mp4", poster: "/images/moodboard-campus-2.jpeg" },
  { type: "image", src: "/images/DSC_0191.JPG" },
  { type: "image", src: "/images/DSC_0228.JPG" },
  { type: "image", src: "/images/DSC_0294.JPG" },
  { type: "image", src: "/images/DSC_0299.JPG" },
  { type: "image", src: "/images/moodboard-campus-1.jpeg" },
  { type: "image", src: "/images/moodboard-campus-2.jpeg" },
  { type: "image", src: "/images/moodboard-campus-3.jpeg" },
];

const archetypes = [
  {
    emoji: "⚙️",
    name: "El Constructor",
    desc: "Optimizas todo lo que tocas. Procesos, recursos, tiempo — encuentras la forma más inteligente de hacer las cosas.",
  },
  {
    emoji: "🔬",
    name: "El Investigador",
    desc: "Tu curiosidad no tiene límites. Analizas, experimentas y descubres patrones que otros pasan por alto.",
  },
  {
    emoji: "🎨",
    name: "El Creador",
    desc: "Transformas ideas en experiencias. Tu creatividad es tu lenguaje natural y tu mayor ventaja.",
  },
  {
    emoji: "🤝",
    name: "El Conector",
    desc: "Entiendes a las personas como nadie. Empatía, comunicación y habilidades sociales son tu superpoder.",
  },
  {
    emoji: "♟️",
    name: "El Estratega",
    desc: "Planificas, organizas y ejecutas con precisión. Ves el panorama completo donde otros ven caos.",
  },
  {
    emoji: "📊",
    name: "El Analista",
    desc: "Los datos cuentan historias para ti. Metódico, preciso y orientado a la excelencia.",
  },
  {
    emoji: "🚀",
    name: "El Visionario",
    desc: "Conectas creatividad con negocio. Ves oportunidades donde otros ven problemas.",
  },
  {
    emoji: "👑",
    name: "El Líder",
    desc: "Inspiras, motivas y llevas equipos a resultados extraordinarios. Tu energía es contagiosa.",
  },
];

const steps = [
  {
    number: "01",
    title: "Responde 25 preguntas",
    desc: "Cuatro capas breves: intereses, aptitudes, valores y tu preferencia por lo presencial o virtual. Unos 5 minutos.",
  },
  {
    number: "02",
    title: "Conoce tu perfil RIASEC",
    desc: "Un radar de 6 dimensiones muestra cómo se combinan tus intereses: Realista, Investigador, Artístico, Social, Emprendedor y Convencional.",
  },
  {
    number: "03",
    title: "Descubre tu arquetipo",
    desc: "Basado en los tipos de Jung, uno de 8 arquetipos profesionales resume tu forma natural de trabajar.",
  },
  {
    number: "04",
    title: "Recibe tu ranking",
    desc: "Los 12 programas de Uniempresarial ordenados por afinidad real con tu perfil, y tu modalidad recomendada.",
  },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9 9 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    title: "Radar RIASEC",
    desc: "Visualiza tus intereses profesionales en 6 dimensiones y entiende qué actividades te motivan de verdad.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Modalidad presencial o virtual",
    desc: "El test analiza tu estilo de aprendizaje y te recomienda la modalidad del Modelo Dual que mejor se adapta a ti.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Análisis de brechas",
    desc: "Identifica las aptitudes que puedes fortalecer para acercarte a tu programa ideal y crecer en tu perfil.",
  },
];

export default function HomePage() {
  const resetTest = useTestStore((s) => s.resetTest);
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [heroActive, setHeroActive] = useState(0);

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
          <BackgroundCarousel slides={heroSlides} onActiveChange={setHeroActive} />
          {/* Dark overlay gradient — lighter to show video */}
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
                25 preguntas. 4 capas. 8 arquetipos. 12 programas. Un resultado que puede
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

            {/* Right: Decorative floating elements */}
            <div className="hidden lg:flex flex-col items-end space-y-6">
              {/* Dots indicadores del carousel */}
              <div className="flex gap-3">
                {heroSlides.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      heroActive === i ? "bg-[#00ff88] w-8" : "bg-white/20"
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

      {/* How it works — Light background */}
      <section
        id="how"
        data-reveal
        className={`py-24 md:py-32 bg-[#fafafa] text-[#0a0a0a] transition-all duration-700 ${
          visibleSections.has("how") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#D51933]/30 hover:shadow-xl hover:shadow-[#D51933]/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-5xl font-extrabold text-gray-200 group-hover:text-[#D51933]/20 transition-colors duration-300 mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archetypes — Dark section */}
      <section
        id="archetypes"
        data-reveal
        className={`py-24 md:py-32 bg-[#0a0a0a] transition-all duration-700 delay-100 ${
          visibleSections.has("archetypes") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="px-6 md:px-10">
          <div className="max-w-2xl mb-16">
            <span className="text-sm font-semibold tracking-widest text-[#00ff88] uppercase">
              Tu perfil profesional
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight leading-tight">
              8 arquetipos basados en
              <br />
              <span className="gradient-text">los tipos de Jung.</span>
            </h2>
            <p className="text-white/50 text-lg mt-4 max-w-xl">
              Tu resultado combina intereses, aptitudes y valores para revelar el arquetipo que
              mejor describe tu forma de trabajar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {archetypes.map((a, i) => (
              <div
                key={i}
                className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{a.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{a.name}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section — Dark */}
      <section
        id="stats"
        data-reveal
        className={`pb-24 bg-[#0a0a0a] transition-all duration-700 delay-100 ${
          visibleSections.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-16">
            {[
              { value: "25", label: "Preguntas" },
              { value: "4", label: "Capas" },
              { value: "8", label: "Arquetipos" },
              { value: "12", label: "Programas" },
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

      {/* What you get — Light background */}
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
              Qué obtienes
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 tracking-tight leading-tight">
              Resultados que
              <br />
              <span className="text-[#D51933]">sí puedes usar.</span>
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

      {/* Programs — Dark section */}
      <section
        id="programs"
        data-reveal
        className={`py-24 md:py-32 bg-[#0a0a0a] transition-all duration-700 delay-100 ${
          visibleSections.has("programs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="px-6 md:px-10">
          <div className="max-w-2xl mb-16">
            <span className="text-sm font-semibold tracking-widest text-[#00ff88] uppercase">
              Programas del Modelo Dual
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight leading-tight">
              Tu carrera entre
              <br />
              <span className="gradient-text">7 carreras, 5 también en virtual.</span>
            </h2>
            <p className="text-white/50 text-lg mt-4 max-w-xl">
              El test ordena los 7 programas por afinidad con tu perfil y te recomienda la
              modalidad que mejor se adapta a tu estilo de aprendizaje.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getUniquePrograms().map((p) => (
              <div
                key={p.baseId}
                className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span className="font-semibold text-white">{p.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {p.modalities.includes("presencial") && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88]">
                      Presencial
                    </span>
                  )}
                  {p.modalities.includes("virtual") && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#4da6ff]/10 text-[#4da6ff]">
                      Virtual
                    </span>
                  )}
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
            25 preguntas separan
            <br />
            <span className="gradient-text">tu futuro de la indecisión.</span>
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
