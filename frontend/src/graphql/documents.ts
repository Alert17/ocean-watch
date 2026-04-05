/**
 * GraphQL operations aligned with the indexer schema
 * (https://indexer.oceanwatch.xyz/graphql — read-only Query; no mutations).
 * Sighting writes use REST (`submitSightingToApi` in `lib/api.ts`).
 */

export const SIGHTING_FIELDS = /* GraphQL */ `
  fragment SightingFields on Sighting {
    id
    latitude
    longitude
    species
    count
    behavior
    observedAt
    createdAt
    comment
    mediaUrl
    wallet
    sequenceNumber
    consensusTimestamp
  }
`;

/** Paginated list with optional filter (see `SightingsFilter` on the server). */
export const SIGHTINGS_QUERY = /* GraphQL */ `
  ${SIGHTING_FIELDS}
  query Sightings($limit: Int = 100, $offset: Int = 0, $filter: SightingsFilter) {
    sightings(limit: $limit, offset: $offset, filter: $filter) {
      items {
        ...SightingFields
      }
      total
      hasMore
    }
  }
`;

export const SIGHTING_QUERY = /* GraphQL */ `
  ${SIGHTING_FIELDS}
  query Sighting($id: String!) {
    sighting(id: $id) {
      ...SightingFields
    }
  }
`;

export const SIGHTINGS_BY_IDS_QUERY = /* GraphQL */ `
  ${SIGHTING_FIELDS}
  query SightingsByIds($ids: [String!]!) {
    sightingsByIds(ids: $ids) {
      ...SightingFields
    }
  }
`;
