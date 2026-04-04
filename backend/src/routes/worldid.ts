import { FastifyInstance } from "fastify";
import { authenticate } from "../plugins/authenticate";
import { VerifyBody } from "../types/worldid";
import {
  findUserByNullifier,
  verifyProof,
  markVerified,
  getVerificationStatus,
} from "../services/worldid.service";
import { worldIdVerifyResponse, worldIdStatusResponse } from "../schemas/responses";
import { config } from "../config";

const verifySchema = {
  description: "Verify World ID proof and link to user account",
  tags: ["worldid"],
  security: [{ bearerAuth: [] }],
  response: worldIdVerifyResponse,
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
  app.post<{ Body: VerifyBody }>(
    "/verify",
    { schema: verifySchema, onRequest: [authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      const { nullifier_hash } = request.body;

      // 1. Prevent cross-account linking of the same World ID.
      const existing = await findUserByNullifier(nullifier_hash);
      if (existing && existing.id !== userId) {
        return reply.conflict("This World ID is already linked to another account");
      }

      // 2. If the same user is re-verifying with the same nullifier, short-circuit
      //    to success — Worldcoin would reject with max_verifications_reached.
      if (existing && existing.id === userId && existing.worldIdVerified) {
        return { verified: true, user: existing };
      }

      // 3. Verify proof with Worldcoin.
      const result = await verifyProof(request.body);
      if (!result.ok) {
        // If Worldcoin reports max_verifications_reached and the nullifier
        // belongs to this user, trust our DB and accept. Otherwise propagate.
        if (result.code === "max_verifications_reached" && existing?.id === userId) {
          const user = await markVerified(userId, nullifier_hash);
          return { verified: true, user };
        }
        return reply.badRequest(result.detail ?? "World ID verification failed");
      }

      const user = await markVerified(userId, nullifier_hash);
      return { verified: true, user };
    },
  );

  app.get(
    "/status",
    {
      schema: {
        description: "Check World ID verification status",
        tags: ["worldid"],
        security: [{ bearerAuth: [] }],
        response: worldIdStatusResponse,
      },
      onRequest: [authenticate],
    },
    async (request) => {
      const verified = await getVerificationStatus(request.user.sub);
      return { verified };
    },
  );

  // ── Dev-only mock ─────────────────────────────────────────────────────
  // Lets the frontend "Mock World ID (dev only)" button mark the server-side
  // user as verified without running a real IDKit proof. Disabled in prod.
  if (!config.isProduction) {
    app.post(
      "/dev-mock",
      {
        schema: {
          description: "Dev-only: mark current user as World ID verified (no proof)",
          tags: ["worldid"],
          security: [{ bearerAuth: [] }],
          response: worldIdVerifyResponse,
        },
        onRequest: [authenticate],
      },
      async (request) => {
        const userId = request.user.sub;
        // Use a deterministic per-user pseudo-nullifier so the unique constraint
        // on worldIdHash still holds, but doesn't collide with real ones.
        const mockNullifier = `dev-mock-${userId}`;
        const user = await markVerified(userId, mockNullifier);
        return { verified: true, user };
      },
    );
  }
}
