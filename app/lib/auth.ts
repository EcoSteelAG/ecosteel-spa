// app/lib/auth.ts
//
// Einfache Authentifizierungs-Hilfe für den Prototyp.
// Die echte Absicherung passiert serverseitig über den x-api-key-Header
// (siehe Kapitel 4.2). Diese Datei kümmert sich nur darum, den vom
// Sachbearbeiter im Login-Formular eingegebenen API-Key sowie seinen
// Anzeigenamen im Browser (localStorage) zu speichern, damit er nach dem
// Login nicht bei jeder Aktion erneut eingegeben werden muss.

const STORAGE_KEY = "ecosteel_auth";

interface StoredAuth {
  email: string;
  apiKey: string;
}

// Liest die gespeicherten Anmeldedaten aus dem localStorage.
// Gibt null zurück, wenn noch niemand angemeldet ist (oder im SSR-Kontext,
// wo `window` nicht existiert).
function readAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return readAuth() !== null;
}

export function getApiKey(): string | null {
  return readAuth()?.apiKey ?? null;
}

export function getUserEmail(): string | null {
  return readAuth()?.email ?? null;
}

// Speichert die Anmeldedaten nach erfolgreichem Login (siehe routes/login.tsx).
export function setAuth(email: string, apiKey: string): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, apiKey }));
}

// Entfernt die Anmeldedaten wieder (Logout).
export function clearAuth(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
