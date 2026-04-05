# OceanWatch — Mar Sustentable Shark Sighting Reporter

> Citizen-science platform for reporting shark sightings around Cozumel, Mexico. Every verified sighting is anchored to the Hedera network and rewarded with SHARK tokens (HTS), turning divers and locals into a distributed sensor network for marine conservation.

Built at **ETHGlobal Cannes** for [Mar Sustentable](https://marsustentable.org) and marine biologist Nadia Rubio.

---

## Stack

**Distributed Ledger**
- Hedera Hashgraph (Testnet) — Hedera Consensus Service (HCS) for the immutable sighting log, Hedera Token Service (HTS) for SHARK rewards, Hedera Mirror Node REST API for historical topic reads
- `@hashgraph/sdk` — transaction signing, topic submit, token transfer
- `@hashgraph/hedera-wallet-connect` + WalletConnect v2 — in-browser wallet pairing (HashPack, Blade, Kabila)

**Identity**
- Worldcoin World ID (`@worldcoin/idkit`) — Sybil-resistant proof-of-personhood, one verified human per SHARK reward stream

**Backend**
- Node.js 20 + TypeScript 5.9
- Fastify 5 (`@fastify/jwt`, `@fastify/multipart`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/swagger`)
- Prisma 7 ORM + PostgreSQL 16
- Pinata SDK — IPFS pinning for sighting photos

**Indexer**
- Node.js 20 + TypeScript
- GraphQL Yoga 5 — public read API at `/graphql`
- Hedera Mirror Node polling — materialises HCS topic messages into an in-memory store

**Frontend**
- React 18 + TypeScript, Vite 6
- Tailwind CSS 3
- React Router 7, TanStack Query 5, React Hook Form + Zod
- Leaflet 1.9 — real-time sighting map
- graphql-request — indexer client

**Infrastructure**
- Docker + Docker Compose
- Nginx (reverse proxy, TLS termination via Let's Encrypt)
- Hetzner Cloud (Ubuntu VPS)
- GitHub Actions CI/CD — build on `main`, SSH deploy via `appleboy/ssh-action`

---

## Architecture

```
                +----------------------+
                |   React PWA (Vite)   |
                |  app.oceanwatch.xyz  |
                +----------+-----------+
                           |
               REST (JWT)  |  GraphQL (public)
                           v
        +------------------+------------------+
        |                                     |
+-------+--------+                  +---------+---------+
|  Fastify API   |                  |  GraphQL Indexer  |
|   (backend)    |                  |     (indexer)     |
+---+------+-----+                  +---------+---------+
    |      |                                  ^
    |      |                                  | polls
    |      v                                  |
    |  PostgreSQL                    Hedera Mirror Node
    |  (users, rewards,              (testnet.mirrornode
    |   auth_challenges)              .hedera.com)
    |
    v
  Hedera Testnet
  - HCS topic (sightings)
  - HTS SHARK token (rewards)
  - Pinata / IPFS (media CIDs referenced in HCS messages)
```

### Sighting flow

1. User authenticates a Hedera account via a wallet-signed challenge (`auth_challenges`) and proves humanness with World ID (nullifier stored in `users.worldid_nullifier`).
2. Frontend uploads the photo to the backend (`POST /upload`); backend pins it to IPFS via Pinata and returns a CID.
3. Frontend submits the sighting payload (`POST /sightings`). Backend:
   - Validates the schema.
   - Submits a JSON message to the Hedera Consensus Service topic (`HEDERA_TOPIC_ID`).
   - Transfers a fixed amount of SHARK (HTS token `HEDERA_TOKEN_ID`) from the treasury to the reporter's account.
   - Records the reward in the `rewards` table keyed by consensus sequence number.
4. The indexer polls the Hedera Mirror Node, decodes topic messages, and exposes them through the GraphQL API consumed by the map and fieldbook views.

---

## Repository layout

```
ocean-watch/
  backend/        Fastify REST API, Prisma schema, Hedera + IPFS integration
  indexer/        GraphQL Yoga server backed by Hedera Mirror Node
  frontend/       React + Vite PWA
  landing/        Static marketing page (oceanwatch.xyz)
  nginx/          Reverse proxy config (TLS, vhost routing)
  docker-compose.yml
  .github/workflows/   CI/CD pipelines
```

Each service has its own README with details.

---

## Local development

Prerequisites: Node.js 20+, Docker, a Hedera testnet account, a WalletConnect project ID, a Worldcoin app ID, and a Pinata JWT.

```bash
cp .env.example .env
# fill in HEDERA_*, JWT_SECRET, PINATA_JWT, WORLDID_*, VITE_* values

docker compose up -d postgres
cd backend  && npm install && npx prisma migrate deploy && npm run dev
cd indexer  && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Full stack:

```bash
docker compose up -d --build
```

---

## Deployment

The `main` branch is continuously deployed to the Hetzner host behind `*.oceanwatch.xyz`:

- `oceanwatch.xyz` — landing page (Nginx static)
- `app.oceanwatch.xyz` — React PWA
- `api.oceanwatch.xyz` — Fastify backend
- `indexer.oceanwatch.xyz/graphql` — GraphQL indexer

CI runs type-checks and Docker builds on every push; on success, a second job SSHs into the server, pulls the latest commit, and runs `docker compose up -d --build`.

---

## License

MIT
