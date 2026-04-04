import { PrivateKey } from "@hashgraph/sdk";

const API = "https://api.oceanwatch.xyz";
const wallet = "0.0.8509809";
const privKey = PrivateKey.fromStringECDSA("8f5ca51501b766d8b1e2e5a1d10d9a9f113d7ecddde5ae6b888dc1503c22c95a");

// Step 1: Get challenge
const challengeRes = await fetch(API + "/auth/challenge", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ wallet }),
});
const challenge = await challengeRes.json() as any;
console.log("1. Challenge OK, nonce:", challenge.nonce?.substring(0, 16) + "...");

// Step 2: Sign
const message = challenge.message;
const messageBytes = new Uint8Array(Buffer.from(message, "utf-8"));
const signatureBytes = privKey.sign(messageBytes);
const signature = Buffer.from(signatureBytes).toString("hex");

// Local verify
console.log("2. Local verify:", privKey.publicKey.verify(messageBytes, signatureBytes));

// Step 3: Auth verify
const verifyRes = await fetch(API + "/auth/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ wallet, nonce: challenge.nonce, signature, name: "TestDiver" }),
});
const auth = await verifyRes.json() as any;
console.log("3. Auth:", auth.token ? "OK ✅" : "FAILED ❌", JSON.stringify(auth, null, 2));

if (!auth.token) process.exit(1);
const jwt = auth.token;

// Step 4: Create sighting
const sightingRes = await fetch(API + "/sightings", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer " + jwt },
  body: JSON.stringify({
    latitude: 20.4326,
    longitude: -87.0087,
    species: "whale_shark",
    count: 1,
    behavior: "feeding",
    observedAt: new Date().toISOString(),
    comment: "Test sighting from new account"
  }),
});
const sighting = await sightingRes.json() as any;
console.log("4. Sighting:", sighting.sighting ? "OK ✅" : "FAILED ❌", JSON.stringify(sighting, null, 2));

// Step 5: Balance
const balanceRes = await fetch(API + "/user/balance", { headers: { Authorization: "Bearer " + jwt } });
const balance = await balanceRes.json();
console.log("5. Balance:", JSON.stringify(balance));

// Step 6: Profile
const profileRes = await fetch(API + "/user/profile", { headers: { Authorization: "Bearer " + jwt } });
const profile = await profileRes.json();
console.log("6. Profile:", JSON.stringify(profile));

// Step 7: GraphQL
const gqlRes = await fetch("https://indexer.oceanwatch.xyz/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: `{ sightings(limit: 1, wallet: "${wallet}") { items { id species wallet comment } } }` }),
});
const gql = await gqlRes.json();
console.log("7. GraphQL:", JSON.stringify(gql, null, 2));

console.log("\n✅ Full flow complete!");
