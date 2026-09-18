// app/routes/assets._index.tsx
//
// Asset-Übersicht gemäss Wireframe "02 - Asset-Übersicht" (Kapitel 4.3).
// Ruft GET /api/assets ab und bietet clientseitige Suche und Statusfilter.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { fetchAssets, type Asset, type AssetStatus } from "~/lib/api";
import { StatusBadge } from "~/components/StatusBadge";

const STATUS_OPTIONS: Array<{ value: AssetStatus | "alle"; label: string }> = [
  { value: "alle", label: "Alle" },
  { value: "aktiv", label: "Aktiv" },
  { value: "wartung", label: "Wartung" },
  { value: "ausser_betrieb", label: "Ausser Betrieb" },
];

export default function AssetsIndex() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "alle">("alle");

  // Lädt die Asset-Liste beim ersten Rendern der Seite.
  useEffect(() => {
    let cancelled = false;
    fetchAssets()
      .then((data) => {
        if (!cancelled) setAssets(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Assets konnten nicht geladen werden.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Clientseitige Filterung nach Suchtext (Name/Standort) und Status.
  const filtered = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        search.trim() === "" ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.standort.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "alle" || asset.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Asset-Übersicht</h1>
          <p className="text-sm text-gray-500">Alle erfassten Assets im Überblick</p>
        </div>
        <Link
          to="/assets/new"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-eco-green to-eco-green-dark px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-green-200 transition hover:brightness-105"
        >
          ➕ Neues Asset
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Asset suchen (Name, Standort)..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm transition focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AssetStatus | "alle")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-auto"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Status: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500">⏳ Lade Assets...</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          ⚠️ {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-10 text-center text-gray-400 shadow-sm">
          📭 Keine Assets gefunden.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          {/* Mobile: Karten-Liste (siehe Wireframe "M02 - Asset-Übersicht") — die
              ganze Karte ist antippbar und führt direkt zur Bearbeiten-Ansicht. */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map((asset) => (
              <div
                key={asset._id}
                onClick={() => navigate(`/assets/${asset._id}`)}
                className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition active:bg-gray-50"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                  <span className="text-gray-300">›</span>
                </div>
                <p className="mb-2 text-xs text-gray-400">
                  🏷️ {asset.inventarnummer}
                </p>
                <p className="mb-2 text-sm text-gray-600">📍 {asset.standort}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={asset.status} />
                  <Link
                    to={`/assets/${asset._id}?delete=1`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-red-600 hover:underline"
                  >
                    🗑️ Löschen
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet: Tabelle */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Inventar-Nr.</th>
                  <th className="px-4 py-3">Standort</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Erstellt am</th>
                  <th className="px-4 py-3">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((asset) => (
                  <tr
                    key={asset._id}
                    onClick={() => navigate(`/assets/${asset._id}`)}
                    className="cursor-pointer transition hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {asset.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{asset.inventarnummer}</td>
                    <td className="px-4 py-3 text-gray-600">📍 {asset.standort}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(asset.erstelltAm).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/assets/${asset._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-3 text-eco-green-dark hover:underline"
                      >
                        ✏️ Bearbeiten
                      </Link>
                      <Link
                        to={`/assets/${asset._id}?delete=1`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-600 hover:underline"
                      >
                        🗑️ Löschen
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
