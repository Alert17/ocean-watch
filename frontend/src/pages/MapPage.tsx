/**
 * /map — World shark sightings map.
 *
 * Data: tries the GraphQL indexer first; falls back to MOCK_MAP_SIGHTINGS.
 * Filters (date + species): UI-only for now, will wire to the indexer once
 * the API supports filter params.
 *
 * Land validation: every sighting is checked against the Cozumel land
 * polygon (COZUMEL_LAND_GEOJSON) before being rendered. Sightings whose
 * coordinates fall on land are rejected and counted in a warning badge.
 */

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { BEHAVIOR_OPTIONS, SPECIES_OPTIONS } from "../constants/fieldbook";
import { COZUMEL_LAND_GEOJSON } from "../data/cozumelLandGeoJSON";
import { MOCK_MAP_SIGHTINGS } from "../data/mockMapSightings";
import type { Sighting } from "../graphql/types";
import { classifySightings } from "../lib/landValidator";

// ── Map constants ──────────────────────────────────────────────────────────

/** World view centred on Isla Cozumel */
const WORLD_CENTER: L.LatLngExpression = [20.42, -86.92];
const WORLD_ZOOM = 4;

// ── Filter types ───────────────────────────────────────────────────────────

const DATE_OPTIONS = [
  { value: "7d",  label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "3 months" },
  { value: "all", label: "All time" },
] as const;
type DateRange = typeof DATE_OPTIONS[number]["value"];

// ── Marker icon ────────────────────────────────────────────────────────────

