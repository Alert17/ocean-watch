import { FastifyInstance } from "fastify";
import { prisma } from "../db";

const registerSchema = {
  description: "Register a new user by wallet",
  tags: ["auth"],
  body: {
    type: "object",
    required: ["wallet"],
    properties: {
      wallet: { type: "string", description: "Hedera Account ID (0.0.xxx)" },
      name: { type: "string" },
    },
  },
};

const loginSchema = {
  description: "Login by wallet, returns JWT",
  tags: ["auth"],
  body: {
    type: "object",
    required: ["wallet"],
    properties: {
      wallet: { type: "string", description: "Hedera Account ID (0.0.xxx)" },
    },
  },
};

interface RegisterBody {
  wallet: string;
  name?: string;
}

interface LoginBody {
  wallet: string;
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>("/register", { schema: registerSchema }, async (request, reply) => {
    const { wallet, name } = request.body;

    const existing = await prisma.user.findUnique({ where: { wallet } });
    if (existing) {
      return reply.conflict("User with this wallet already exists");
    }

    const user = await prisma.user.create({
      data: { wallet, name },
    });

    const token = app.jwt.sign({ sub: user.id, wallet: user.wallet });

    return reply.code(201).send({ user, token });
  });

  app.post<{ Body: LoginBody }>("/login", { schema: loginSchema }, async (request, reply) => {
    const { wallet } = request.body;

    const user = await prisma.user.findUnique({ where: { wallet } });
    if (!user) {
      return reply.notFound("User not found, register first");
    }

    const token = app.jwt.sign({ sub: user.id, wallet: user.wallet });

    return reply.send({ user, token });
  });
}
