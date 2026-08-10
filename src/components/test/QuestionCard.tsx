"use client";

import type { Question } from "@/lib/scoring/types";

interface QuestionCardProps {
  question: Question;
  value: number | undefined;
  onChange: (value: number) => void;
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
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.text}
        </h2>
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onChange(index)}
              className={`group relative w-full text-left p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                value === index
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    value === index
                      ? "bg-white text-[#111]"
                      : "bg-white/10 text-white/80 group-hover:bg-white/15"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span
                  className={`font-medium ${
                    value === index ? "text-white" : "text-white/90 group-hover:text-white"
                  } transition-colors`}
                >
                  {option}
                </span>
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
              className={`group w-full text-left p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                value === index + 1
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    value === index + 1
                      ? "border-white bg-white"
                      : "border-white/25 group-hover:border-white/50"
                  }`}
                >
                  {value === index + 1 && (
                    <div className="w-2 h-2 bg-[#111] rounded-full" />
                  )}
                </div>
                <span
                  className={`font-medium ${
                    value === index + 1 ? "text-white" : "text-white/90 group-hover:text-white"
                  } transition-colors`}
                >
                  {option}
                </span>
              </div>
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
              className={`group p-6 md:p-8 rounded-2xl border transition-all duration-300 text-center ${
                value === index
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <span
                className={`text-lg font-semibold ${
                  value === index ? "text-white" : "text-white/90 group-hover:text-white"
                } transition-colors`}
              >
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
