# OceanWatch Indexer

> GraphQL read API for OceanWatch sightings. Polls the Hedera Mirror Node for messages on the HCS sighting topic, decodes them, and serves a typed, filterable GraphQL endpoint consumed by the map and fieldbook views in the frontend.

---

## Stack

**Runtime**
- Node.js 20
- TypeScript 5.9

**GraphQL**
- `graphql` 16
- `graphql-yoga` 5 — HTTP + subscriptions transport, served at `/graphql`

**Hedera**
- Hedera Mirror Node REST API (`https://testnet.mirrornode.hedera.com` by default)
- Long-polling loop over `/api/v1/topics/{topicId}/messages` with cursor on `sequence_number`
- No direct `@hashgraph/sdk` dependency — the indexer is a pure read-side projection

**Config**
- `dotenv` for local development

---

## Project layout

```
indexer/
  src/
    server.ts      GraphQL Yoga HTTP server bootstrap
    schema.ts      SDL: Sighting, SightingsPage, SightingsFilter, Query
    resolvers.ts   in-memory store queries + filters
    mirror.ts      Mirror Node poller, message decoding, validation
    types.ts       Species / Behavior enums (must match backend + frontend)
    config.ts      env loader
  Dockerfile
  tsconfig.json
```

---

## Data flow

```
   Hedera Consensus Service (topic HEDERA_TOPIC_ID)
                    |
                    | written by backend on each sighting
                    v
          Hedera Mirror Node REST API
                    |
                    | polled by mirror.ts (sequence cursor)
                    v
          In-memory sighting store
                    |
                    v
          GraphQL Yoga (schema.ts + resolvers.ts)
                    |
                    v
             Frontend (graphql-request)
```

Each topic message is a JSON payload with `latitude`, `longitude`, `species`, `count`, `behavior`, `observedAt`, `comment`, `mediaUrl`, and the reporter's `wallet`. `mirror.ts` validates unknown species/behavior values against the `Species` / `Behavior` enums in `types.ts` and drops or normalises bad entries.

---

## GraphQL schema

```graphql
type Sighting {
  id: String!
  latitude: Float!
  longitude: Float!
  species: String!
  count: Int!
  behavior: String!
  observedAt: String!
  createdAt: String!
  comment: String
  mediaUrl: String
  wallet: String!
  sequenceNumber: Int!
  consensusTimestamp: String!
}

type SightingsPage {
  items: [Sighting!]!
  total: Int!
  hasMore: Boolean!
}

input SightingsFilter {
  species: String
  behavior: String
  wallet: String
  observedAtGt: String
  observedAtLt: String
  observedAtGte: String
  observedAtLte: String
}

type Query {
  sightings(limit: Int = 50, offset: Int = 0, filter: SightingsFilter): SightingsPage!
  sighting(id: String!): Sighting
  sightingsByIds(ids: [String!]!): [Sighting!]!
}
```

---

## Environment

| Variable                  | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `PORT`                    | HTTP port (default 3002)                                             |
| `HEDERA_TOPIC_ID`         | HCS topic storing sightings                                          |
| `HEDERA_MIRROR_NODE_URL`  | Mirror Node base URL (default `https://testnet.mirrornode.hedera.com`) |

---

## Scripts

```bash
npm run dev      # tsx watch src/server.ts
npm run build    # tsc
npm start        # node dist/server.js
```

Endpoint: `http://localhost:3002/graphql` (also serves the GraphiQL explorer in dev).

In production it is exposed at `https://indexer.oceanwatch.xyz/graphql` through Nginx.

---

## Notes

- The store is in-memory only. On restart the indexer replays the topic from sequence 0 via the Mirror Node, so there is no persistent database to manage.
- `src/types.ts` must stay in sync with `frontend/src/graphql/enums.ts` and `backend/src/types/sighting.ts`. Adding a species without updating the indexer means valid sightings get filtered out by `mirror.ts`.
- There is no write path here. All writes go through the backend Fastify API, which is the only service holding Hedera operator keys.
