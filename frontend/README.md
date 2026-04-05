# OceanWatch Frontend

> React + Vite progressive web app for divers and locals in Cozumel. Users connect a Hedera wallet, verify humanness with Worldcoin, report shark sightings with photos and GPS, view the community map, and collect SHARK (HTS) rewards.

---

## Stack

**Framework**
- React 18 + TypeScript 5.6
- Vite 6 (ES modules, fast HMR, production build via `tsc -b && vite build`)
- React Router 7

**Styling**
- Tailwind CSS 3
- PostCSS + Autoprefixer

**State & data**
- TanStack Query 5 — server state, caching, retries
- React Hook Form 7 + Zod 3 — form state and schema validation
- graphql-request 7 — indexer client for map and fieldbook

**Hedera**
- `@hashgraph/sdk` ^2.81
- `@hashgraph/hedera-wallet-connect` ^2.1 — WalletConnect v2 adapter for Hedera
- `@walletconnect/modal` — pairing modal
- `@hiero-ledger/proto` — low-level protobufs
- Supports HashPack, Blade, Kabila and any WalletConnect v2 Hedera wallet

**Identity**
- `@worldcoin/idkit` ^2.4 — World ID widget for Sybil-resistant proof of personhood

**Maps & media**
- Leaflet 1.9 — sighting map with clustering
- `qrcode.react` — pairing QR for wallet connect on mobile

**Tooling**
- MSW 2 — request mocking for local dev and demos
- TypeScript strict mode with `noUnusedLocals`

---

## Project layout

```
frontend/
  index.html
  vite.config.ts
  tailwind.config.js
  tsconfig.json, tsconfig.app.json, tsconfig.node.json
  public/                   static assets, MSW worker
  src/
    main.tsx                React entry, router, providers
    App.tsx
    pages/                  route-level views (Map, Fieldbook, Report, Profile, ...)
    components/             shared UI (BottomNav, forms, cards, ...)
    contexts/               auth, wallet, theme providers
    hooks/                  useAuth, useWallet, useSightings, ...
    lib/                    Hedera client, IPFS helpers, fetch wrapper
    graphql/
      enums.ts              Species / Behavior enums (source of truth for UI)
      queries.ts            indexer GraphQL documents
    constants/
      fieldbook.ts          species labels, metadata (kept in sync with enums)
    data/                   mock datasets (dev + demo)
    mocks/                  MSW handlers
    index.css               Tailwind entry
```

---

## Key flows

**Authentication**
1. User connects wallet via WalletConnect v2.
2. Frontend calls `POST /auth/challenge` to get a nonce.
3. Wallet signs the nonce; frontend posts the signature to `POST /auth/verify`.
4. Backend returns a JWT stored in memory (+ refreshable).

**Humanness (World ID)**
1. `IDKitWidget` opens the Worldcoin flow.
2. Proof is forwarded to `POST /worldid/verify`.
3. Backend calls Worldcoin cloud verification and marks the user as verified.

**Sighting submission**
1. User fills the form (species, behavior, count, comment) and takes a photo.
2. Photo is uploaded to `POST /upload` which returns an IPFS CID.
3. Payload is posted to `POST /sightings`.
4. On success, TanStack Query invalidates the indexer queries so the map and fieldbook update on the next poll.

**Reads**
- All list/map views fetch from the indexer via `graphql-request`, not the backend. This decouples heavy public reads from the write API.

---

## Environment (Vite)

Compile-time variables, injected via `VITE_*`:

| Variable                         | Description                                              |
| -------------------------------- | -------------------------------------------------------- |
| `VITE_API_URL`                   | Backend base URL (e.g. `https://api.oceanwatch.xyz`)     |
| `VITE_GRAPHQL_URL`               | Indexer GraphQL endpoint                                 |
| `VITE_HEDERA_NETWORK`            | `testnet` or `mainnet`                                   |
| `VITE_HEDERA_TOKEN_ID`           | SHARK HTS token id                                       |
| `VITE_WALLETCONNECT_PROJECT_ID`  | WalletConnect Cloud project id                           |
| `VITE_WORLDID_APP_ID`            | Worldcoin app id                                         |
| `VITE_WORLDID_ACTION`            | Worldcoin action (default `verify-human`)                |

---

## Scripts

```bash
npm run dev       # vite dev server with HMR
npm run build     # tsc -b && vite build
npm run preview   # vite preview of the production bundle
```

---

## Notes

- `src/graphql/enums.ts` is the canonical list of `Species` and `Behavior` values on the client. Any change must be mirrored in `backend/src/types/sighting.ts` and `indexer/src/types.ts`, and every `Record<Species, ...>` (notably `constants/fieldbook.ts`) must be updated for TypeScript exhaustiveness.
- `tsconfig.app.json` has `noUnusedLocals: true`; dead imports and helpers will break the production build.
- Leaflet assets are imported locally and must stay bundled — do not switch to a CDN unless Content Security Policy is updated.
