import app from "./app";
import { config } from "./config";
import { prisma } from "./db";

app.listen({ port: config.port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

async function shutdown() {
  app.log.info("Shutting down...");
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
