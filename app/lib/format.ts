// app/lib/format.ts
//
// Kleine Formatierungs-Helfer für die Stammdaten-Register (Kapitel 4.3).

// Schlägt eine Inventarnummer im Format ECST-(Jahr)-(Nummer) vor,
// z. B. ECST-2026-001 (siehe Backend-Validierung in assetSchema.js).
export function suggestInventarnummer(): string {
  const year = new Date().getFullYear();
  return `ECST-${year}-001`;
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-CH");
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-CH");
}
