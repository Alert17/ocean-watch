import type { Sighting, Zone } from "../graphql/types";

/** Zones pédagogiques autour de Cozumel (polygones simplifiés, [lng, lat]). */
export const MOCK_ZONES: Zone[] = [
  {
    id: "west",
    name: "Côte sous le vent",
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
    name: "Côte au vent (orient)",
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
    name: "Sud & récifs profonds",
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
    name: "Nord & canal",
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
      comment: "Sous le tombant, visibilité ~20 m.",
      zoneId: "west",
      zoneName: "Côte sous le vent",
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
      zoneName: "Côte au vent (orient)",
    },
  ];
}
