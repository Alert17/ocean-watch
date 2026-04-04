import type { Sighting } from "../graphql/types";

export function initialMockSightings(): Sighting[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  return [
    {
      id: "mock-s1",
      latitude: 20.45,
      longitude: -86.93,
      species: "nurse_shark",
      count: 2,
      behavior: "resting",
      observedAt: iso(new Date(now.getTime() - 86400000 * 2)),
      createdAt: iso(new Date(now.getTime() - 86400000 * 2)),
      comment: "Along the wall, visibility ~20 m.",
      mediaUrl: null,
      wallet: "0.0.1",
      sequenceNumber: 1,
      consensusTimestamp: "1775000000.000000000",
    },
    {
      id: "mock-s2",
      latitude: 20.41,
      longitude: -86.85,
      species: "caribbean_reef_shark",
      count: 1,
      behavior: "hunting",
      observedAt: iso(new Date(now.getTime() - 86400000 * 5)),
      createdAt: iso(new Date(now.getTime() - 86400000 * 5)),
      comment: null,
      mediaUrl: null,
      wallet: "0.0.1",
      sequenceNumber: 2,
      consensusTimestamp: "1775100000.000000000",
    },
  ];
}
