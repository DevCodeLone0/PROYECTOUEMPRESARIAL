import { z } from "zod";

/**
 * Colombian phone regex: 10 digits starting with 3 (mobile),
 * or 7-10 digits (landline), or international with +country code
 */
const colombianPhoneRegex = /^(\+?57)?[3][0-9]{9}$|^[1-9][0-9]{6,9}$/;

export const LeadFormSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { error: "El nombre no puede tener más de 100 caracteres" }),
  email: z.email({ error: "Ingresa un correo electrónico válido" }),
  celular: z
    .string()
    .regex(colombianPhoneRegex, { error: "Ingresa un número de teléfono válido" }),
  consentimiento: z.literal(true, {
    error: "Debes aceptar el tratamiento de datos personales para continuar",
  }),
});

export type LeadFormData = z.infer<typeof LeadFormSchema>;

export const AnswerSchema = z
  .record(
    z.string().max(10, { error: "Los IDs de respuesta no pueden superar 10 caracteres" }),
    z.union([
      z.string().max(10, { error: "Las respuestas de texto no pueden superar 10 caracteres" }),
      z.number().min(0, { error: "Las respuestas numéricas no pueden ser negativas" }).max(10, { error: "Las respuestas numéricas no pueden superar 10" }),
    ])
  )
  .refine(
    (answers) => Object.keys(answers).length <= 25,
    { message: "El máximo de respuestas es 25" }
  );

export type AnswerRecord = z.infer<typeof AnswerSchema>;

export const ScoringResultSchema = z.object({
  programId: z.string(),
  compatibility: z.number().min(0).max(100),
  dimensionScores: z.object({
    intereses: z.number(),
    personalidad: z.number(),
    habilidades: z.number(),
    motivacion: z.number(),
  }),
});

export type ScoringResultData = z.infer<typeof ScoringResultSchema>;

export const RiasecProfileSchema = z.object({
  R: z.number().min(0).max(100),
  I: z.number().min(0).max(100),
  A: z.number().min(0).max(100),
  S: z.number().min(0).max(100),
  E: z.number().min(0).max(100),
  C: z.number().min(0).max(100),
});

export const LeadPayloadSchema = z.object({
  nombre: LeadFormSchema.shape.nombre,
  email: LeadFormSchema.shape.email.max(200, {
    error: "El correo no puede superar 200 caracteres",
  }),
  celular: LeadFormSchema.shape.celular.max(30, {
    error: "El teléfono no puede superar 30 caracteres",
  }),
  consentimiento: LeadFormSchema.shape.consentimiento,
  respuestas: AnswerSchema,
  scores: z.object({
    intereses: z.number().min(0).max(100),
    personalidad: z.number().min(0).max(100),
    habilidades: z.number().min(0).max(100),
    motivacion: z.number().min(0).max(100),
  }),
  riasecProfile: RiasecProfileSchema,
  arquetipo: z.string().min(1).max(80, {
    error: "El arquetipo no puede superar 80 caracteres",
  }),
  // Fase 2: resultados del scoring persistidos con el lead
  modality: z.enum(["presencial", "virtual"]),
  confidence: z.enum(["high", "medium", "low"]),
  // 4 slots [logical, planning, creative, social]
  aptitudeVec: z.array(z.number()).optional(),
  // 4 slots de valores/estilo de vida
  valuesVec: z.array(z.number()).optional(),
  ranking: z
    .array(z.object({ programId: z.string(), compatibility: z.number() }))
    .optional(),
  top3: z
    .array(
      z.object({
        carrera: z.string().max(40, {
          error: "El nombre de la carrera no puede superar 40 caracteres",
        }),
        compatibilidad: z.number().min(0).max(100),
      })
    )
    .max(3, { error: "El top 3 no puede tener más de 3 carreras" }),
  // Idempotencia del cliente: mismo requestId no duplica
  requestId: z.string().max(100, { error: "El requestId no puede superar 100 caracteres" }).optional(),
  // Marca interna: los leads de prueba no se envían desde el form (el admin decide)
  esPrueba: z.boolean().optional(),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;

export const LEAD_STATUSES = ["nuevo", "contactado", "en_proceso", "admitido", "descartado"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** ID numérico real de Postgres; acepta también string numérica (compat con clientes viejos). */
const LeadIdSchema = z.union([
  z.int().positive(),
  z.string().regex(/^\d+$/).transform(Number),
]);

export const LeadUpdateSchema = z
  .object({
    id: LeadIdSchema,
    estado: z.enum(LEAD_STATUSES).optional(),
    notas: z.string().max(2000, { error: "Las notas no pueden superar 2000 caracteres" }).optional(),
  })
  .refine((d) => d.estado !== undefined || d.notas !== undefined, {
    message: "Debes enviar estado o notas",
  });
