import { config } from "./config";
import { Sighting } from "./types";

interface MirrorMessage {
  consensus_timestamp: string;
  sequence_number: number;
  message: string;
}

interface MirrorResponse {
  messages: MirrorMessage[];
  links?: { next?: string };
}

const baseUrl = `${config.hedera.mirrorNodeUrl}/api/v1/topics/${config.hedera.topicId}/messages`;

function decodeMessage(raw: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function fetchSightings(): Promise<Sighting[]> {
  const sightings: Sighting[] = [];
  let url: string | null = baseUrl;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) break;

    const data = (await res.json()) as MirrorResponse;

    for (const msg of data.messages) {
      const parsed = decodeMessage(msg.message);
      if (!parsed || !parsed.id) continue;

      sightings.push({
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
        sequenceNumber: msg.sequence_number,
        consensusTimestamp: msg.consensus_timestamp,
      });
    }

    url = data.links?.next
      ? `${config.hedera.mirrorNodeUrl}${data.links.next}`
      : null;
  }

  return sightings;
}
