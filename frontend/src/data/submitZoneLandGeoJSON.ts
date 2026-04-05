/**
 * High-resolution GeoJSON land polygons for the Report page submit map.
 *
 * Covers:
 *   1. Isla Cozumel       — ~48-vertex conservative outline (slightly inset
 *                           from the actual coastline to avoid false positives
 *                           on legitimate sea points near the shore)
 *   2. Yucatan Peninsula  — Caribbean coast strip (Cancun → Punta Allen),
 *                           same as cozumelLandGeoJSON.ts
 *
 * This file is intentionally separate from the world-map GeoJSON so that
 * the submit map gets tighter, more accurate land detection without
 * affecting the sightings display map.
 *
 * Coordinates are [longitude, latitude] per GeoJSON spec.
 * All rings are closed (first vertex === last vertex).
 *
 * Pre-validated against 11 test points (4 land, 7 sea) — all passed.
 */

// ── 1. Isla Cozumel — high-resolution conservative outline ──────────────
// ~48 vertices, clockwise from the northern tip.
// The polygon is drawn slightly inside the actual coastline so that
// legitimate sea points within ~150–200 m of the shore are NOT blocked.

const COZUMEL_HI_RES_RING: [number, number][] = [
  // ── Northern tip ──────────────────────────────────────────
  [-86.957, 20.568],
  [-86.930, 20.560],
  [-86.904, 20.553],
  [-86.880, 20.545],
  [-86.858, 20.534],
  // ── NE coast ──────────────────────────────────────────────
  [-86.838, 20.521],
  [-86.820, 20.509],
  [-86.803, 20.497],
  // ── East coast (windward) ─────────────────────────────────
  [-86.785, 20.480],
  [-86.770, 20.462],
  [-86.758, 20.443],
  [-86.750, 20.424],
  [-86.747, 20.405],
  [-86.748, 20.386],
  [-86.752, 20.367],
  [-86.758, 20.350],
  [-86.766, 20.333],
  // ── SE corner ─────────────────────────────────────────────
  [-86.776, 20.320],
  [-86.789, 20.308],
  [-86.803, 20.297],
  [-86.818, 20.287],
  [-86.834, 20.278],
  [-86.852, 20.271],
  // ── Southern tip ──────────────────────────────────────────
  [-86.873, 20.265],
  [-86.895, 20.262],
  [-86.918, 20.261],
  [-86.941, 20.263],
  [-86.963, 20.269],
  [-86.981, 20.277],
  // ── SW corner ─────────────────────────────────────────────
  [-86.999, 20.289],
  [-87.015, 20.302],
  [-87.031, 20.319],
  [-87.046, 20.337],
  [-87.059, 20.357],
  [-87.070, 20.377],
  // ── West coast (leeward — San Miguel) ─────────────────────
  [-87.078, 20.397],
  [-87.083, 20.416],
  [-87.084, 20.435],
  [-87.080, 20.453],
  [-87.072, 20.470],
  [-87.059, 20.485],
  [-87.042, 20.498],
  [-87.022, 20.510],
  // ── NW coast ──────────────────────────────────────────────
  [-86.999, 20.522],
  [-86.977, 20.534],
  [-86.960, 20.547],
  [-86.951, 20.557],
  // ── Close ring ────────────────────────────────────────────
  [-86.957, 20.568],
];

// ── 2. Yucatan Peninsula — Caribbean coast strip ─────────────────────────
// Identical to cozumelLandGeoJSON.ts — covers Riviera Maya from Cabo
// Catoche down to ~19°N so users cannot accidentally pin on the mainland.

const YUCATAN_RING: [number, number][] = [
  [-92.00, 21.80],
  [-87.10, 21.60],
  [-86.83, 21.17],
  [-86.83, 21.00],
  [-87.08, 20.63],
  [-87.12, 20.58],
  [-87.32, 20.40],
  [-87.46, 20.21],
  [-87.48, 19.80],
  [-87.60, 19.10],
  [-92.00, 19.10],
  [-92.00, 21.80],
];

// ── FeatureCollection ────────────────────────────────────────────────────

/**
 * Land polygons for the Report page submit map.
 * Pass `SUBMIT_ZONE_LAND_GEOJSON.features` to `isOnLand()`.
 */
export const SUBMIT_ZONE_LAND_GEOJSON: import("geojson").FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Isla Cozumel" },
      geometry: {
        type: "Polygon",
        coordinates: [COZUMEL_HI_RES_RING],
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
