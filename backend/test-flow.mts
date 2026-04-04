import { PrivateKey } from "@hashgraph/sdk";

const API = "https://api.oceanwatch.xyz";
const operatorId = "0.0.8499986";
const operatorKey = PrivateKey.fromStringECDSA("0x76e0a77a6634ed9850f7de763ce8138644403c42db1bda517461e5b496f703bc");

// Step 1: Get challenge
const challengeRes = await fetch(API + "/auth/challenge", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ wallet: operatorId }),
});
const challenge = await challengeRes.json();
console.log("1. Challenge:", JSON.stringify(challenge, null, 2));

// Step 2: Sign
const messageBytes = new Uint8Array(Buffer.from(challenge.message, "utf-8"));
const signatureBytes = operatorKey.sign(messageBytes);
const signature = Buffer.from(signatureBytes).toString("hex");

// Step 3: Verify & get JWT
const verifyRes = await fetch(API + "/auth/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ wallet: operatorId, nonce: challenge.nonce, signature, name: "TestUser" }),
});
const verifyData = await verifyRes.json();
console.log("2. Auth:", JSON.stringify(verifyData, null, 2));

if (!verifyData.token) { console.log("AUTH FAILED, stopping"); process.exit(1); }
const jwt = verifyData.token;

// Step 4: Create sighting
const sightingRes = await fetch(API + "/sightings", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer " + jwt },
  body: JSON.stringify({
    latitude: 20.4326,
    longitude: -87.0087,
    species: "whale_shark",
    count: 2,
    behavior: "feeding",
    observedAt: new Date().toISOString(),
    comment: "Flow test"
  }),
});
const sighting = await sightingRes.json();
console.log("3. Sighting:", JSON.stringify(sighting, null, 2));

// Step 5: Check balance
const balanceRes = await fetch(API + "/user/balance", {
  headers: { Authorization: "Bearer " + jwt },
});
const balance = await balanceRes.json();
console.log("4. Balance:", JSON.stringify(balance, null, 2));

// Step 6: Check profile
const profileRes = await fetch(API + "/user/profile", {
  headers: { Authorization: "Bearer " + jwt },
});
const profile = await profileRes.json();
console.log("5. Profile:", JSON.stringify(profile, null, 2));

// Step 7: GraphQL check
const gqlRes = await fetch("https://indexer.oceanwatch.xyz/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "{ sightings(limit: 1) { items { id species wallet comment } } }" }),
});
const gql = await gqlRes.json();
console.log("6. GraphQL:", JSON.stringify(gql, null, 2));
