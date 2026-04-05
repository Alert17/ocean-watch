export enum Species {
  NURSE_SHARK = "nurse_shark",
  CARIBBEAN_REEF_SHARK = "caribbean_reef_shark",
  GREAT_HAMMERHEAD_SHARK = "great_hammerhead_shark",
  HAMMERHEAD_SHARK = "hammerhead_shark",
  BULL_SHARK = "bull_shark",
  TIGER_SHARK = "tiger_shark",
  WHALE_SHARK = "whale_shark",
  UNKNOWN = "unknown",
}

export enum Behavior {
  FEEDING = "feeding",
  MIGRATING = "migrating",
  RESTING = "resting",
  MATING = "mating",
  HUNTING = "hunting",
  STRANDED = "stranded",
  UNKNOWN = "unknown",
}

export interface CreateSightingBody {
  latitude: number;
  longitude: number;
  species?: Species;
  count?: number;
  behavior?: Behavior;
  observedAt: string;
  comment?: string;
  mediaUrl?: string;
}

export interface Sighting {
  id: string;
  latitude: number;
  longitude: number;
  species: Species;
  count: number;
  behavior: Behavior;
  observedAt: string;   // ISO timestamp — when the observer saw it
  createdAt: string;    // ISO timestamp — when the record was created
  comment?: string;
  mediaUrl?: string;    // IPFS link
  wallet: string;       // Hedera Account ID of the data provider
}
