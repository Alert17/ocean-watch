import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import sensible from "./plugins/sensible";
import { sightingsRoutes } from "./routes/sightings";
import { tokenRoutes } from "./routes/token";

const app = Fastify({ logger: true });

app.register(swagger, {
  openapi: {
    info: {
      title: "OceanWatch API",
      version: "0.1.0",
      description: "Citizen science platform for marine life sightings on Hedera",
    },
  },
});

app.register(swaggerUi, {
  routePrefix: "/docs",
});

app.register(cors, { origin: true });
app.register(sensible);
app.register(sightingsRoutes, { prefix: "/sightings" });
app.register(tokenRoutes, { prefix: "/token" });

app.get("/health", async () => ({ status: "ok" }));

export default app;
