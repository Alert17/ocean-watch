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

  type SightingsPage {
    items: [Sighting!]!
    total: Int!
    hasMore: Boolean!
  }

  type Query {
    sightings(limit: Int = 50, offset: Int = 0): SightingsPage!
    sighting(id: String!): Sighting
  }
`;
