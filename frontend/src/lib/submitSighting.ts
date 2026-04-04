/**
 * REST helper — calls POST /sightings/ on the local Fastify backend.
 *
 * Backend contract (backend/src/routes/sightings.ts):
 *   Body   : { latitude, longitude, species?, count?, behavior?,
 *               observedAt, comment?, mediaUrl?, wallet }
 *   Returns: { sighting, sequenceNumber }
 *
 * Limitations (frontend-only, do not edit backend):
 *   - mediaUrl must be a pre-uploaded IPFS URL string.
 *     File upload to IPFS is NOT implemented yet (see TODO below).
 *   - wallet is a Hedera Account ID. Auth is not implemented yet;
 *     a placeholder value is used until wallet connect is added.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export interface SightingPayload {
  latitude: number;
  longitude: number;
  species: string;
  count: number;
  behavior: string;
  observedAt: string; // ISO-8601
  comment?: string;
  /** TODO: upload file(s) to IPFS, then pass the resulting URL here. */
  mediaUrl?: string;
  /** TODO: replace with authenticated Hedera Account ID from wallet connect. */
  wallet: string;
}

export interface SubmitResult {
  sequenceNumber?: string;
}

export async function submitSighting(payload: SightingPayload): Promise<SubmitResult> {
  const res = await fetch(`${API_BASE}/sightings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json() as SubmitResult;
  return data;
}
