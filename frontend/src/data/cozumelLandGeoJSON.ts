/**
 * GeoJSON land polygons for the Cozumel region (~150 km radius).
 *
 * Covers:
 *   1. Isla Cozumel           — the island itself
 *   2. Yucatan Peninsula      — Riviera Maya coastline (Cancun → Punta Allen)
 *                               plus inland mass to the west
 *
 * Used by landValidator.ts to reject sighting coordinates on land.
 * Coordinates are [longitude, latitude] per GeoJSON spec.
 *
 * Source: manually digitised from OpenStreetMap / satellite imagery.
 * For world-wide production coverage, replace COZUMEL_LAND_GEOJSON with
 * the Natural Earth 10 m coastline (ne_10m_land.geojson, ~8 MB) or an
 * OSM coastline extract for the Caribbean bounding box.
 *
 * All rings are closed (first vertex === last vertex).
 */

// ── 1. Isla Cozumel ─────────────────────────────────────────────────────
// 28-vertex outline, clockwise from the northern tip.

const COZUMEL_RING: [number, number][] = [
  // ── Northern tip ──────────────────────────────────────────
  [-86.960, 20.570],
  [-86.918, 20.563],
  [-86.878, 20.548],
  // ── NE coast ──────────────────────────────────────────────
  [-86.840, 20.528],
  [-86.805, 20.508],
  [-86.776, 20.486],
  // ── East coast (windward) ─────────────────────────────────
  [-86.753, 20.459],
  [-86.743, 20.432],
  [-86.740, 20.404],
  [-86.743, 20.375],
  [-86.751, 20.350],
  // ── SE corner ─────────────────────────────────────────────
  [-86.773, 20.320],
  [-86.804, 20.294],
  [-86.840, 20.272],
  // ── Southern tip ──────────────────────────────────────────
  [-86.888, 20.261],
  [-86.940, 20.260],
  [-86.980, 20.268],
  // ── SW corner ─────────────────────────────────────────────
  [-87.022, 20.287],
  [-87.060, 20.312],
  [-87.090, 20.344],
  // ── West coast (leeward — San Miguel) ─────────────────────
  [-87.105, 20.378],
  [-87.101, 20.410],
  [-87.087, 20.440],
  [-87.068, 20.466],
  [-87.047, 20.490],
  // ── NW coast ──────────────────────────────────────────────
  [-87.020, 20.515],
  [-86.990, 20.538],
  [-86.968, 20.556],
  // ── Close ring ────────────────────────────────────────────
  [-86.960, 20.570],
];

// ── 2. Yucatan Peninsula — Caribbean (east) coast ───────────────────────
// Covers the Riviera Maya from Cabo Catoche (NE tip) down to ~19°N,
// then sweeps far west to include the entire peninsula mass.
// This catches misplaced pins on Cancun, Playa del Carmen, Tulum, etc.
//
// Coastline key reference points:
//   Cabo Catoche NE tip : 21.60°N, -87.08°W
//   Cancun              : 21.17°N, -86.83°W
//   Playa del Carmen    : 20.63°N, -87.08°W
//   Xcaret              : 20.58°N, -87.12°W
//   Akumal              : 20.40°N, -87.32°W
//   Tulum               : 20.21°N, -87.46°W
//   Punta Allen         : 19.80°N, -87.48°W
//
// The polygon then closes through the interior (-92°W) — a large
// catch-all boundary for the western landmass.

const YUCATAN_RING: [number, number][] = [
  // ── NW interior corner ────────────────────────────────────
  [-92.00, 21.80],
  // ── NE tip (Cabo Catoche) ─────────────────────────────────
  [-87.10, 21.60],
  // ── Cancun coast ──────────────────────────────────────────
  [-86.83, 21.17],
  [-86.83, 21.00],  // S end of Cancun hotel zone / Punta Nizuc
  // ── Riviera Maya coast (south) ────────────────────────────
  [-87.08, 20.63],  // Playa del Carmen
  [-87.12, 20.58],  // Xcaret
  [-87.32, 20.40],  // Akumal
  [-87.46, 20.21],  // Tulum
  [-87.48, 19.80],  // Punta Allen
  // ── Southern boundary (~150 km from Cozumel) ─────────────
  [-87.60, 19.10],
  // ── SW interior corner ────────────────────────────────────
  [-92.00, 19.10],
  // ── Close ring through interior ───────────────────────────
  [-92.00, 21.80],
];

// ── FeatureCollection ────────────────────────────────────────────────────

/**
 * All land polygons within ~150 km of Isla Cozumel.
 * Pass this to `classifySightings()` in landValidator.ts.
 *
 * To extend coverage globally, append additional Feature objects here or
 * swap the entire export for a world-coastline FeatureCollection.
 */
export const COZUMEL_LAND_GEOJSON: import("geojson").FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Isla Cozumel" },
      geometry: {
        type: "Polygon",
        coordinates: [COZUMEL_RING],
      },
    },
    {
      type: "Feature",
      properties: { name: "Yucatan Peninsula" },
      geometry: {
        type: "Polygon",
        coordinates: [YUCATAN_RING],
      },
    },
  ],
};
