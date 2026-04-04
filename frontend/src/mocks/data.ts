import type { Sighting, Zone } from "../graphql/types";

/** Simplified teaching zones around Cozumel ([lng, lat] polygons). */
export const MOCK_ZONES: Zone[] = [
  {
    id: "west",
    name: "Leeward coast",
    slug: "leeward-west",
    polygon: [
      [-87.02, 20.38],
      [-86.91, 20.38],
      [-86.91, 20.52],
      [-87.02, 20.52],
      [-87.02, 20.38],
    ],
  },
  {
    id: "east",
    name: "Windward coast (east)",
    slug: "windward-east",
    polygon: [
      [-86.91, 20.38],
      [-86.78, 20.38],
      [-86.78, 20.52],
      [-86.91, 20.52],
      [-86.91, 20.38],
    ],
  },
  {
    id: "south",
    name: "South & deep reefs",
    slug: "south-reef",
    polygon: [
      [-86.98, 20.32],
      [-86.82, 20.32],
      [-86.82, 20.4],
      [-86.98, 20.4],
      [-86.98, 20.32],
    ],
  },
  {
    id: "north",
    name: "North & channel",
    slug: "north-channel",
    polygon: [
      [-86.98, 20.5],
      [-86.82, 20.5],
      [-86.82, 20.58],
      [-86.98, 20.58],
      [-86.98, 20.5],
    ],
  },
];

export function initialMockSightings(): Sighting[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  return [
    {
      id: "s1",
      latitude: 20.45,
      longitude: -86.93,
      species: "nurse_shark",
      count: 2,
      behavior: "resting",
      observedAt: iso(new Date(now.getTime() - 86400000 * 2)),
      createdAt: iso(new Date(now.getTime() - 86400000 * 2)),
      comment: "Along the wall, visibility ~20 m.",
      zoneId: "west",
      zoneName: "Leeward coast",
    },
    {
      id: "s2",
      latitude: 20.41,
      longitude: -86.85,
      species: "caribbean_reef_shark",
      count: 1,
      behavior: "hunting",
      observedAt: iso(new Date(now.getTime() - 86400000 * 5)),
      createdAt: iso(new Date(now.getTime() - 86400000 * 5)),
      comment: null,
      zoneId: "east",
      zoneName: "Windward coast (east)",
    },
  ];
}
