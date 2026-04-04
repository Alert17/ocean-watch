import { config } from "./config";
import { Sighting, Species, Behavior, MirrorResponse } from "./types";

const baseUrl = `${config.hedera.mirrorNodeUrl}/api/v1/topics/${config.hedera.topicId}/messages`;

const CACHE_TTL_MS = 30_000; // 30 seconds

let cachedSightings: Sighting[] = [];
let cacheTimestamp = 0;

const validSpecies = new Set(Object.values(Species));
const validBehaviors = new Set(Object.values(Behavior));

function decodeMessage(raw: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function parseSighting(parsed: Record<string, unknown>, sequenceNumber: number, consensusTimestamp: string): Sighting | null {
  // Required fields type checks
  if (
    typeof parsed.id !== "string" ||
    typeof parsed.latitude !== "number" ||
    typeof parsed.longitude !== "number" ||
    typeof parsed.wallet !== "string" ||
    typeof parsed.observedAt !== "string" ||
    typeof parsed.createdAt !== "string"
  ) {
    return null;
  }

  // Range validation
  if (parsed.latitude < -90 || parsed.latitude > 90) return null;
  if (parsed.longitude < -180 || parsed.longitude > 180) return null;

  // Enum validation with fallback
  const species = validSpecies.has(parsed.species as Species)
    ? (parsed.species as Species)
    : Species.UNKNOWN;

  const behavior = validBehaviors.has(parsed.behavior as Behavior)
    ? (parsed.behavior as Behavior)
    : Behavior.UNKNOWN;

  const count = typeof parsed.count === "number" && parsed.count > 0
    ? parsed.count
    : 1;

  return {
    id: parsed.id,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    species,
    count,
    behavior,
    observedAt: parsed.observedAt,
    createdAt: parsed.createdAt,
    comment: typeof parsed.comment === "string" ? parsed.comment : undefined,
    mediaUrl: typeof parsed.mediaUrl === "string" ? parsed.mediaUrl : undefined,
    wallet: parsed.wallet,
    sequenceNumber,
    consensusTimestamp,
  };
}

async function fetchFromMirrorNode(): Promise<Sighting[]> {
  const sightings: Sighting[] = [];
  let url: string | null = baseUrl;

  while (url) {
    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      console.error("[mirror] Network error fetching messages:", err);
      break;
    }

    if (!res.ok) {
      console.error(`[mirror] Mirror Node returned ${res.status} for ${url}`);
      break;
    }

    const data = (await res.json()) as MirrorResponse;

    for (const msg of data.messages) {
      const parsed = decodeMessage(msg.message);
      if (!parsed) continue;

      const sighting = parseSighting(parsed, msg.sequence_number, msg.consensus_timestamp);
      if (sighting) sightings.push(sighting);
    }

    url = data.links?.next
      ? `${config.hedera.mirrorNodeUrl}${data.links.next}`
      : null;
  }

  return sightings;
}

export async function fetchSightings(): Promise<Sighting[]> {
  const now = Date.now();

  if (cachedSightings.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSightings;
  }

  cachedSightings = await fetchFromMirrorNode();
  cacheTimestamp = now;

  return cachedSightings;
}
