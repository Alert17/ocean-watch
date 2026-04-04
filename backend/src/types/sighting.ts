export enum Species {
  WHITE_SHARK = "white_shark",
}

export enum Behavior {
  FEEDING = "feeding",
  MIGRATING = "migrating",
  RESTING = "resting",
  PLAYING = "playing",
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
