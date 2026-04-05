# OceanWatch Frontend — Merge Guide

> Reference document for integrating `frontend-maps` into `origin/main`.
> Describes how `origin/main` works, what this branch adds, and how to keep everything functional.

---

## 1. How `origin/main` works

### 1.1 Entry point

```
src/main.tsx
  └── (optional) MSW service worker if VITE_USE_MSW=true
  └── <StrictMode><App /></StrictMode>
```

### 1.2 Providers and routing (`src/App.tsx`)

```
<QueryClientProvider>           ← TanStack React Query (staleTime 60 s)
  <WalletAuthProvider>          ← single source of truth for all auth state
    <BrowserRouter>
      Routes:
        /             HomePage
        /report       ReportPage
        /history      HistoryPage
        /donate       DonatePage
        /my-account   MyAccountPage
        /congrats     CongratsPage
        *             → /
```

### 1.3 Auth architecture

Two-step flow, entirely handled in `src/contexts/WalletAuthContext.tsx`:

```
Step 1 — Hedera WalletConnect
  getOrInitConnector()          module-level singleton, StrictMode-safe
    └── new DAppConnector(...)  PROJECT_ID from VITE_WALLETCONNECT_PROJECT_ID
    └── connector.init()
  connectAndAuth()
    1. openModal() → accountId (0.0.xxxxx)
    2. POST /auth/challenge  → { nonce, message }
    3. connector.signMessage → signatureMap (base64)
    4. base64StringToSignatureMap + extractFirstSignature → hex
    5. POST /auth/verify     → { token, user }
    6. store JWT + wallet + name in localStorage + React state

Step 2 — World ID
  IDKitWidget (VerificationLevel.Device)
    handleVerify → POST /worldid/verify → { verified, user }
    onSuccess    → auth.setWorldIdVerified() → navigate /report
```

`isReady = !!jwt && isWorldIdVerified` — used to guard the Report page.

### 1.4 `useAuth` shim (`src/hooks/useAuth.ts`)

```ts
export { useWalletAuth as useAuth } from "../contexts/WalletAuthContext";
export type { WalletAuthState as AuthState } from "../contexts/WalletAuthContext";
```

All pages import `useAuth`. Under the hood they all get `useWalletAuth` from the context.
**`WalletAuthProvider` must wrap the entire router for this to work.**

### 1.5 Key `WalletAuthState` fields

| Field | Type | Used by |
|---|---|---|
| `isInitializing` | `boolean` | MyAccount (disable button while SDK loads) |
| `connectedAccountId` | `string \| null` | MyAccount (show intermediate state) |
| `jwt` | `string \| null` | Report (guard + attach Bearer) |
| `wallet` | `string \| null` | MyAccount (display) |
| `name` | `string \| null` | MyAccount (display) |
| `isReady` | `boolean` | Report (redirect if false) |
| `connectAndAuth()` | `async` | MyAccount Step 1 button |
| `disconnect()` / `logout()` | `async` | MyAccount disconnect button |
| `setWorldIdVerified()` | `void` | MyAccount World ID callback |

### 1.6 WalletConnect initialisation — critical notes

- `PROJECT_ID` is read **at module load time** from `VITE_WALLETCONNECT_PROJECT_ID`.
- If the variable is missing/undefined, `DAppConnector` initialises silently but
  `openModal()` throws `"WalletConnect is not initialized"` at connect time.
- **Fix**: always copy `.env.example` → `.env` before starting the dev server.
- The `sharedConnector` / `sharedConnectorInitPromise` singleton ensures React
  StrictMode double-mounts do not create two WalletConnect Core instances.

### 1.7 Environment variables (`.env.example`)

```
VITE_API_URL=https://api.oceanwatch.xyz
VITE_GRAPHQL_URL=https://indexer.oceanwatch.xyz/graphql
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_TOKEN_ID=0.0.8510011
VITE_WALLETCONNECT_PROJECT_ID=8774a8a476c10ff8ed1ab15ced2da021   ← required
VITE_WORLDID_APP_ID=app_5e00cf5d85b7fa221f91d0de558c70c3
VITE_WORLDID_ACTION=verify-human
VITE_USE_MSW=false
VITE_TREASURY_ACCOUNT_ID=0.0.8506813
```

> **Never commit `.env`.** The `.gitignore` already excludes it.

### 1.8 Navigation structure (main)

`BottomNav`: Home · Report · History · Donate + Account button (separate)  
`Layout` header: Account button (top-right) → navigates to `/my-account`

---

## 2. What this branch (`frontend-maps`) adds

### 2.1 New pages

| Route | File | Description |
|---|---|---|
| `/map` | `src/pages/MapPage.tsx` | World Leaflet map, date/species filters, mock sightings |
| `/faq` | `src/pages/FaqPage.tsx` | 4-section FAQ accordion (15 questions) |

### 2.2 New data files

