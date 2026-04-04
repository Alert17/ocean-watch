import { FastifyInstance } from "fastify";
import { authenticate } from "../plugins/authenticate";
import { getUserById, getBalance, getSightingCount } from "../services/user.service";

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
    const user = await getUserById(request.user.sub);
    if (!user) return reply.notFound("User not found");
    return user;
  });

  app.get("/balance", { schema: balanceSchema, onRequest: [authenticate] }, async (request, reply) => {
    const wallet = request.user.wallet;
    try {
      const balance = await getBalance(wallet);
      return { wallet, balance };
    } catch (err) {
      app.log.warn({ err, wallet }, "Failed to get balance");
      return { wallet, balance: "0" };
    }
  });

  app.get("/stats", { schema: statsSchema, onRequest: [authenticate] }, async (request) => {
    const wallet = request.user.wallet;
    const sightingCount = await getSightingCount(wallet);
    return { wallet, sightingCount };
  });
}
