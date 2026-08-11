"use client";

import type { Question } from "@/lib/scoring/types";

interface QuestionCardProps {
  question: Question;
  value: number | undefined;
  onChange: (value: number) => void;
}

/** Check circular con degradado de marca — aparece con animación al seleccionar */
function CheckBadge() {
  return (
    <span className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center shrink-0 animate-pop-in shadow-[0_0_16px_rgba(213,25,51,0.45)]">
      <svg
        className="w-5 h-5 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

const selectedClasses =
  "brand-border shadow-[0_0_24px_rgba(213,25,51,0.25)]";
const idleClasses =
  "border border-white/70 bg-white/90 hover:bg-white/100 hover:border-[#0033A5]/35 hover:scale-[1.01] backdrop-blur-md shadow-sm";

/** Underline decorativo con el degradado de marca bajo el título */
function QuestionTitle({ text }: { text: string }) {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
        {text}
      </h2>
      <div className="mt-3 h-1.5 w-24 brand-gradient rounded-full" />
    </div>
  );
}

export default function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  // Single choice (cards)
  if (question.type === "single-choice" && question.options) {
    return (
      <div className="space-y-5">
        <QuestionTitle text={question.text} />
        <div className="grid gap-3">
          {question.options.map((option, index) => {
            const selected = value === index;
            return (
              <button
                key={index}
                onClick={() => onChange(index)}
                className={`group relative w-full text-left p-4 md:p-5 rounded-2xl transition-all duration-300 ${
                  selected ? selectedClasses : idleClasses
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all duration-300 shrink-0 ${
                      selected
                        ? "brand-gradient text-white shadow-[0_0_14px_rgba(213,25,51,0.35)]"
                        : "bg-[#0033A5]/10 text-[#0033A5] group-hover:bg-[#0033A5]/15"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span
                    className={`flex-1 text-xl md:text-2xl font-semibold ${
                      selected
                        ? "text-slate-900"
                        : "text-slate-800 group-hover:text-slate-900"
                    } transition-colors`}
                  >
                    {option}
                  </span>
                  {selected && <CheckBadge />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Likert 5-point
  if (question.type === "likert-5" && question.options) {
    return (
      <div className="space-y-6">
        <QuestionTitle text={question.text} />
        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => {
            const selected = value === index + 1;
            return (
              <button
                key={index}
                onClick={() => onChange(index + 1)}
                className={`group w-full text-left p-4 md:p-5 rounded-2xl transition-all duration-300 ${
                  selected ? selectedClasses : idleClasses
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
                      selected
                        ? "border-transparent brand-gradient shadow-[0_0_10px_rgba(213,25,51,0.4)]"
                        : "border-[#0033A5]/25 group-hover:border-[#0033A5]/50"
                    }`}
                  >
                    {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span
                    className={`flex-1 text-xl md:text-2xl font-semibold ${
                      selected
                        ? "text-slate-900"
                        : "text-slate-800 group-hover:text-slate-900"
                    } transition-colors`}
                  >
                    {option}
                  </span>
                  {selected && <CheckBadge />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Binary
  if (question.type === "binary" && question.options) {
    return (
      <div className="space-y-6">
        <QuestionTitle text={question.text} />
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const selected = value === index;
            return (
              <button
                key={index}
                onClick={() => onChange(index)}
                className={`group relative p-6 md:p-8 rounded-2xl transition-all duration-300 text-center ${
                  selected ? selectedClasses : idleClasses
                }`}
              >
                <span
                  className={`block text-2xl md:text-3xl font-bold ${
                    selected
                      ? "text-slate-900"
                      : "text-slate-800 group-hover:text-slate-900"
                  } transition-colors`}
                >
                  {option}
                </span>
                <span className="absolute top-3 right-3">
                  {selected && <CheckBadge />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
