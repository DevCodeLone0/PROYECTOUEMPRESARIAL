"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  active?: boolean;
}

export default function Confetti({ active = true }: ConfettiProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!active || hasFired.current) return;
    // Respeta la preferencia del sistema de reducir animaciones
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    hasFired.current = true;

    const duration = 4000;
    const end = Date.now() + duration;

    const colors = ["#00ff88", "#D51933", "#ff0080", "#fbbf24", "#00d4ff"];

    let rafId = 0;
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
        gravity: 0.8,
        scalar: 1.2,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
        gravity: 0.8,
        scalar: 1.2,
      });

      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame);
      }
    };

    frame();

    // Cancela el loop si el componente se desmonta antes de los 4s
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return null;
}
