import { config } from "./config";
import { Sighting, MirrorResponse } from "./types";

const baseUrl = `${config.hedera.mirrorNodeUrl}/api/v1/topics/${config.hedera.topicId}/messages`;

const CACHE_TTL_MS = 30_000; // 30 seconds

let cachedSightings: Sighting[] = [];
let cacheTimestamp = 0;

function decodeMessage(raw: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function parseSighting(parsed: Record<string, unknown>, sequenceNumber: number, consensusTimestamp: string): Sighting | null {
  if (!parsed.id || !parsed.latitude || !parsed.longitude || !parsed.wallet) {
    return null;
  }

  return {
    id: parsed.id as string,
    latitude: parsed.latitude as number,
    longitude: parsed.longitude as number,
    species: parsed.species as Sighting["species"],
    count: parsed.count as number,
    behavior: parsed.behavior as Sighting["behavior"],
    observedAt: parsed.observedAt as string,
    createdAt: parsed.createdAt as string,
    comment: parsed.comment as string | undefined,
    mediaUrl: parsed.mediaUrl as string | undefined,
    wallet: parsed.wallet as string,
    sequenceNumber,
    consensusTimestamp,
  };
}

async function fetchFromMirrorNode(): Promise<Sighting[]> {
  const sightings: Sighting[] = [];
  let url: string | null = baseUrl;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) break;

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
