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
const challenge = await challengeRes.json() as any;
console.log("1. Challenge:", challenge.nonce);

// Step 2: Sign exactly like server expects
const message = `Sign this message to verify wallet ownership for OceanWatch:\n${challenge.nonce}`;
const messageBytes = new Uint8Array(Buffer.from(message, "utf-8"));
const signatureBytes = operatorKey.sign(messageBytes);
const signature = Buffer.from(signatureBytes).toString("hex");
console.log("2. Signature length:", signatureBytes.length, "hex length:", signature.length);

// Verify locally first
const pubKey = operatorKey.publicKey;
const verified = pubKey.verify(messageBytes, signatureBytes);
console.log("3. Local verify:", verified);

// Step 3: Send to server
const verifyRes = await fetch(API + "/auth/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ wallet: operatorId, nonce: challenge.nonce, signature, name: "TestUser" }),
});
const verifyData = await verifyRes.json() as any;
console.log("4. Server response:", JSON.stringify(verifyData, null, 2));

if (!verifyData.token) {
  console.log("AUTH FAILED");
  process.exit(1);
}

const jwt = verifyData.token;

// Step 5: Create sighting
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
    comment: "Flow test v2"
  }),
});
const sighting = await sightingRes.json();
console.log("5. Sighting:", JSON.stringify(sighting, null, 2));

// Step 6: Balance
const balanceRes = await fetch(API + "/user/balance", { headers: { Authorization: "Bearer " + jwt } });
console.log("6. Balance:", JSON.stringify(await balanceRes.json(), null, 2));

// Step 7: Profile
const profileRes = await fetch(API + "/user/profile", { headers: { Authorization: "Bearer " + jwt } });
console.log("7. Profile:", JSON.stringify(await profileRes.json(), null, 2));

// Step 8: GraphQL
const gqlRes = await fetch("https://indexer.oceanwatch.xyz/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "{ sightings(limit: 1) { items { id species wallet comment } } }" }),
});
console.log("8. GraphQL:", JSON.stringify(await gqlRes.json(), null, 2));
