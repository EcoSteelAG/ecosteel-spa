// app/lib/validateAssetForm.ts
//
// Clientseitige Vollständigkeitsprüfung für die Asset-Formulare (Neues
// Asset anlegen / Asset bearbeiten). Da beide Formulare Register (Tabs)
// verwenden, reicht die native HTML-"required"-Validierung nicht aus: der
// Browser prüft nur Felder, die im gerade sichtbaren Register angezeigt
// werden. Diese Funktion prüft daher manuell ALLE Felder aus BEIDEN
// Registern, unabhängig davon, welches Register aktuell offen ist, und
// gibt zurück, welches Register bei einem fehlenden Feld angezeigt werden
// muss.

import type { AssetInput } from "./api";

export interface ValidationResult {
  valid: boolean;
  fieldErrors: Record<string, string[]>;
  firstInvalidTab: "stammdaten" | "kauf-wartung" | null;
}

const REQUIRED_TEXT_FIELDS: Array<{
  key: keyof AssetInput;
  tab: "stammdaten" | "kauf-wartung";
}> = [
  { key: "name", tab: "stammdaten" },
  { key: "standort", tab: "stammdaten" },
  { key: "hersteller", tab: "stammdaten" },
  { key: "seriennummer", tab: "stammdaten" },
  { key: "lieferant", tab: "stammdaten" },
  { key: "kaufdatum", tab: "kauf-wartung" },
  { key: "naechsteWartung", tab: "kauf-wartung" },
  { key: "notiz", tab: "kauf-wartung" },
];

export function validateAssetForm(form: AssetInput): ValidationResult {
  const fieldErrors: Record<string, string[]> = {};
  let firstInvalidTab: "stammdaten" | "kauf-wartung" | null = null;

  for (const { key, tab } of REQUIRED_TEXT_FIELDS) {
    const value = form[key];
    if (typeof value !== "string" || value.trim() === "") {
      fieldErrors[key] = ["Dieses Feld ist ein Pflichtfeld."];
      if (!firstInvalidTab) firstInvalidTab = tab;
    }
  }

  if (
    form.betriebsstunden === undefined ||
    form.betriebsstunden === null ||
    Number.isNaN(form.betriebsstunden) ||
    form.betriebsstunden < 0
  ) {
    fieldErrors.betriebsstunden = ["Bitte eine gültige Zahl (≥ 0) angeben."];
    if (!firstInvalidTab) firstInvalidTab = "kauf-wartung";
  }

  if (
    form.kaufpreis === undefined ||
    form.kaufpreis === null ||
    Number.isNaN(form.kaufpreis) ||
    form.kaufpreis < 0
  ) {
    fieldErrors.kaufpreis = ["Bitte einen gültigen Preis (≥ 0) angeben."];
    if (!firstInvalidTab) firstInvalidTab = "kauf-wartung";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    firstInvalidTab,
  };
}
