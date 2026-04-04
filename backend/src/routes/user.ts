import { FastifyInstance } from "fastify";
import { prisma } from "../db";
import { authenticate } from "../plugins/authenticate";
import { getContributorBalance } from "../hedera";

const profileSchema = {
  description: "Get current user profile",
  tags: ["user"],
  security: [{ bearerAuth: [] }],
};

const balanceSchema = {
  description: "Get current user OCEAN token balance",
  tags: ["user"],
  security: [{ bearerAuth: [] }],
};

const statsSchema = {
  description: "Get sighting stats for current user (from Mirror Node)",
  tags: ["user"],
  security: [{ bearerAuth: [] }],
};

export async function userRoutes(app: FastifyInstance) {
  app.get("/profile", { schema: profileSchema, onRequest: [authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.sub } });
    if (!user) return reply.notFound("User not found");
    return user;
  });

  app.get("/balance", { schema: balanceSchema, onRequest: [authenticate] }, async (request, reply) => {
    const wallet = request.user.wallet;
    try {
      const balance = await getContributorBalance(wallet);
      return { wallet, balance };
    } catch (err) {
      app.log.warn({ err, wallet }, "Failed to get balance");
      return { wallet, balance: "0" };
    }
  });

  app.get("/stats", { schema: statsSchema, onRequest: [authenticate] }, async (request, reply) => {
    const wallet = request.user.wallet;
    const topicId = (await import("../config")).config.hedera.topicId;
    const mirrorUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`;

    let sightingCount = 0;
    let nextLink: string | null = mirrorUrl;

    while (nextLink) {
      const res = await fetch(nextLink);
      const data = await res.json() as { messages: { message: string }[]; links?: { next?: string } };

      for (const msg of data.messages) {
        try {
          const parsed = JSON.parse(Buffer.from(msg.message, "base64").toString());
          if (parsed.wallet === wallet) sightingCount++;
        } catch {}
      }

      nextLink = data.links?.next
        ? `https://testnet.mirrornode.hedera.com${data.links.next}`
        : null;
    }

    return { wallet, sightingCount };
  });
}
