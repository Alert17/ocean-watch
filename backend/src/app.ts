import Fastify from "fastify";
import sensible from "./plugins/sensible";

const app = Fastify({ logger: true });

app.register(sensible);

app.get("/health", async () => ({ status: "ok" }));

export default app;
