// app/routes/login.tsx
//
// Login-Seite gemäss Wireframe "01 - Login" (Kapitel 4.3).
// Da die Basis-API aus Kapitel 4.2 keine Benutzerkonten kennt, sondern nur
// einen einzelnen API-Key voraussetzt, dient das Passwortfeld hier als
// Eingabe für diesen Key. Die E-Mail dient nur als Anzeigename in der App.
// Der Key wird durch einen Testaufruf an GET /api/assets verifiziert, bevor
// er lokal gespeichert wird (siehe app/lib/auth.ts).

import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { Logo } from "~/components/Logo";
import { isAuthenticated, setAuth } from "~/lib/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// Wer schon angemeldet ist, muss den Login nicht nochmal sehen.
export function clientLoader() {
  if (isAuthenticated()) {
    throw redirect("/assets");
  }
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Testaufruf: Nur ein gültiger x-api-key-Header liefert Status 200.
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        headers: { "x-api-key": password },
      });

      if (!response.ok) {
        throw new Error("Ungültige Anmeldedaten (Beispieltext)");
      }

      setAuth(email, password);
      navigate("/assets");
    } catch {
      setError("Ungültige Anmeldedaten (Beispieltext)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[--color-bg] via-white to-green-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-3 flex justify-center">
          <Logo size="lg" linkTo={null} />
        </div>
        <p className="mb-8 text-center text-sm text-gray-500">
          🏭 Asset-Management — Anmeldung für Sachbearbeiter
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50"
        >
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            E-MAIL
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="max.muster@ecosteel.ch"
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm transition focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 focus:outline-none"
          />

          <label className="mb-1 block text-xs font-semibold text-gray-700">
            PASSWORT (API-KEY)
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="mb-6 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm transition focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-eco-green to-eco-green-dark py-3 text-sm font-bold text-white shadow-md shadow-green-200 transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? (
              "Anmelden..."
            ) : (
              <>
                🔐 Anmelden
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              ⚠️ {error}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">
            Passwort vergessen? Bitte IT-Support kontaktieren.
          </p>
        </form>
      </div>
    </div>
  );
}
