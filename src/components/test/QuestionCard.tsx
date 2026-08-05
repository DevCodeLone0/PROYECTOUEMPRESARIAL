"use client";

import type { Question } from "@/stores/test-store";

interface QuestionCardProps {
  question: Question;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}

export default function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  // Single choice (cards)
  if (question.type === "single-choice" && question.options) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.text}
        </h2>
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onChange(index)}
              className={`group relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                value === index
                  ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                    value === index
                      ? "bg-violet-500 text-white"
                      : "bg-white/10 text-white/60 group-hover:bg-white/20"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-white/90">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Likert 5-point
  if (question.type === "likert-5" && question.options) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.text}
        </h2>
        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onChange(index + 1)}
              className={`group w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                value === index + 1
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    value === index + 1
                      ? "border-violet-500 bg-violet-500"
                      : "border-white/30 group-hover:border-white/50"
                  }`}
                >
                  {value === index + 1 && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-white/90">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Likert 4-point (Habilidades)
  if (question.type === "likert-4" && question.options) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.text}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onChange(index + 1)}
              className={`group p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                value === index + 1
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg font-bold mb-2 transition-colors ${
                  value === index + 1
                    ? "bg-violet-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-sm text-white/80">{option}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Binary
  if (question.type === "binary" && question.options) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.text}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onChange(index)}
              className={`group p-6 rounded-xl border-2 transition-all duration-200 text-center ${
                value === index
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <span className="text-lg font-semibold text-white/90">
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Free text
  if (question.type === "free-text") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.text}
        </h2>
        <p className="text-sm text-white/40">Esta pregunta es opcional</p>
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cuéntanos algo sobre tus intereses o tu futuro profesional..."
          className="w-full h-40 p-4 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none resize-none transition-colors"
        />
      </div>
    );
  }

  return null;
}
