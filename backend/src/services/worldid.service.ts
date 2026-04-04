import { randomBytes } from "node:crypto";
import { prisma } from "../db";
import { config } from "../config";
import { VerifyBody } from "../types/worldid";

export async function findUserByNullifier(nullifierHash: string) {
  return prisma.user.findUnique({ where: { worldIdHash: nullifierHash } });
}

export interface VerifyProofResult {
  ok: boolean;
  /** Worldcoin error code, if the call failed. */
  code?: string;
  /** Human-readable detail for the client / logs. */
  detail?: string;
}

export async function verifyProof(body: VerifyBody): Promise<VerifyProofResult> {
  // World ID 4.0 verify endpoint. Accepts legacy v3 proofs from IDKit via the
  // `protocol_version: "3.0"` shape. See:
  // https://docs.world.org/api-reference/developer-portal/verify
  const url = `https://developer.world.org/api/v4/verify/${config.worldId.rpId}`;

  // Nonce is a per-request replay-protection value; any unique hex string works.
  const nonce = `0x${randomBytes(16).toString("hex")}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        protocol_version: "3.0",
        nonce,
        action: config.worldId.action,
        environment: "production",
        responses: [
          {
            identifier: body.verification_level,
            merkle_root: body.merkle_root,
            nullifier: body.nullifier_hash,
            proof: body.proof,
            signal_hash: "0x00c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a4",
          },
        ],
      }),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Network error";
    console.error("[worldid] verify fetch failed:", detail);
    return { ok: false, code: "network_error", detail };
  }

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    code?: string;
    detail?: string;
    results?: Array<{ success?: boolean; code?: string; detail?: string }>;
  };

  if (res.ok && data.success) {
    return { ok: true };
  }

  // v4 returns top-level code for envelope errors and per-response codes for
  // proof-level errors. Surface the most specific one we have.
  const nested = data.results?.find((r) => !r.success);
  const code = nested?.code ?? data.code;
  const detail = nested?.detail ?? data.detail ?? `HTTP ${res.status}`;

  console.warn("[worldid] verify rejected", { status: res.status, code, detail });
  return { ok: false, code, detail };
}

export async function markVerified(userId: string, nullifierHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      worldIdHash: nullifierHash,
      worldIdVerified: true,
    },
  });
}

export async function getVerificationStatus(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.worldIdVerified ?? false;
}
