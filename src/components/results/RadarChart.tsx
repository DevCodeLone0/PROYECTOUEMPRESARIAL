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
    </div>
  );
}
