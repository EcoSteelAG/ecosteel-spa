// app/routes/assets.new.tsx
//
// Formular "Neues Asset anlegen" gemäss Wireframe "03 - Asset erstellen"
// (Kapitel 4.3), erweitert um die Register "Stammdaten" und "Kauf &
// Wartung". Alle Felder sind Pflichtfelder (siehe Backend-Validierung in
// assetSchema.js) — das Formular lässt sich erst absenden, wenn sämtliche
// Angaben vorhanden sind (HTML-Validierung via `required`, zusätzlich vom
// Server nochmals geprüft). Die Inventarnummer wird automatisch vom
// Backend vergeben (fortlaufend, Format ECST-Jahr-Nummer) und ist daher
// hier kein Eingabefeld.

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  createAsset,
  ApiError,
  ASSET_CATEGORIES,
  type AssetInput,
  type AssetStatus,
} from "~/lib/api";
import { validateAssetForm } from "~/lib/validateAssetForm";
import { Tabs } from "~/components/Tabs";

const EMPTY_FORM: AssetInput = {
  name: "",
  standort: "",
  status: "aktiv",
  hersteller: "",
  kategorie: ASSET_CATEGORIES[0],
  seriennummer: "",
  lieferant: "",
  kaufdatum: "",
  betriebsstunden: 0,
  kaufpreis: 0,
  naechsteWartung: "",
  notiz: "",
};

export default function NewAsset() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AssetInput>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<"stammdaten" | "kauf-wartung">(
    "stammdaten",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof AssetInput>(key: K, value: AssetInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    // Vollständigkeitsprüfung über BEIDE Register hinweg (siehe
    // validateAssetForm.ts) — verhindert das Speichern, solange nicht
    // alle Pflichtfelder ausgefüllt sind, auch wenn das betroffene
    // Register gerade nicht sichtbar ist.
    const validation = validateAssetForm(form);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      if (validation.firstInvalidTab) setActiveTab(validation.firstInvalidTab);
      setGeneralError("Bitte fülle alle Pflichtfelder in beiden Registern aus.");
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const asset = await createAsset(form);
      navigate(`/assets/${asset._id}`);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else if (err instanceof ApiError) {
        setGeneralError(err.message);
      } else {
        setGeneralError("Unerwarteter Fehler beim Speichern.");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mb-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 focus:outline-none";
  const labelClass = "mb-1 block text-xs font-semibold text-gray-700";

  return (
    <div>
      <p className="mb-1 text-sm text-gray-400">
        <Link to="/assets" className="hover:underline">
          Asset-Übersicht
        </Link>{" "}
        <span className="text-eco-green-dark">Neues Asset</span>
      </p>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">🆕 Neues Asset anlegen</h1>
      <p className="mb-6 text-sm text-gray-500">
        Alle Felder sind Pflichtfelder. Die Inventarnummer wird automatisch vergeben.
      </p>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <Tabs
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as "stammdaten" | "kauf-wartung")}
            tabs={[
              {
                id: "stammdaten",
                label: "📇 Stammdaten",
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>NAME *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="z. B. Kompressor Halle 3"
                        className={inputClass}
                      />
                      {fieldErrors.name && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.name.join(", ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>STATUS *</label>
                      <select
                        required
                        value={form.status}
                        onChange={(e) =>
                          update("status", e.target.value as AssetStatus)
                        }
                        className={inputClass}
                      >
                        <option value="aktiv">✅ aktiv</option>
                        <option value="wartung">🛠️ wartung</option>
                        <option value="ausser_betrieb">⛔ ausser_betrieb</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>HERSTELLER *</label>
                      <input
                        required
                        value={form.hersteller}
                        onChange={(e) => update("hersteller", e.target.value)}
                        placeholder="z. B. Atlas Copco"
                        className={inputClass}
                      />
                      {fieldErrors.hersteller && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.hersteller.join(", ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>KATEGORIE *</label>
                      <select
                        required
                        value={form.kategorie}
                        onChange={(e) =>
                          update(
                            "kategorie",
                            e.target.value as AssetInput["kategorie"],
                          )
                        }
                        className={inputClass}
                      >
                        {ASSET_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>SERIENNUMMER *</label>
                      <input
                        required
                        value={form.seriennummer}
                        onChange={(e) => update("seriennummer", e.target.value)}
                        className={inputClass}
                      />
                      {fieldErrors.seriennummer && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.seriennummer.join(", ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>STANDORT *</label>
                      <input
                        required
                        value={form.standort}
                        onChange={(e) => update("standort", e.target.value)}
                        placeholder="z. B. Zürich"
                        className={inputClass}
                      />
                      {fieldErrors.standort && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.standort.join(", ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>LIEFERANT *</label>
                      <input
                        required
                        value={form.lieferant}
                        onChange={(e) => update("lieferant", e.target.value)}
                        className={inputClass}
                      />
                      {fieldErrors.lieferant && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.lieferant.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                id: "kauf-wartung",
                label: "🧾 Kauf & Wartung",
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>KAUFDATUM *</label>
                      <input
                        required
                        type="date"
                        value={form.kaufdatum}
                        onChange={(e) => update("kaufdatum", e.target.value)}
                        className={inputClass}
                      />
                      {fieldErrors.kaufdatum && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.kaufdatum.join(", ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>NÄCHSTE WARTUNG *</label>
                      <input
                        required
                        type="date"
                        value={form.naechsteWartung}
                        onChange={(e) => update("naechsteWartung", e.target.value)}
                        className={inputClass}
                      />
                      {fieldErrors.naechsteWartung && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.naechsteWartung.join(", ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>BETRIEBSSTUNDEN *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.betriebsstunden}
                        onChange={(e) =>
                          update("betriebsstunden", Number(e.target.value))
                        }
                        placeholder="z. B. 1250"
                        className={inputClass}
                      />
                      {fieldErrors.betriebsstunden && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.betriebsstunden.join(", ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>KAUFPREIS (CHF) *</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                          CHF
                        </span>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.05"
                          value={form.kaufpreis}
                          onChange={(e) =>
                            update("kaufpreis", Number(e.target.value))
                          }
                          placeholder="0.00"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                      {fieldErrors.kaufpreis && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.kaufpreis.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>NOTIZ *</label>
                      <textarea
                        required
                        value={form.notiz}
                        onChange={(e) => update("notiz", e.target.value)}
                        rows={3}
                        placeholder="Freitext, z. B. Besonderheiten..."
                        className={`${inputClass} resize-none`}
                      />
                      {fieldErrors.notiz && (
                        <p className="mb-2 text-xs text-red-600">
                          ⚠️ {fieldErrors.notiz.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              },
            ]}
          />

          {generalError && (
            <p className="mb-4 mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              ⚠️ {generalError}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              to="/assets"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-eco-green to-eco-green-dark px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-green-200 transition hover:brightness-105 disabled:opacity-60"
            >
              {saving ? "Speichern..." : "💾 Asset speichern"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl bg-green-50/60 p-5 ring-1 ring-inset ring-green-100">
          <h2 className="mb-2 text-sm font-bold text-gray-800">💡 Hinweis</h2>
          <p className="text-xs text-gray-600">
            Alle Felder in beiden Registern müssen ausgefüllt sein, bevor das Asset
            gespeichert werden kann. Die Inventarnummer sowie das Erstellungsdatum
            werden automatisch vergeben.
          </p>
        </div>
      </div>
    </div>
  );
}
