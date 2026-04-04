/** Map-only zones around Cozumel (not from the indexer API). Ring: [lng, lat]. */
export type MarineZone = {
  id: string;
  name: string;
  slug: string;
  polygon: [number, number][];
};

export const MARINE_ZONES: MarineZone[] = [
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
