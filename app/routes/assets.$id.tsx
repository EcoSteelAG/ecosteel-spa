// app/routes/assets.$id.tsx
//
// Kombiniert mehrere Wireframe-Screens aus Kapitel 4.3:
//   - "04 - Asset bearbeiten": Anzeige + Bearbeitung eines Assets
//     (GET /api/assets/:id, PATCH /api/assets/:id)
//   - "05 - Asset löschen (Bestätigung)": Bestätigungsdialog vor dem
//     endgültigen Löschen (DELETE /api/assets/:id), gesteuert über den
//     Query-Parameter ?delete=1, damit der Dialog per Link verlinkbar ist.
//
// Alle Felder in beiden Registern ("Stammdaten", "Kauf & Wartung") sind
// Pflichtfelder (siehe Backend-Validierung in assetSchema.js sowie die
// clientseitige Vollständigkeitsprüfung in lib/validateAssetForm.ts, die
// register-übergreifend prüft). Die Inventarnummer wird automatisch vom
// Server vergeben und ist daher nicht editierbar.

import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import {
  ApiError,
  deleteAsset,
  fetchAsset,
  updateAsset,
  ASSET_CATEGORIES,
  type Asset,
  type AssetInput,
  type AssetStatus,
} from "~/lib/api";
import { validateAssetForm } from "~/lib/validateAssetForm";
import { formatDateTime } from "~/lib/format";
import { StatusBadge } from "~/components/StatusBadge";
import { Tabs } from "~/components/Tabs";

