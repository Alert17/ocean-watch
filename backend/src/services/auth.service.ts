import { randomBytes } from "node:crypto";
import { PublicKey } from "@hashgraph/sdk";
import { prisma } from "../db";
import { config } from "../config";

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function findUserByWallet(wallet: string) {
  return prisma.user.findUnique({ where: { wallet } });
}

export async function createUser(wallet: string, name?: string, publicKey?: string) {
  return prisma.user.create({ data: { wallet, name, publicKey } });
}

export async function createChallenge(wallet: string): Promise<{ nonce: string; message: string; expiresAt: Date }> {
  const nonce = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await prisma.authChallenge.create({
    data: { wallet, nonce, expiresAt },
  });

  const message = `Sign this message to verify wallet ownership for OceanWatch:\n${nonce}`;

  return { nonce, message, expiresAt };
}

export async function verifyChallenge(
  wallet: string,
  nonce: string,
  signature: string,
): Promise<{ valid: boolean; publicKeyStr?: string }> {
  // 1. Find and validate challenge
  const challenge = await prisma.authChallenge.findUnique({ where: { nonce } });

  if (!challenge || challenge.wallet !== wallet || challenge.used || challenge.expiresAt < new Date()) {
    return { valid: false };
  }

  // 2. Get public key from Mirror Node
  const accountKey = await fetchAccountKey(wallet);
  if (!accountKey) {
    return { valid: false };
  }

  // 3. Verify signature
  const message = `Sign this message to verify wallet ownership for OceanWatch:\n${nonce}`;
  const messageBytes = new Uint8Array(Buffer.from(message, "utf-8"));
  const signatureBytes = new Uint8Array(Buffer.from(signature, "hex"));

  try {
    const publicKey = accountKey._type === "ED25519"
      ? PublicKey.fromStringED25519(accountKey.key)
      : PublicKey.fromStringECDSA(accountKey.key);

    const isValid = publicKey.verify(messageBytes, signatureBytes);

    if (!isValid) return { valid: false };
  } catch {
    return { valid: false };
  }

  // 4. Mark challenge as used
  await prisma.authChallenge.update({
    where: { nonce },
    data: { used: true },
  });

  return { valid: true, publicKeyStr: accountKey.key };
}

interface MirrorAccountKey {
  _type: string;
  key: string;
}

async function fetchAccountKey(wallet: string): Promise<MirrorAccountKey | null> {
  try {
    const res = await fetch(
      `${config.hedera.mirrorNodeUrl}/api/v1/accounts/${wallet}`,
    );
    if (!res.ok) return null;

    const data = await res.json() as { key?: MirrorAccountKey };
    if (!data.key?.key || !data.key?._type) return null;

    // Only simple key types supported (no KeyList/ThresholdKey)
    if (data.key._type !== "ED25519" && data.key._type !== "ECDSA_SECP256K1") {
      return null;
    }

    return data.key;
  } catch {
    return null;
  }
}
