"use client";

import { useEffect, useState } from "react";

export type BackgroundSlide =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster?: string };

interface BackgroundCarouselProps {
  slides: BackgroundSlide[];
  /** Intervalo para slides de imagen en ms (default 5000) */
  intervalMs?: number;
  /** Notifica el índice activo (para dots indicadores externos) */
  onActiveChange?: (index: number) => void;
}

/**
 * Carousel de fondo a pantalla completa con crossfade entre imágenes y videos.
 * - Las imágenes avanzan solas con un timer (intervalMs).
 * - El video avanza cuando termina (onEnded) y se desmonta al cambiar de slide
 *   para detener la reproducción.
 * - No agrega overlays — cada página pone los suyos encima con z-10+.
 */
export default function BackgroundCarousel({
  slides,
  intervalMs = 5000,
  onActiveChange,
}: BackgroundCarouselProps) {
  const [active, setActive] = useState(0);

  // Avanza al siguiente slide, volviendo al inicio al llegar al final
  const goNext = () => {
    setActive((prev) => (prev + 1) % slides.length);
  };

  // Timer solo para slides de imagen: al cambiar de slide activo y ser imagen,
  // arranca un nuevo timer; si es video, el avance lo controla onEnded.
  useEffect(() => {
    if (slides[active]?.type !== "image") return;
    const timer = window.setTimeout(goNext, intervalMs);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, intervalMs, slides.length]);

  // Notifica el índice activo a componentes externos (dots indicadores)
  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {slides.map((slide, i) => {
        const isActive = i === active;

        if (slide.type === "video") {
          // El video solo se renderiza cuando es el slide activo, para que se
          // desmonte y se detenga al pasar al siguiente slide.
          if (!isActive) return null;
          return (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100"
            >
              <video
                key="video-active"
                src={slide.src}
                poster={slide.poster}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={goNext}
                className="w-full h-full object-cover"
              />
            </div>
          );
        }

        return (
          <div
            key={i}
            className={
              "absolute inset-0 transition-opacity duration-1000 ease-in-out " +
              (isActive ? "opacity-100" : "opacity-0")
            }
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.src})`,
                filter: "brightness(0.85) saturate(1.15)",
                transform: isActive ? "scale(1)" : "scale(1.05)",
                transition: "transform 4s ease-out",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
