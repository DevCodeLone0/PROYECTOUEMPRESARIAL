/**
 * Program Profiles Matrix — 12 programs with requirement vectors.
 *
 * Each program has:
 *   - riasec: 6-element RIASEC requirement vector [R, I, A, S, E, C], values in [0, 1]
 *   - aptitude: 4-element aptitude requirement vector, values in [0, 1]
 *   - values: 4-element values/lifestyle requirement vector, values in [0, 1]
 *
 * RIASEC vectors sourced from the RIASEC scoring spec.
 * Aptitude vectors map to Layer 2 dimensions: [logical, planning, creative, social].
 * Values vectors map to Layer 3 dimensions: [autonomy, risk-tolerance, flexibility, helping].
 *
 * Virtual programs share the same academic profile as their presencial counterparts
 * but with higher autonomy/flexibility requirements (self-paced learning).
 */

import type { ProgramProfile } from "./types";

export const PROGRAM_PROFILES: ProgramProfile[] = [
  // ── INGENIERÍA DE SOFTWARE (Presencial) ──
  {
    id: "ing-software",
    name: "Ingeniería de Software",
    riasec: { R: 0.9, I: 0.8, A: 0.2, S: 0.1, E: 0.3, C: 0.4 },
    aptitude: [0.9, 0.5, 0.3, 0.2],
    values: [0.6, 0.5, 0.4, 0.1],
  },

  // ── NEGOCIOS TURÍSTICOS Y HOTELEROS (Presencial) ──
  {
    id: "negocios-turisticos",
    name: "Negocios Turísticos y Hoteleros",
    riasec: { R: 0.2, I: 0.2, A: 0.4, S: 0.9, E: 0.7, C: 0.3 },
    aptitude: [0.3, 0.4, 0.3, 0.9],
    values: [0.3, 0.4, 0.5, 0.9],
  },

  // ── ADMINISTRACIÓN DE EMPRESAS (Presencial) ──
  {
    id: "admin-empresas",
    name: "Administración de Empresas",
    riasec: { R: 0.3, I: 0.4, A: 0.2, S: 0.5, E: 0.9, C: 0.7 },
    aptitude: [0.7, 0.9, 0.2, 0.7],
    values: [0.5, 0.7, 0.3, 0.5],
  },

  // ── NEGOCIOS INTERNACIONALES (Presencial) ──
  {
    id: "negocios-internacionales",
    name: "Negocios Internacionales",
    riasec: { R: 0.2, I: 0.3, A: 0.3, S: 0.8, E: 0.8, C: 0.5 },
    aptitude: [0.6, 0.6, 0.2, 0.8],
    values: [0.5, 0.6, 0.6, 0.7],
  },

  // ── FINANZAS Y COMERCIO EXTERIOR (Presencial) ──
  {
    id: "finanzas",
    name: "Finanzas y Comercio Exterior",
    riasec: { R: 0.4, I: 0.7, A: 0.1, S: 0.2, E: 0.5, C: 0.9 },
    aptitude: [0.9, 0.7, 0.1, 0.2],
    values: [0.4, 0.3, 0.2, 0.3],
  },

  // ── INGENIERÍA INDUSTRIAL (Presencial) ──
  {
    id: "ing-industrial",
    name: "Ingeniería Industrial",
    riasec: { R: 0.8, I: 0.7, A: 0.2, S: 0.3, E: 0.4, C: 0.8 },
    aptitude: [0.8, 0.8, 0.4, 0.3],
    values: [0.5, 0.5, 0.3, 0.2],
  },

  // ── MARKETING (Presencial) ──
  {
    id: "marketing",
    name: "Marketing",
    riasec: { R: 0.3, I: 0.3, A: 0.9, S: 0.6, E: 0.7, C: 0.3 },
    aptitude: [0.3, 0.4, 0.9, 0.7],
    values: [0.5, 0.6, 0.7, 0.6],
  },

  // ── INGENIERÍA DE SOFTWARE (Virtual) ──
  {
    id: "ing-software-virtual",
    name: "Ingeniería de Software Virtual",
    riasec: { R: 0.9, I: 0.8, A: 0.2, S: 0.1, E: 0.3, C: 0.4 },
    aptitude: [0.9, 0.6, 0.3, 0.1],
    values: [0.8, 0.5, 0.7, 0.1],
  },

  // ── ADMINISTRACIÓN DE EMPRESAS (Virtual) ──
  {
    id: "admin-empresas-virtual",
    name: "Administración de Empresas Virtual",
    riasec: { R: 0.3, I: 0.4, A: 0.2, S: 0.5, E: 0.9, C: 0.7 },
    aptitude: [0.7, 0.8, 0.2, 0.6],
    values: [0.7, 0.7, 0.6, 0.5],
  },

  // ── NEGOCIOS TURÍSTICOS Y HOTELEROS (Virtual) ──
  {
    id: "negocios-turisticos-virtual",
    name: "Negocios Turísticos y Hoteleros Virtual",
    riasec: { R: 0.2, I: 0.2, A: 0.4, S: 0.9, E: 0.7, C: 0.3 },
    aptitude: [0.3, 0.4, 0.3, 0.8],
    values: [0.5, 0.4, 0.7, 0.9],
  },

  // ── INGENIERÍA INDUSTRIAL (Virtual) ──
  {
    id: "ing-industrial-virtual",
    name: "Ingeniería Industrial Virtual",
    riasec: { R: 0.8, I: 0.7, A: 0.2, S: 0.3, E: 0.4, C: 0.8 },
    aptitude: [0.8, 0.8, 0.4, 0.2],
    values: [0.7, 0.5, 0.6, 0.2],
  },

  // ── MARKETING (Virtual) ──
  {
    id: "marketing-virtual",
    name: "Marketing Virtual",
    riasec: { R: 0.3, I: 0.3, A: 0.9, S: 0.6, E: 0.7, C: 0.3 },
    aptitude: [0.3, 0.4, 0.9, 0.6],
    values: [0.7, 0.6, 0.8, 0.6],
  },
];

// ── Accessors ──

/** Get a program profile by its ID. Returns undefined if not found. */
export function getProgramProfile(id: string): ProgramProfile | undefined {
  return PROGRAM_PROFILES.find((p) => p.id === id);
}

/** Get all program profiles. */
export function getAllProgramProfiles(): ProgramProfile[] {
  return PROGRAM_PROFILES;
}
