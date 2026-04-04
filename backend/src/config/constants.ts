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

/** Token has 2 decimals → 1 OCEAN = 100 units on-chain */
export const TOKEN_DECIMALS = 100;

/** 10.00 OCEAN per validated sighting */
export const REWARD_AMOUNT = 10_00;

/** Donation split: 80% treasury, 20% platform */
export const TREASURY_PERCENT = 80;
export const PLATFORM_FEE_PERCENT = 20;

/** Max upload file size in bytes (100 MB) */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Rate limit: max sightings per time window */
export const SIGHTING_RATE_LIMIT_MAX = 10;
export const SIGHTING_RATE_LIMIT_WINDOW = "1 hour";
