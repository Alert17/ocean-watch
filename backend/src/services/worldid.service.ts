import { prisma } from "../db";
import { config } from "../config";
import { VerifyBody } from "../types/worldid";

export async function findUserByNullifier(nullifierHash: string) {
  return prisma.user.findUnique({ where: { worldIdHash: nullifierHash } });
}

export async function verifyProof(body: VerifyBody): Promise<boolean> {
  const res = await fetch(`https://developer.worldcoin.org/api/v2/verify/${config.worldId.appId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      proof: body.proof,
      merkle_root: body.merkle_root,
      nullifier_hash: body.nullifier_hash,
      action: "verify-human",
      verification_level: body.verification_level,
    }),
  });

  return res.ok;
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
