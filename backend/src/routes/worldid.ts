import { FastifyInstance } from "fastify";
import { prisma } from "../db";
import { config } from "../config";
import { authenticate } from "../plugins/authenticate";
import { VerifyBody } from "../types/worldid";

const verifySchema = {
  description: "Verify World ID proof and link to user account",
  tags: ["worldid"],
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["proof", "merkle_root", "nullifier_hash", "verification_level"],
    properties: {
      proof: { type: "string" },
      merkle_root: { type: "string" },
      nullifier_hash: { type: "string" },
      verification_level: { type: "string", enum: ["orb", "device"] },
    },
  },
};

export async function worldIdRoutes(app: FastifyInstance) {
  app.post<{ Body: VerifyBody }>("/verify", { schema: verifySchema, onRequest: [authenticate] }, async (request, reply) => {
    const userId = request.user.sub;
    const { proof, merkle_root, nullifier_hash, verification_level } = request.body;

    // Check if this nullifier is already used by another user
    const existing = await prisma.user.findUnique({ where: { worldIdHash: nullifier_hash } });
    if (existing && existing.id !== userId) {
      return reply.conflict("This World ID is already linked to another account");
    }

    // Verify proof with World ID API
    const verifyRes = await fetch(`https://developer.worldcoin.org/api/v2/verify/${config.worldId.appId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proof,
        merkle_root,
        nullifier_hash,
        action: "verify-human",
        verification_level,
      }),
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json().catch(() => ({}));
      app.log.warn({ err, status: verifyRes.status }, "World ID verification failed");
      return reply.badRequest("World ID verification failed");
    }

    // Update user with World ID
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        worldIdHash: nullifier_hash,
        worldIdVerified: true,
      },
    });

    return { verified: true, user };
  });

  app.get("/status", { schema: { description: "Check World ID verification status", tags: ["worldid"], security: [{ bearerAuth: [] }] }, onRequest: [authenticate] }, async (request) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.sub } });
    return {
      verified: user?.worldIdVerified ?? false,
    };
  });
}
