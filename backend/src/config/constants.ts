import { Species, Behavior } from "../types/sighting";

export const SPECIES_LABELS: Record<Species, string> = {
  [Species.NURSE_SHARK]: "Nurse Shark",
  [Species.CARIBBEAN_REEF_SHARK]: "Caribbean Reef Shark",
  [Species.GREAT_HAMMERHEAD_SHARK]: "Great Hammerhead Shark",
  [Species.HAMMERHEAD_SHARK]: "Hammerhead Shark",
  [Species.BULL_SHARK]: "Bull Shark",
  [Species.TIGER_SHARK]: "Tiger Shark",
  [Species.UNKNOWN]: "Unknown",
};

export const BEHAVIOR_LABELS: Record<Behavior, string> = {
  [Behavior.FEEDING]: "Feeding",
  [Behavior.MIGRATING]: "Migrating",
  [Behavior.RESTING]: "Resting",
  [Behavior.MATING]: "Mating",
  [Behavior.HUNTING]: "Hunting",
  [Behavior.STRANDED]: "Stranded",
  [Behavior.UNKNOWN]: "Unknown",
};

export const DEFAULTS = {
  species: Species.UNKNOWN,
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

/** Global rate limit */
export const GLOBAL_RATE_LIMIT_MAX = 100;
export const GLOBAL_RATE_LIMIT_WINDOW = "1 minute";

/** Auth challenge TTL and cleanup interval */
export const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const CHALLENGE_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/** Mirror Node pagination limit */
export const MAX_MIRROR_PAGES = 50;

/** Token price cache TTL */
export const PRICE_CACHE_TTL_MS = 30_000; // 30 seconds

/** Hedera transaction retry */
export const HEDERA_MAX_RETRIES = 3;
export const HEDERA_RETRY_BASE_DELAY_MS = 1000;
