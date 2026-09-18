// app/components/Logo.tsx
//
// EcoSteel-Logo (echtes Firmenbild aus public/logo.png) statt Text-Nachbau.
// Wird auf jedem Screen verwendet (siehe Wireframes Kapitel 4.3).
// "sm" = kompakt für die Navbar, "lg" = gross für die Login-Seite (Blickfang).
//
// Standardmässig ist das Logo mit der Asset-Übersicht verlinkt (üblicher
// UX-Standard: Klick aufs Logo führt immer zur Startseite der App). Auf der
// Login-Seite selbst ist kein Link nötig, da dort noch keine Übersicht
// existiert (linkTo="" deaktiviert den Link).

import { Link } from "react-router";

export function Logo({
  size = "md",
  linkTo = "/assets",
}: {
  size?: "sm" | "md" | "lg";
  linkTo?: string | null;
}) {
  const heightClass = size === "sm" ? "h-24" : size === "lg" ? "h-40" : "h-20";
  const img = (
    <img
      src="/logo.png"
      alt="EcoSteel"
      className={`${heightClass} w-auto object-contain`}
    />
  );

  if (!linkTo) return img;

  return (
    <Link to={linkTo} className="inline-block" title="Zur Asset-Übersicht">
      {img}
    </Link>
  );
}
