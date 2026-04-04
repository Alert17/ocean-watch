import { createServer } from "node:http";
import { createYoga, createSchema } from "graphql-yoga";
import { config } from "./config";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphiql: true,
  maskedErrors: process.env.NODE_ENV === "production",
});

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  yoga(req, res);
});

server.listen(config.port, () => {
  console.log(`GraphQL server running at http://localhost:${config.port}/graphql`);
});
