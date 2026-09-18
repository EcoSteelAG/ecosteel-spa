// app/routes/index.tsx
//
// Startpunkt der App ("/"). Prüft, ob bereits ein API-Key gespeichert ist,
// und leitet entsprechend zur Asset-Übersicht oder zum Login weiter.

import { redirect } from "react-router";
import { isAuthenticated } from "~/lib/auth";

export function clientLoader() {
  throw redirect(isAuthenticated() ? "/assets" : "/login");
}

// Wird nie sichtbar gerendert, da clientLoader immer weiterleitet.
export default function Index() {
  return null;
}
