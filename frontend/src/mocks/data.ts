import { Behavior, Species } from "../graphql/enums";
import type { Sighting } from "../graphql/types";

export function initialMockSightings(): Sighting[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  return [
    {
      id: "mock-s1",
      latitude: 20.45,
      longitude: -86.93,
      species: Species.NURSE_SHARK,
      count: 2,
      behavior: Behavior.RESTING,
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
      species: Species.CARIBBEAN_REEF_SHARK,
      count: 1,
      behavior: Behavior.HUNTING,
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
