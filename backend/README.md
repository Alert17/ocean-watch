# OceanWatch Backend

> Fastify REST API that authenticates Hedera wallets, verifies Worldcoin proofs, pins sighting media to IPFS, writes sightings to the Hedera Consensus Service, and dispenses SHARK (HTS) rewards from the treasury.

---

## Stack

**Runtime**
- Node.js 20
- TypeScript 5.9 (strict mode)
- Fastify 5

**Hedera**
- `@hashgraph/sdk` ^2.81 — Hedera Testnet client
  - Hedera Consensus Service (HCS) — `TopicMessageSubmitTransaction` for sightings
  - Hedera Token Service (HTS) — `TransferTransaction` for SHARK rewards
  - Hedera Mirror Node REST API — public key lookups, account validation
- Custom retry wrapper for transient `BUSY` / network errors

**Data**
- PostgreSQL 16
- Prisma 7 ORM (`@prisma/client`, `@prisma/adapter-pg`)
- `pg` 8 driver

**Auth & Identity**
- `@fastify/jwt` — session tokens signed with `JWT_SECRET`
- Hedera wallet signature challenge flow (nonce stored in `auth_challenges`)
- Worldcoin World ID cloud verification — nullifier persisted in `users.worldid_nullifier`

**Media**
- `@fastify/multipart` — multipart upload
- `pinata` SDK — pinning to IPFS via Pinata gateway

**Fastify plugins**
- `@fastify/cors`, `@fastify/rate-limit`, `@fastify/sensible`
- `@fastify/swagger` + `@fastify/swagger-ui` — OpenAPI at `/docs`

---

## Project layout

```
backend/
  prisma/
    schema.prisma           users, rewards, auth_challenges
  src/
    server.ts               Fastify bootstrap
    app.ts                  plugin + route autoload
    db.ts                   Prisma client singleton
    config/                 env loading + validation
    plugins/
      authenticate.ts       JWT guard (fastify-plugin)
      sensible.ts
    routes/
      auth.ts               /auth/challenge, /auth/verify
      worldid.ts            /worldid/verify
      user.ts               /me
      upload.ts             /upload (multipart -> IPFS)
      sightings.ts          /sightings (POST/GET)
      token.ts              /token/balance
    services/
      auth.service.ts       nonce lifecycle, signature verification
      user.service.ts
      worldid.service.ts    Worldcoin cloud verify call
      sighting.service.ts   orchestrates HCS submit + reward payout
    hedera/
      client.ts             Hedera SDK client factory
      topic.ts              HCS submit + message decoding
      treasury.ts           HTS transfer from treasury
      rewards.ts            reward amount policy
      retry.ts              exponential backoff for SDK calls
      types.ts
    ipfs/                   Pinata client wrapper
    schemas/                JSON schemas for Fastify validation
    types/
      sighting.ts           Species / Behavior enums (must match frontend + indexer)
    generated/prisma/       Prisma client output
  Dockerfile
  tsconfig.json
```

---

## Data model

```prisma
model User {
  id              String   @id @default(uuid())
  wallet          String   @unique           // Hedera Account ID, 0.0.xxxx
  name            String?
  publicKey       String?                    // cached from Mirror Node
  worldIdHash     String?  @unique           // World ID nullifier
  worldIdVerified Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Reward {
  id            String   @id @default(uuid())
  sightingId    String   @unique            // HCS sequence number
  wallet        String
  amount        Int                         // HTS token units (with decimals)
  transactionId String
  createdAt     DateTime @default(now())
}

model AuthChallenge {
  id        String   @id @default(uuid())
  wallet    String
  nonce     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## HTTP API

| Method | Path                | Auth | Purpose                                                              |
| ------ | ------------------- | ---- | -------------------------------------------------------------------- |
| POST   | `/auth/challenge`   | —    | Issue a nonce for a given Hedera wallet                              |
| POST   | `/auth/verify`      | —    | Verify the wallet-signed nonce and return a JWT                      |
| POST   | `/worldid/verify`   | JWT  | Verify a World ID proof and mark the user as humanness-verified      |
| GET    | `/me`               | JWT  | Current user profile                                                 |
| POST   | `/upload`           | JWT  | Multipart upload; pins to IPFS and returns `{ cid, url }`            |
| POST   | `/sightings`        | JWT  | Submit sighting to HCS topic, pay SHARK reward                       |
| GET    | `/sightings`        | —    | Proxy/aggregate recent sightings (for admin/dev)                     |
| GET    | `/token/balance`    | JWT  | Query SHARK balance for the authenticated wallet via Mirror Node     |
| GET    | `/docs`             | —    | Swagger UI                                                           |

---

## Environment

| Variable                       | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `PORT`                         | Listen port (default 3001)                                         |
| `DATABASE_URL`                 | Postgres connection string                                         |
| `JWT_SECRET`                   | HS256 secret for session tokens                                    |
| `HEDERA_OPERATOR_ID`           | Hedera account paying transaction fees                             |
| `HEDERA_OPERATOR_KEY`          | Private key for the operator                                       |
| `HEDERA_TOPIC_ID`              | HCS topic that stores sightings                                    |
| `HEDERA_TOKEN_ID`              | HTS token ID for SHARK                                             |
| `HEDERA_TREASURY_ACCOUNT_ID`   | Treasury account holding SHARK supply                              |
| `HEDERA_TREASURY_KEY`          | Treasury signing key                                               |
| `HEDERA_PLATFORM_ACCOUNT_ID`   | Platform account (fee collector / admin)                           |
| `PINATA_JWT`                   | Pinata API token                                                   |
| `PINATA_GATEWAY`               | Pinata gateway host                                                |
| `WORLDID_APP_ID`               | Worldcoin app identifier                                           |
| `WORLDID_RP_ID`                | Worldcoin relying-party id                                         |
| `WORLDID_ACTION`               | Action string bound to the proof (default `verify-human`)          |

---

## Scripts

```bash
npm run dev        # tsx watch src/server.ts
npm run build:ts   # tsc
npm start          # build + node dist/server.js
npx prisma migrate deploy
npx prisma studio
```

---

## Notes

- `src/types/sighting.ts` contains the `Species` and `Behavior` enums that must stay in sync with `frontend/src/graphql/enums.ts` and `indexer/src/types.ts`. Adding a species requires updating all three.
- HCS payloads are plain JSON (UTF-8). The indexer is the source of truth for reads; the backend only writes.
- Rewards are idempotent on `sightingId` (unique constraint) so retries cannot double-pay.