| File | Purpose |
|---|---|
| `src/data/cozumelLandGeoJSON.ts` | Cozumel + Yucatan polygons — used on Map page |
| `src/data/submitZoneLandGeoJSON.ts` | High-res ~48-vertex Cozumel polygon — used on Report page |
| `src/data/mockMapSightings.ts` | 27 sea + 1 land sightings for the Map page |

### 2.3 New lib files

| File | Purpose |
|---|---|
| `src/lib/landValidator.ts` | `isOnLand()`, `snapToSea()`, `classifySightings()` |
| `src/lib/geo.ts` | Ray-casting `pointInPolygon()` |

### 2.4 Modified files vs main

| File | Change |
|---|---|
| `src/App.tsx` | Added `/map` + `/faq` routes; kept `WalletAuthProvider` + `/donate` |
| `src/components/BottomNav.tsx` | Added Map entry between Report and History |
| `src/pages/Report.tsx` | Added `isOnLand` check on map pick; land error banner + submit guard |
| `src/contexts/WalletAuthContext.tsx` | Delegated init to `getHederaConnector()` from `hederaWallet.ts` (single DAppConnector singleton, validates PROJECT_ID, resets on failure) |

### 2.5 Removed vs main

| File | Reason |
|---|---|
| `src/pages/WorldId.tsx` | Deleted by main; World ID flow is in MyAccount |

---

## 3. Getting started (dev)

```bash
# 1. Install dependencies
npm install

# 2. Create local env (do NOT commit)
cp .env.example .env
```

Then edit `.env` for local dev — two values must differ from the example:
```
# Route GraphQL through the dev server so MSW can intercept it
VITE_GRAPHQL_URL=http://localhost:5173/graphql

# Enable MSW so History and other GraphQL consumers get mock data
VITE_USE_MSW=true
```

> **Why**: `shouldMockGraphqlRequest()` in `src/mocks/handlers.ts` only intercepts
> **same-origin** requests (`url.origin === self.location.origin`). The default
> `https://indexer.oceanwatch.xyz/graphql` is a different origin — MSW passes it through
> and the real indexer is unreachable in local dev → History shows "Could not load sightings".

```bash
# 3. Start dev server
npm run dev
```

---

## 4. Auth flow — step by step (merged version)

```
User opens /my-account
  ↓
WalletAuthProvider already initialising DAppConnector
  (getHederaConnector() validates PROJECT_ID, checks walletConnectClient)
  ↓
User clicks "Connect Wallet"
  → connectAndAuth():
      openModal() → HashPack / Blade selects account
      POST /auth/challenge
      signMessage
      POST /auth/verify → JWT stored
  ↓
jwt is now set → MyAccount shows Step 2
  ↓
User clicks "Continue with World ID"
  → IDKitWidget → POST /worldid/verify
  → onSuccess → setWorldIdVerified() → navigate /report
  ↓
isReady = true → Report page accessible
```

### Dev shortcuts (only rendered when `import.meta.env.DEV`)

- **⚙ Mock World ID (dev only)** — calls `POST /worldid/dev-mock`, skips IDKit widget
- No mock wallet connect — use a real WalletConnect-compatible wallet in dev

---

## 5. Map page — architecture

```
MapPage
  allSightings = MOCK_MAP_SIGHTINGS          ← swap for fetchSightings() when indexer is live
  afterFilters = date + species filter        ← client-side only
  { sea: filtered } = classifySightings(afterFilters, COZUMEL_LAND_GEOJSON)
  WorldMap(filtered)                          ← Leaflet, WORLD_ZOOM=4, centre Cozumel
```

**To switch to live data**, replace in `MapPage.tsx`:
```tsx
// Mock:
const allSightings = MOCK_MAP_SIGHTINGS;

// Real (once indexer is live):
const { data: allSightings = [] } = useQuery({ queryKey: ["sightings"], queryFn: fetchSightings });
```

---

## 6. Report page — land validation

```
User taps map
  → onMapChange(pick)
      isOnLand(pick.lng, pick.lat, SUBMIT_ZONE_LAND_GEOJSON.features)
        true  → setLandError("This point is on land...")
        false → setLandError(null)
Submit button disabled while landError !== null
```

`SUBMIT_ZONE_LAND_GEOJSON` uses a ~48-vertex conservative Cozumel outline
(slightly inset from the actual coast to avoid false positives near the shore)
plus the Yucatan Peninsula strip to block mainland pins.

---

## 7. Known TODOs

- `mediaUrl` in Report: files are previewed locally but NOT uploaded. Requires IPFS upload implementation.
- Map data: `MOCK_MAP_SIGHTINGS` must be replaced with real indexer data.
- `src/lib/submitSighting.ts` (from an older branch): unused, can be deleted.

---

## 8. Routing summary (merged)

| Path | Page | Auth required |
|---|---|---|
| `/` | Home | No |
| `/report` | Report | Yes (`isReady`) |
| `/history` | History | No |
| `/map` | Map | No |
| `/faq` | FAQ | No |
| `/donate` | Donate | No |
| `/my-account` | MyAccount | No |
| `/congrats` | Congrats | No |
| `*` | → `/` | — |
