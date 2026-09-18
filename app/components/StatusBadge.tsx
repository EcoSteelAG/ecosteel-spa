// app/components/StatusBadge.tsx
//
// Zeigt den Asset-Status als farbige Pille mit Emoji an (Ampel-Farblogik,
// siehe Kapitel 4.3 "Berücksichtigte Quellen": WCAG-Farbkontrast + schnelle
// visuelle Erfassbarkeit). Das Emoji verstärkt die Lesbarkeit zusätzlich zur
// Farbe (wichtig auch für Personen mit Farbfehlsichtigkeit).

import type { AssetStatus } from "~/lib/api";

const STYLES: Record<
  AssetStatus,
  { bg: string; text: string; label: string; emoji: string }
> = {
  aktiv: { bg: "bg-green-50", text: "text-green-700", label: "aktiv", emoji: "✅" },
  wartung: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "wartung",
    emoji: "🛠️",
  },
  ausser_betrieb: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "ausser Betrieb",
    emoji: "⛔",
  },
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  const style = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style.bg} ${style.text} ring-current/10`}
    >
      <span>{style.emoji}</span>
      {style.label}
    </span>
  );
}
