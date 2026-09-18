// app/components/Tabs.tsx
//
// Einfache, selbstgebaute Tab-Navigation (keine externe UI-Bibliothek nötig).
// Wird auf den Asset-Formularen für die Register "Stammdaten" und
// "Kauf & Wartung" verwendet.
//
// Unterstützt sowohl unkontrollierten Gebrauch (Tabs verwaltet den aktiven
// Tab selbst) als auch kontrollierten Gebrauch über activeId/onChange —
// Letzteres wird gebraucht, damit das Formular bei einem fehlenden
// Pflichtfeld automatisch auf das betroffene Register wechseln kann (siehe
// routes/assets.new.tsx und routes/assets.$id.tsx).

import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeId?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id);
  const active = activeId ?? internalActive;

  function handleSelect(id: string) {
    if (onChange) onChange(id);
    else setInternalActive(id);
  }

  return (
    <div>
      <div className="mb-5 flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSelect(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              active === tab.id
                ? "border-eco-green text-eco-green-dark"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}
