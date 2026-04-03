import { Species, Behavior } from "../types/sighting";

export const SPECIES_LABELS: Record<Species, string> = {
  [Species.WHITE_SHARK]: "Great White Shark",
};

export const BEHAVIOR_LABELS: Record<Behavior, string> = {
  [Behavior.FEEDING]: "Feeding",
  [Behavior.MIGRATING]: "Migrating",
  [Behavior.RESTING]: "Resting",
  [Behavior.PLAYING]: "Playing",
  [Behavior.HUNTING]: "Hunting",
  [Behavior.STRANDED]: "Stranded",
  [Behavior.UNKNOWN]: "Unknown",
};

export const DEFAULTS = {
  species: Species.WHITE_SHARK,
  behavior: Behavior.UNKNOWN,
  count: 1,
} as const;
