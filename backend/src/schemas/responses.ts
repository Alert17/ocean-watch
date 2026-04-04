const userObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    wallet: { type: "string" },
    name: { type: "string", nullable: true },
    publicKey: { type: "string", nullable: true },
    worldIdVerified: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const sightingObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    latitude: { type: "number" },
    longitude: { type: "number" },
    species: { type: "string" },
    count: { type: "integer" },
    behavior: { type: "string" },
    observedAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    comment: { type: "string", nullable: true },
    mediaUrl: { type: "string", nullable: true },
    wallet: { type: "string" },
  },
};

const rewardObject = {
  type: "object",
  nullable: true,
  properties: {
    tokensMinted: { type: "number" },
    recipientAccount: { type: "string" },
    transactionId: { type: "string" },
  },
};

export const challengeResponse = {
  200: {
    type: "object",
    properties: {
      nonce: { type: "string" },
      message: { type: "string" },
      expiresAt: { type: "string", format: "date-time" },
    },
  },
};

export const verifyAuthResponse = {
  200: {
    type: "object",
    properties: {
      user: userObject,
      token: { type: "string" },
    },
  },
};

export const createSightingResponse = {
  201: {
    type: "object",
    properties: {
      sighting: sightingObject,
      sequenceNumber: { type: "string", nullable: true },
      reward: rewardObject,
      rewardError: { type: "string", nullable: true },
    },
  },
};

export const tokenPriceResponse = {
  200: {
    type: "object",
    properties: {
      treasuryBalanceHbar: { type: "number" },
      circulatingSupply: { type: "number" },
      pricePerToken: { type: "number" },
    },
  },
};

export const tokenBalanceResponse = {
  200: {
    type: "object",
    properties: {
      accountId: { type: "string" },
      balance: { type: "number" },
    },
  },
};

export const donateResponse = {
  200: {
    type: "object",
    properties: {
      totalHbar: { type: "number" },
      treasuryHbar: { type: "number" },
      platformHbar: { type: "number" },
      transactionId: { type: "string" },
    },
  },
};

export const redeemResponse = {
  200: {
    type: "object",
    properties: {
      hbarAmount: { type: "number" },
      tokensBurned: { type: "number" },
      newTokenPrice: { type: "number" },
      transactionId: { type: "string" },
    },
  },
};

export const profileResponse = {
  200: userObject,
};

export const userBalanceResponse = {
  200: {
    type: "object",
    properties: {
      wallet: { type: "string" },
      balance: { type: "number" },
    },
  },
};

export const userStatsResponse = {
  200: {
    type: "object",
    properties: {
      wallet: { type: "string" },
      sightingCount: { type: "integer" },
    },
  },
};

export const uploadResponse = {
  201: {
    type: "object",
    properties: {
      cid: { type: "string" },
      url: { type: "string", format: "uri" },
      filename: { type: "string" },
      mimetype: { type: "string" },
    },
  },
};

export const worldIdVerifyResponse = {
  200: {
    type: "object",
    properties: {
      verified: { type: "boolean" },
      user: userObject,
    },
  },
};

export const worldIdStatusResponse = {
  200: {
    type: "object",
    properties: {
      verified: { type: "boolean" },
    },
  },
};