export default function EditAsset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showDeleteDialog = searchParams.get("delete") === "1";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<AssetInput | null>(null);
  const [activeTab, setActiveTab] = useState<"stammdaten" | "kauf-wartung">(
    "stammdaten",
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [savedHint, setSavedHint] = useState(false);

  // Lädt das Asset anhand der ID aus der URL und befüllt das Formular.
  useEffect(() => {
    if (!id) return;
    fetchAsset(id)
      .then((data) => {
        setAsset(data);
        setForm({
          name: data.name,
          standort: data.standort,
          status: data.status,
          hersteller: data.hersteller,
          kategorie: data.kategorie,
          seriennummer: data.seriennummer,
          lieferant: data.lieferant,
          kaufdatum: data.kaufdatum,
          betriebsstunden: data.betriebsstunden,
          kaufpreis: data.kaufpreis,
          naechsteWartung: data.naechsteWartung,
          notiz: data.notiz,
        });
      })
      .catch((err) => setLoadError(err.message ?? "Asset nicht gefunden."))
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof AssetInput>(key: K, value: AssetInput[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!id || !form) return;
    setSaveError(null);
    setSavedHint(false);

    // Vollständigkeitsprüfung über BEIDE Register hinweg (siehe
    // validateAssetForm.ts), analog zu "Neues Asset anlegen".
    const validation = validateAssetForm(form);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      if (validation.firstInvalidTab) setActiveTab(validation.firstInvalidTab);
      setSaveError("Bitte fülle alle Pflichtfelder in beiden Registern aus.");
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const updated = await updateAsset(id, form);
      setAsset(updated);
      setSavedHint(true);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else if (err instanceof ApiError) {
        setSaveError(err.message);
      } else {
        setSaveError("Unerwarteter Fehler beim Speichern.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteAsset(id);
      navigate("/assets");
    } catch (err) {
      setDeleting(false);
      setSaveError(
        err instanceof ApiError ? err.message : "Löschen fehlgeschlagen.",
      );
      closeDeleteDialog();
    }
  }

  function openDeleteDialog() {
    setSearchParams({ delete: "1" });
  }

  function closeDeleteDialog() {
    searchParams.delete("delete");
    setSearchParams(searchParams);
  }

  if (loading) return <p className="text-sm text-gray-500">⏳ Lade Asset...</p>;
  if (loadError || !asset || !form)
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
        ⚠️ {loadError ?? "Asset nicht gefunden."}
      </p>
    );

  const inputClass =
    "mb-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 focus:outline-none";
  const labelClass = "mb-1 block text-xs font-semibold text-gray-700";

  return (
    <div>
      <p className="mb-1 text-sm text-gray-400">
        <Link to="/assets" className="hover:underline">
          Asset-Übersicht
        </Link>{" "}
        <span className="text-eco-green-dark">{asset.name}</span>
      </p>
      <div className="mb-1 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
        <StatusBadge status={asset.status} />
      </div>
      <p className="mb-6 text-sm text-gray-500">
        🏷️ {asset.inventarnummer} &middot; 📅 Erstellt am{" "}
        {new Date(asset.erstelltAm).toLocaleDateString("de-CH")}
      </p>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div>
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <Tabs
              activeId={activeTab}
              onChange={(tid) =>
                setActiveTab(tid as "stammdaten" | "kauf-wartung")
              }
              tabs={[
                {
                  id: "stammdaten",
                  label: "📇 Stammdaten",
                  content: (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>NAME *</label>
                        <input
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
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
                          value={form.status}
                          onChange={(e) =>
                            update("status", e.target.value as AssetStatus)
                          }
                          className={`${inputClass} border-2 border-eco-green`}
                        >
                          <option value="aktiv">✅ aktiv</option>
                          <option value="wartung">🛠️ wartung</option>
                          <option value="ausser_betrieb">⛔ ausser_betrieb</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          INVENTARNUMMER (automatisch)
                        </label>
                        <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                          🏷️ {asset.inventarnummer}
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>HERSTELLER *</label>
                        <input
                          value={form.hersteller}
                          onChange={(e) =>
                            update("hersteller", e.target.value)
                          }
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
                          value={form.seriennummer}
                          onChange={(e) =>
                            update("seriennummer", e.target.value)
                          }
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
                          value={form.standort}
                          onChange={(e) => update("standort", e.target.value)}
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
                          type="date"
                          value={form.naechsteWartung}
                          onChange={(e) =>
                            update("naechsteWartung", e.target.value)
                          }
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
                          type="number"
                          min="0"
                          value={form.betriebsstunden}
                          onChange={(e) =>
                            update("betriebsstunden", Number(e.target.value))
                          }
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
                            type="number"
                            min="0"
                            step="0.05"
                            value={form.kaufpreis}
                            onChange={(e) =>
                              update("kaufpreis", Number(e.target.value))
                            }
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
                          value={form.notiz}
                          onChange={(e) => update("notiz", e.target.value)}
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />
                        {fieldErrors.notiz && (
                          <p className="mb-2 text-xs text-red-600">
                            ⚠️ {fieldErrors.notiz.join(", ")}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>ERSTELLT AM</label>
                        <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                          {formatDateTime(asset.erstelltAm)}
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>ZULETZT GEÄNDERT</label>
                        <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                          {formatDateTime(asset.zuletztGeaendert)}
                        </p>
                      </div>
                    </div>
                  ),
                },
              ]}
            />

            {saveError && (
              <p className="mb-4 mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                ⚠️ {saveError}
              </p>
            )}
            {savedHint && !saveError && (
              <p className="mb-4 mt-4 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                ✅ Änderungen gespeichert.
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
                {saving ? "Speichern..." : "💾 Änderungen speichern"}
              </button>
            </div>
          </form>

          {/* Gefahrenzone: optisch getrennt von den normalen Bearbeitungsfeldern,
              um versehentliches Löschen zu vermeiden (siehe Kapitel 4.3). */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/70 p-5">
            <div>
              <h3 className="text-sm font-bold text-red-700">⚠️ Gefahrenzone</h3>
              <p className="text-xs text-red-500">
                Dieses Asset kann unwiderruflich gelöscht werden.
              </p>
            </div>
            <button
              onClick={openDeleteDialog}
              className="rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              🗑️ Asset löschen
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-5 ring-1 ring-inset ring-gray-100">
          <h2 className="mb-2 text-sm font-bold text-gray-800">🕒 Verlauf</h2>
          <p className="text-xs text-gray-600">
            {formatDateTime(asset.erstelltAm)} &middot; Erstellt
          </p>
          {asset.zuletztGeaendert && (
            <p className="mt-1 text-xs text-gray-600">
              {formatDateTime(asset.zuletztGeaendert)} &middot; Geändert
            </p>
          )}
        </div>
      </div>

      {/* Löschen-Bestätigung: Bottom-Sheet/Modal je nach Bildschirmgrösse (siehe
          Wireframe "05 - Asset löschen"). Wird über ?delete=1 gesteuert. */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
                ⚠️
              </span>
            </div>
            <h2 className="mb-2 text-center text-lg font-bold text-gray-900">
              Asset wirklich löschen?
            </h2>
            <p className="mb-1 text-center text-sm text-gray-500">
              „{asset.name}" wird unwiderruflich aus dem Asset-Bestand entfernt.
            </p>
            <p className="mb-6 text-center text-xs text-gray-400">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={closeDeleteDialog}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-md shadow-red-200 transition hover:brightness-105 disabled:opacity-60"
              >
                {deleting ? "Löschen..." : "🗑️ Endgültig löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
