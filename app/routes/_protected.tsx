// app/routes/_protected.tsx
//
// Layout-Route für alle Bereiche, die eine Anmeldung voraussetzen
// (Asset-Übersicht, Asset erstellen, Asset bearbeiten/löschen).
// clientLoader läuft im Browser, bevor die Seite gerendert wird, und leitet
// nicht angemeldete Benutzer:innen sofort auf die Login-Seite um.

import { Outlet, redirect } from "react-router";
import { isAuthenticated } from "~/lib/auth";
import { Navbar } from "~/components/Navbar";

export function clientLoader() {
  if (!isAuthenticated()) {
    throw redirect("/login");
  }
  return null;
}

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-[--color-bg]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
