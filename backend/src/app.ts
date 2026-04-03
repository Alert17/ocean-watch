import Fastify from "fastify";
import sensible from "./plugins/sensible";
import { sightingsRoutes } from "./routes/sightings";

const app = Fastify({ logger: true });

app.register(sensible);
app.register(sightingsRoutes, { prefix: "/sightings" });

app.get("/health", async () => ({ status: "ok" }));

export default app;
