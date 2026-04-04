import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import sensible from "./plugins/sensible";
import { config } from "./config";
import { authRoutes } from "./routes/auth";
import { sightingsRoutes } from "./routes/sightings";
import { tokenRoutes } from "./routes/token";
import { userRoutes } from "./routes/user";
import { uploadRoutes } from "./routes/upload";
import { worldIdRoutes } from "./routes/worldid";
import { MAX_FILE_SIZE, GLOBAL_RATE_LIMIT_MAX, GLOBAL_RATE_LIMIT_WINDOW } from "./config/constants";
import { prisma } from "./db";

const app = Fastify({ logger: true });

app.register(swagger, {
  openapi: {
    info: {
      title: "OceanWatch API",
      version: "0.1.0",
      description: "Citizen science platform for marine life sightings on Hedera",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

app.register(swaggerUi, {
  routePrefix: "/docs",
});

app.register(cors, { origin: true });
app.register(rateLimit, { max: GLOBAL_RATE_LIMIT_MAX, timeWindow: GLOBAL_RATE_LIMIT_WINDOW });
app.register(jwt, { secret: config.jwtSecret });
app.register(multipart, { limits: { fileSize: MAX_FILE_SIZE } });
app.register(sensible);
app.register(authRoutes, { prefix: "/auth" });
app.register(sightingsRoutes, { prefix: "/sightings" });
app.register(tokenRoutes, { prefix: "/token" });
app.register(userRoutes, { prefix: "/user" });
app.register(uploadRoutes, { prefix: "/upload" });
app.register(worldIdRoutes, { prefix: "/worldid" });

app.get("/health", async (_request, reply) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return { status: "ok" };
  } catch {
    return reply.serviceUnavailable("database unreachable");
  }
});

export default app;
