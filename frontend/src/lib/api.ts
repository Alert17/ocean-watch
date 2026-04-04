/**
 * REST client for https://api.oceanwatch.xyz
 * See /API.md for full contract documentation.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "https://api.oceanwatch.xyz";

// ── Types ─────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  wallet: string;
  name: string;
  worldIdVerified?: boolean;
  worldIdHash?: string;
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export interface WorldIdProof {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: string;
}

export interface VerifyWorldIdResponse {
  verified: boolean;
  user: ApiUser;
}

export interface SightingPayload {
  latitude: number;
  longitude: number;
  species: string;
  count: number;
  behavior: string;
  observedAt: string; // ISO-8601
  comment?: string;
  mediaUrl?: string;
}

export interface TokenPriceInfo {
  treasuryBalanceHbar: number;
  circulatingSupply: number;
  pricePerToken: number;
}

export interface DonateResponse {
  totalHbar: number;
  treasuryHbar: number;
  platformHbar: number;
  transactionId: string;
}

export interface SightingResponse {
  sighting: {
    id: string;
    latitude: number;
    longitude: number;
    species: string;
    count: number;
    behavior: string;
    observedAt: string;
    createdAt: string;
    wallet: string;
  };
  sequenceNumber: string;
  reward: {
    tokensMinted: number;
    recipientAccount: string;
    transactionId: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

async function toError(res: Response): Promise<Error> {
  const body = await res.json().catch(() => ({})) as { message?: string; error?: string };
  return new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
}

function authHeaders(jwt: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };
}

// ── Auth (challenge-sign-verify) ─────────────────────────────────────────

export interface ChallengeResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface VerifyPayload {
  wallet: string;
  nonce: string;
  signature: string;
}

/** POST /auth/challenge — requests a nonce + message to sign. */
export async function requestChallenge(wallet: string): Promise<ChallengeResponse> {
  const res = await fetch(`${BASE}/auth/challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<ChallengeResponse>;
}

/** POST /auth/verify — submits signed challenge for JWT. */
export async function verifySignature(payload: VerifyPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<AuthResponse>;
}

// ── Token / treasury ─────────────────────────────────────────────────────

/** GET /token/price — public */
export async function getTokenPrice(): Promise<TokenPriceInfo> {
  const res = await fetch(`${BASE}/token/price`);
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<TokenPriceInfo>;
}

/** POST /token/donate — JWT required; donorAccountId must match the authenticated wallet. */
export async function donateHbar(
  jwt: string,
  donorAccountId: string,
  amountHbar: number,
): Promise<DonateResponse> {
  const res = await fetch(`${BASE}/token/donate`, {
    method: "POST",
    headers: authHeaders(jwt),
    body: JSON.stringify({ donorAccountId, amountHbar }),
  });
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<DonateResponse>;
}

// ── World ID ──────────────────────────────────────────────────────────────

/**
 * POST /worldid/verify — verifies a World ID proof and links it to the user.
 * Throws if verification fails (400 invalid proof, 409 already linked, etc.)
 */
export async function verifyWorldId(
  proof: WorldIdProof,
  jwt: string,
): Promise<VerifyWorldIdResponse> {
  const res = await fetch(`${BASE}/worldid/verify`, {
    method: "POST",
    headers: authHeaders(jwt),
    body: JSON.stringify(proof),
  });
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<VerifyWorldIdResponse>;
}

/** GET /worldid/status — checks if the current user has verified World ID. */
export async function getWorldIdStatus(jwt: string): Promise<boolean> {
  const res = await fetch(`${BASE}/worldid/status`, {
    headers: authHeaders(jwt),
  });
  if (!res.ok) return false;
  const data = await res.json() as { verified: boolean };
  return data.verified;
}

// ── Sightings ─────────────────────────────────────────────────────────────

/** POST /sightings — requires JWT. Backend writes to HCS and mints 10 OCEAN. */
export async function submitSightingToApi(
  payload: SightingPayload,
  jwt: string,
): Promise<SightingResponse> {
  const res = await fetch(`${BASE}/sightings`, {
    method: "POST",
    headers: authHeaders(jwt),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<SightingResponse>;
}
