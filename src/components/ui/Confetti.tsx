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
    hasFired.current = true;

    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#8b5cf6", "#d946ef", "#ec4899", "#f59e0b", "#10b981"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [active]);

  return null;
}
