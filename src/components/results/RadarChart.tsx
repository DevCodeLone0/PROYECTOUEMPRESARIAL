"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RIASECDimension, RIASECProfile } from "@/lib/scoring/types";

interface RadarChartProps {
  profile: RIASECProfile;
  programProfile?: RIASECProfile;
  className?: string;
}

const DIMENSION_LABELS: Record<RIASECDimension, string> = {
  R: "Realista",
  I: "Investigativo",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};

const DIMENSION_INSIGHTS: Record<RIASECDimension, string> = {
  R: "Disfrutas el trabajo práctico y tangible.",
  I: "Te motiva entender cómo funcionan las cosas.",
  A: "Valoras la creatividad y la expresión.",
  S: "Te impulsa ayudar y conectar con personas.",
  E: "Te atraen el liderazgo y los retos.",
  C: "Valoras el orden, la precisión y la organización.",
};

const DIMENSIONS: RIASECDimension[] = ["R", "I", "A", "S", "E", "C"];

function formatData(profile: RIASECProfile, programProfile?: RIASECProfile) {
  return DIMENSIONS.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    tuPerfil: Math.round(profile[dim] * 100),
    ...(programProfile
      ? { programa: Math.round(programProfile[dim] * 100) }
      : {}),
  }));
}

export default function RadarChart({
  profile,
  programProfile,
  className,
}: RadarChartProps) {
  const data = formatData(profile, programProfile);

  let strong = DIMENSIONS[0];
  let weak = DIMENSIONS[0];
  for (const dim of DIMENSIONS) {
    if (profile[dim] > profile[strong]) strong = dim;
    if (profile[dim] < profile[weak]) weak = dim;
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Radar
            name="Tu perfil"
            dataKey="tuPerfil"
            stroke="#D51933"
            fill="#D51933"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          {programProfile && (
            <Radar
              name="Programa"
              dataKey="programa"
              stroke="#0033A5"
              fill="#0033A5"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <span className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-3 h-3 rounded-full bg-[#D51933]" />
          Tu perfil
        </span>
        {programProfile && (
          <span className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-3 h-3 rounded-full bg-[#0033A5]" />
            Programa
          </span>
        )}
      </div>

      {/* Interpretation */}
      <p className="text-sm text-white/50 leading-relaxed mt-4 text-center">
        Tu dimensión más fuerte es{" "}
        <span className="text-white font-semibold">
          {DIMENSION_LABELS[strong]} ({Math.round(profile[strong] * 100)}%)
        </span>
        . La más baja es{" "}
        <span className="text-white/80 font-medium">
          {DIMENSION_LABELS[weak]}
        </span>
        . {DIMENSION_INSIGHTS[strong]}
      </p>
    </div>
  );
}
