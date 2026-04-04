import { FastifyInstance } from "fastify";
import { authenticate } from "../plugins/authenticate";
import { VerifyBody } from "../types/worldid";
import {
  findUserByNullifier,
  verifyProof,
  markVerified,
  getVerificationStatus,
} from "../services/worldid.service";

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
    const { nullifier_hash } = request.body;

    const existing = await findUserByNullifier(nullifier_hash);
    if (existing && existing.id !== userId) {
      return reply.conflict("This World ID is already linked to another account");
    }

    const ok = await verifyProof(request.body);
    if (!ok) {
      return reply.badRequest("World ID verification failed");
    }

    const user = await markVerified(userId, nullifier_hash);

    return { verified: true, user };
  });

  app.get("/status", {
    schema: { description: "Check World ID verification status", tags: ["worldid"], security: [{ bearerAuth: [] }] },
    onRequest: [authenticate],
  }, async (request) => {
    const verified = await getVerificationStatus(request.user.sub);
    return { verified };
  });
}
