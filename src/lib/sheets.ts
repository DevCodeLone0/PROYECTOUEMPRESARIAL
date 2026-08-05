import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const spreadsheetId = process.env.GOOGLE_SHEETS_ID || "";
const SHEET_NAME = "Leads";

/**
 * Get authenticated Google Sheets client
 */
async function getAuth() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
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
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return true;
  } catch (error) {
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
      range: `${SHEET_NAME}!A2:Q`,
    });

    const rows = response.data.values || [];

    return rows.map((row) => ({
      timestamp: row[0] || "",
      nombre: row[1] || "",
      email: row[2] || "",
      celular: row[3] || "",
      consentimiento: row[4] === "TRUE" || row[4] === true,
      puntaje_intereses: Number(row[5]) || 0,
      puntaje_personalidad: Number(row[6]) || 0,
      puntaje_habilidades: Number(row[7]) || 0,
      puntaje_motivacion: Number(row[8]) || 0,
      arquetipo: row[9] || "",
      carrera_1: row[10] || "",
      compatibilidad_1: Number(row[11]) || 0,
      carrera_2: row[12] || "",
      compatibilidad_2: Number(row[13]) || 0,
      carrera_3: row[14] || "",
      compatibilidad_3: Number(row[15]) || 0,
      respuestas_raw: row[16] || "{}",
    }));
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

  // Daily counts for last 30 days
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyMap[key] = 0;
  }

  leads.forEach((l) => {
    const dateKey = l.timestamp.split("T")[0];
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