const sightingIcon = L.divIcon({
  className: "ocean-watch-map-marker",
  html: `<div style="
    width:12px;height:12px;border-radius:9999px;
    border:2px solid #061222;
    background:#f43f5e;
    box-shadow:0 0 14px -3px rgba(244,63,94,0.65)
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
}

function speciesLabel(value: string): string {
  return SPECIES_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function behaviorLabel(value: string): string {
  return BEHAVIOR_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function cutoffDate(range: DateRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 86400 * 1000);
}

function popupEl(s: Sighting): HTMLElement {
  const root = document.createElement("div");
  root.style.cssText = "min-width:210px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;color:#1e293b";

  const rows: [string, string][] = [
    ["Species", speciesLabel(s.species)],
    ["Observed", formatDate(s.observedAt)],
    ["Count", `${s.count} ${s.count === 1 ? "individual" : "individuals"}`],
    ["Behavior", behaviorLabel(s.behavior)],
    ["Wallet", s.wallet],
    ["HCS seq #", String(s.sequenceNumber)],
    ["Timestamp", s.consensusTimestamp],
  ];

  const title = document.createElement("div");
  title.style.cssText = "font-weight:700;font-size:14px;margin-bottom:6px;color:#0f172a";
  title.textContent = speciesLabel(s.species);
  root.appendChild(title);

  const table = document.createElement("table");
  table.style.cssText = "width:100%;border-collapse:collapse";
  for (const [key, val] of rows) {
    const tr = document.createElement("tr");
    const th = document.createElement("td");
    th.style.cssText = "padding:1px 6px 1px 0;color:#64748b;font-weight:500;white-space:nowrap;vertical-align:top";
    th.textContent = key;
    const td = document.createElement("td");
    td.style.cssText = "padding:1px 0;word-break:break-all;color:#334155";
    td.textContent = val;
    tr.appendChild(th);
    tr.appendChild(td);
    table.appendChild(tr);
  }
  root.appendChild(table);

  if (s.comment) {
    const note = document.createElement("p");
    note.style.cssText = "margin:6px 0 0;padding-top:6px;border-top:1px solid #e2e8f0;color:#475569;font-style:italic";
    note.textContent = `"${s.comment}"`;
    root.appendChild(note);
  }

  return root;
}

// ── World Map component ────────────────────────────────────────────────────

function WorldMap({ sightings }: { sightings: Sighting[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const layerRef     = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: WORLD_CENTER,
      zoom: WORLD_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = group;

    const ro = new ResizeObserver(() => { map.invalidateSize(); });
    ro.observe(el);

    return () => {
      ro.disconnect();
      group.clearLayers();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Update markers when sightings change
  useEffect(() => {
    const map   = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    for (const s of sightings) {
      const marker = L.marker([s.latitude, s.longitude], {
        icon: sightingIcon,
        title: speciesLabel(s.species),
      });
      marker.bindPopup(popupEl(s), { maxWidth: 300, className: "sightings-popup" });
      marker.addTo(group);
    }

    requestAnimationFrame(() => { map.invalidateSize(); });
  }, [sightings]);

  return (
    <div className="overflow-hidden rounded-2xl border border-lagoon-500/25 shadow-card ring-1 ring-white/5">
      <div
        ref={containerRef}
        className="ocean-watch-leaflet-map h-[min(58vh,26rem)] w-full hue-rotate-[12deg] saturate-[0.85] brightness-[0.92] contrast-[1.05]"
        role="application"
        aria-label="World map of shark sightings"
      />
    </div>
  );
}


// ── Page ───────────────────────────────────────────────────────────────────

export function MapPage() {
  const navigate = useNavigate();

  // Filter state (UI only — not yet wired to the indexer query)
  const [dateRange, setDateRange]     = useState<DateRange>("30d");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");

  // Data: use mock sightings (swap for fetchSightings() once indexer is live)
  const allSightings = MOCK_MAP_SIGHTINGS;

  // Step 1 — apply date/species filters
  const afterFilters = useMemo(() => {
    const cutoff = cutoffDate(dateRange);
    return allSightings.filter((s) => {
      if (cutoff && new Date(s.observedAt) < cutoff) return false;
      if (speciesFilter !== "all" && s.species !== speciesFilter) return false;
      return true;
    });
  }, [allSightings, dateRange, speciesFilter]);

  // Step 2 — land / sea validation: only sea sightings are shown on the map.
  // Rejected entries (on-land coordinates) are counted and reported to the user.
  const { sea: filtered } = useMemo(
    () => classifySightings(afterFilters, COZUMEL_LAND_GEOJSON),
    [afterFilters],
  );

  return (
    <Layout title="Shark Map">
      <div className="mt-2 space-y-5">

        {/* ── Explanatory text ───────────────────────────────── */}
        <p className="text-sm text-slate-400 text-balance">
          This map shows every shark sighting reported by the OceanWatch community,
          anchored on-chain via{" "}
          <span className="text-lagoon-300 font-medium">Hedera Consensus Service</span>.
          Use the filters below to narrow by date or species.
        </p>

        {/* ── Filters ────────────────────────────────────────── */}
        <div className="space-y-2">
          {/* Date range */}
          <div className="flex flex-wrap gap-1.5">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDateRange(opt.value)}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  dateRange === opt.value
                    ? "bg-lagoon-500/25 text-lagoon-300 ring-1 ring-lagoon-500/40"
                    : "bg-abyss-850/70 text-slate-400 hover:text-foam",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Species filter */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-slate-500">Species</span>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2 text-xs text-foam outline-none ring-reef-400/40 focus:ring-2"
            >
              <option value="all">All species</option>
              {SPECIES_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Count + land-rejection banner ──────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-reef-500/20 px-2 text-xs font-semibold text-reef-300">
              {filtered.length}
            </span>
            <span className="text-xs text-slate-500">
              {filtered.length === 1 ? "sighting" : "sightings"} in sea
            </span>
          </div>

        </div>

        {/* ── World map ──────────────────────────────────────── */}
        <WorldMap sightings={filtered} />

        {/* ── Empty state ────────────────────────────────────── */}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-lagoon-500/25 bg-abyss-850/50 p-6 text-center text-sm text-slate-400">
            No sightings match the current filters.
          </p>
        )}

        {/* ── Secondary footer: About / FAQ ──────────────────── */}
        <div className="border-t border-lagoon-500/10 pt-4 space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 rounded-2xl border border-lagoon-500/25 bg-abyss-850/70 py-3 text-sm font-medium text-lagoon-300 transition hover:border-lagoon-400/40 hover:text-foam"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => navigate("/faq")}
              className="flex-1 rounded-2xl border border-lagoon-500/25 bg-abyss-850/70 py-3 text-sm font-medium text-lagoon-300 transition hover:border-lagoon-400/40 hover:text-foam"
            >
              FAQ
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
