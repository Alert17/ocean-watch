import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import sensible from "./plugins/sensible";
import { sightingsRoutes } from "./routes/sightings";

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

app.register(sensible);
app.register(sightingsRoutes, { prefix: "/sightings" });

app.get("/health", async () => ({ status: "ok" }));

export default app;
