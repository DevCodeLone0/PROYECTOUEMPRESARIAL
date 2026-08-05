"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const levels = [
  { min: 0, max: 3, name: "Explorador", color: "from-green-400 to-emerald-500" },
  { min: 4, max: 7, name: "Aventurero", color: "from-blue-400 to-cyan-500" },
  { min: 8, max: 11, name: "Estratega", color: "from-violet-400 to-purple-500" },
  { min: 12, max: 14, name: "Maestro", color: "from-orange-400 to-red-500" },
  { min: 15, max: 16, name: "Leyenda", color: "from-pink-400 to-rose-500" },
];

function getLevel(step: number) {
  return levels.find((l) => step >= l.min && step <= l.max) || levels[0];
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const level = getLevel(currentStep);
  const points = currentStep * 100;

  return (
    <div className="w-full space-y-3">
      {/* Level and Points */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white/50">Nivel:</span>
          <span className={`font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
            {level.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-bold text-yellow-400">{points}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${level.color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        {/* Glow effect */}
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${level.color} rounded-full blur-sm opacity-50 transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>
          Pregunta {currentStep} de {totalSteps}
        </span>
        <span>{Math.round(progress)}% completado</span>
      </div>
    </div>
  );
}
