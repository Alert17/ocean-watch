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

const server = createServer(yoga);

server.listen(config.port, () => {
  console.log(`GraphQL server running at http://localhost:${config.port}/graphql`);
});
