/**
 * Scoring matrix: 4 dimensions × 12 programs
 * Each dimension has weights for each program.
 * Weights are placeholder values — should be tuned with domain expert.
 * Weights per dimension roughly sum to ~1.0 (not strictly enforced).
 */

export type Dimension = "intereses" | "personalidad" | "habilidades" | "motivacion";
export type ProgramId = string;

export const DIMENSIONS: Dimension[] = [
  "intereses",
  "personalidad",
  "habilidades",
  "motivacion",
];

export const WEIGHTS: Record<Dimension, Record<ProgramId, number>> = {
  intereses: {
    "ing-software": 0.12,
    "negocios-turisticos": 0.07,
    "admin-empresas": 0.09,
    "negocios-internacionales": 0.08,
    "finanzas": 0.08,
    "ing-industrial": 0.09,
    "marketing": 0.10,
    "ing-software-virtual": 0.10,
    "admin-empresas-virtual": 0.07,
    "negocios-turisticos-virtual": 0.05,
    "ing-industrial-virtual": 0.07,
    "marketing-virtual": 0.08,
  },
  personalidad: {
    "ing-software": 0.08,
    "negocios-turisticos": 0.09,
    "admin-empresas": 0.10,
    "negocios-internacionales": 0.09,
    "finanzas": 0.08,
    "ing-industrial": 0.09,
    "marketing": 0.09,
    "ing-software-virtual": 0.07,
    "admin-empresas-virtual": 0.09,
    "negocios-turisticos-virtual": 0.08,
    "ing-industrial-virtual": 0.07,
    "marketing-virtual": 0.07,
  },
  habilidades: {
    "ing-software": 0.11,
    "negocios-turisticos": 0.06,
    "admin-empresas": 0.08,
    "negocios-internacionales": 0.08,
    "finanzas": 0.09,
    "ing-industrial": 0.10,
    "marketing": 0.07,
    "ing-software-virtual": 0.10,
    "admin-empresas-virtual": 0.07,
    "negocios-turisticos-virtual": 0.06,
    "ing-industrial-virtual": 0.09,
    "marketing-virtual": 0.09,
  },
  motivacion: {
    "ing-software": 0.09,
    "negocios-turisticos": 0.08,
    "admin-empresas": 0.09,
    "negocios-internacionales": 0.09,
    "finanzas": 0.08,
    "ing-industrial": 0.08,
    "marketing": 0.09,
    "ing-software-virtual": 0.08,
    "admin-empresas-virtual": 0.09,
    "negocios-turisticos-virtual": 0.08,
    "ing-industrial-virtual": 0.08,
    "marketing-virtual": 0.09,
  },
};
