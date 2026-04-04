export const typeDefs = /* GraphQL */ `
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

  type Query {
    sightings: [Sighting!]!
    sighting(id: String!): Sighting
  }
`;
