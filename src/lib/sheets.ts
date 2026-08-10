import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const spreadsheetId = process.env.GOOGLE_SHEETS_ID || "";
const SHEET_NAME = "Leads";

/**
 * Get authenticated Google Sheets client.
 * Fails loudly when the service account key is missing or invalid instead of
 * silently proceeding with an empty credential object.
 */
async function getAuth() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY no configurado");
  }

  let credentials: unknown;
  try {
    credentials = JSON.parse(rawKey);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY no configurado (JSON inválido)"
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: credentials as object,
    scopes: SCOPES,
  });

  return auth;
}

/**
 * Get the sheets API client
 */
async function getSheets() {
  const auth = await getAuth();
  return google.sheets({ version: "v4", auth });
}

export interface LeadRow {
  timestamp: string;
  nombre: string;
  email: string;
  celular: string;
  consentimiento: boolean;
  puntaje_intereses: number;
  puntaje_personalidad: number;
  puntaje_habilidades: number;
  puntaje_motivacion: number;
  arquetipo: string;
  carrera_1: string;
  compatibilidad_1: number;
  carrera_2: string;
  compatibilidad_2: number;
  carrera_3: string;
  compatibilidad_3: number;
  respuestas_raw: string;
  riasec_r: number;
  riasec_i: number;
  riasec_a: number;
  riasec_s: number;
  riasec_e: number;
  riasec_c: number;
}

/**
 * Append a lead row to the Google Sheet
 */
export async function appendLead(lead: LeadRow): Promise<boolean> {
  try {
    const sheets = await getSheets();

    const values = [
      [
        lead.timestamp,
        lead.nombre,
        lead.email,
        lead.celular,
        lead.consentimiento,
        lead.puntaje_intereses,
        lead.puntaje_personalidad,
        lead.puntaje_habilidades,
        lead.puntaje_motivacion,
        lead.arquetipo,
        lead.carrera_1,
        lead.compatibilidad_1,
        lead.carrera_2,
        lead.compatibilidad_2,
        lead.carrera_3,
        lead.compatibilidad_3,
        lead.respuestas_raw,
        lead.riasec_r,
        lead.riasec_i,
        lead.riasec_a,
        lead.riasec_s,
        lead.riasec_e,
        lead.riasec_c,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:W`,
      // RAW stores values as literal text: user-supplied strings that look
      // like formulas ("=HYPERLINK(...)", "+1+1") are never evaluated.
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("GOOGLE_SERVICE_ACCOUNT_KEY")
    ) {
      throw error;
    }
    console.error("Error appending lead to Google Sheets:", error);
    return false;
  }
}

/**
 * Get all leads from the Google Sheet
 */
export async function getLeads(): Promise<LeadRow[]> {
  try {
    const sheets = await getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:W`,
    });

    const rows = response.data.values || [];

    return rows.map((row) => {
      const rawConsent = row[4];
      return {
        timestamp: String(row[0] ?? ""),
        nombre: String(row[1] ?? ""),
        email: String(row[2] ?? ""),
        celular: String(row[3] ?? ""),
        // Handle boolean TRUE/FALSE cells as well as numeric 1/0 cells
        consentimiento:
          rawConsent === "TRUE" ||
          rawConsent === "1" ||
          rawConsent === true ||
          rawConsent === 1,
        puntaje_intereses: Number(row[5]) || 0,
        puntaje_personalidad: Number(row[6]) || 0,
        puntaje_habilidades: Number(row[7]) || 0,
        puntaje_motivacion: Number(row[8]) || 0,
        arquetipo: String(row[9] ?? ""),
        carrera_1: String(row[10] ?? ""),
        compatibilidad_1: Number(row[11]) || 0,
        carrera_2: String(row[12] ?? ""),
        compatibilidad_2: Number(row[13]) || 0,
        carrera_3: String(row[14] ?? ""),
        compatibilidad_3: Number(row[15]) || 0,
        respuestas_raw: String(row[16] ?? "{}"),
        riasec_r: Number(row[17]) || 0,
        riasec_i: Number(row[18]) || 0,
        riasec_a: Number(row[19]) || 0,
        riasec_s: Number(row[20]) || 0,
        riasec_e: Number(row[21]) || 0,
        riasec_c: Number(row[22]) || 0,
      };
    });
  } catch (error) {
    console.error("Error getting leads from Google Sheets:", error);
    return [];
  }
}

export interface AdminMetrics {
  total: number;
  thisWeek: number;
  thisMonth: number;
  daily: { date: string; count: number }[];
}

/**
 * Calculate metrics from leads data
 */
export async function getMetrics(): Promise<AdminMetrics> {
  const leads = await getLeads();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeek = leads.filter(
    (l) => new Date(l.timestamp) >= oneWeekAgo
  ).length;

  const thisMonth = leads.filter(
    (l) => new Date(l.timestamp) >= oneMonthAgo
  ).length;

  // Daily counts for last 30 days, keyed by Colombian date (UTC-5) so leads
  // submitted near midnight land on the correct local day.
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
    dailyMap[key] = 0;
  }

  leads.forEach((l) => {
    const ts = new Date(l.timestamp);
    if (Number.isNaN(ts.getTime())) return;
    const dateKey = ts.toLocaleDateString("en-CA", {
      timeZone: "America/Bogota",
    });
    if (dailyMap[dateKey] !== undefined) {
      dailyMap[dateKey]++;
    }
  });

  const daily = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    total: leads.length,
    thisWeek,
    thisMonth,
    daily,
  };
}
