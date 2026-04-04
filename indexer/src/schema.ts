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

  input SightingsFilter {
    species: String
    behavior: String
    wallet: String
    observedAtGt: String
    observedAtLt: String
    observedAtGte: String
    observedAtLte: String
  }

  type Query {
    sightings(limit: Int = 50, offset: Int = 0, filter: SightingsFilter): SightingsPage!
    sighting(id: String!): Sighting
    sightingsByIds(ids: [String!]!): [Sighting!]!
  }
`;
