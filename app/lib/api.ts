// app/lib/api.ts
//
// Zentraler API-Client für die EcoSteel Asset-Management-API (siehe Kapitel 4.2).
// Bündelt alle HTTP-Aufrufe an das Backend an einer Stelle, damit Basis-URL,
// Authentifizierung (x-api-key-Header) und Fehlerbehandlung nicht in jeder
// Komponente einzeln implementiert werden müssen.

import { getApiKey } from "./auth";

// Basis-URL des Backends: lokal Standard http://localhost:3000, für das
// produktive Deployment (Render) via Umgebungsvariable überschreibbar.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type AssetStatus = "aktiv" | "wartung" | "ausser_betrieb";

// Vordefinierte Kategorien (siehe Backend-Validierung assetSchema.js).
export const ASSET_CATEGORIES = [
  "Druckluft & Kompressoren",
  "Fördertechnik",
  "Energieerzeugung",
  "Werkzeugmaschinen",
  "Fahrzeuge & Stapler",
  "Gebäudetechnik (HLK)",
  "IT & Netzwerk",
  "Sonstiges",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

// Basis-Felder (immer vorhanden) plus die erweiterten Stammdaten aus
// Kapitel 4.3 (Register "Stammdaten" / "Kauf & Wartung"). Alle Felder
// ausser den vom Server verwalteten (_id, inventarnummer, erstelltAm,
// zuletztGeaendert) sind Pflichtfelder — ein Asset kann erst gespeichert
// werden, wenn sämtliche Angaben vorhanden sind.
export interface Asset {
  _id: string;
  inventarnummer: string; // wird serverseitig automatisch vergeben
  name: string;
  standort: string;
  status: AssetStatus;
  erstelltAm: string;
  zuletztGeaendert?: string;

  // Register "Stammdaten"
  hersteller: string;
  kategorie: AssetCategory;
  seriennummer: string;
  lieferant: string;

  // Register "Kauf & Wartung"
  kaufdatum: string;
  betriebsstunden: number;
  kaufpreis: number;
  naechsteWartung: string;
  notiz: string;
}

// Eingabefelder für POST/PATCH — identisch zu Asset, aber ohne die vom
// Server verwalteten Felder.
export type AssetInput = Omit<
  Asset,
  "_id" | "inventarnummer" | "erstelltAm" | "zuletztGeaendert"
>;

export interface ApiFieldErrors {
  [field: string]: string[];
}

// Eigene Fehlerklasse, damit die UI zwischen "Netzwerkfehler" und
// "Validierungsfehler vom Server" (Status 400/401/404) unterscheiden kann.
export class ApiError extends Error {
  status: number;
  fieldErrors?: ApiFieldErrors;

  constructor(message: string, status: number, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Führt einen Fetch-Aufruf gegen die API aus und hängt automatisch den
// x-api-key-Header (siehe Kapitel 4.2, Middleware requireApiKey) an.
async function apiFetch(path: string, options: RequestInit = {}) {
  const apiKey = getApiKey();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
      ...options.headers,
    },
  });

  // 204 No Content (z. B. nach DELETE) hat keinen JSON-Body.
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && (data.error as string)) ?? `Fehler ${response.status}`;
    throw new ApiError(message, response.status, data?.details?.fieldErrors);
  }

  return data;
}

// GET /api/assets — liefert die Liste aller Assets.
export function fetchAssets(): Promise<Asset[]> {
  return apiFetch("/api/assets");
}

// GET /api/assets/:id — liefert ein einzelnes Asset.
export function fetchAsset(id: string): Promise<Asset> {
  return apiFetch(`/api/assets/${id}`);
}

// POST /api/assets — legt ein neues Asset an. Alle Felder sind Pflicht
// (siehe Backend-Validierung); die Inventarnummer wird automatisch vergeben.
export function createAsset(input: AssetInput): Promise<Asset> {
  return apiFetch("/api/assets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PATCH /api/assets/:id — aktualisiert ein bestehendes Asset (Teilupdate).
export function updateAsset(
  id: string,
  input: Partial<AssetInput>,
): Promise<Asset> {
  return apiFetch(`/api/assets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// DELETE /api/assets/:id — löscht ein Asset unwiderruflich.
export function deleteAsset(id: string): Promise<null> {
  return apiFetch(`/api/assets/${id}`, { method: "DELETE" });
}
