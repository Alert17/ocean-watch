export const SIGHTINGS_QUERY = /* GraphQL */ `
  query Sightings {
    sightings {
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
  }
`;

export const SIGHTING_QUERY = /* GraphQL */ `
  query Sighting($id: String!) {
    sighting(id: $id) {
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
  }
`;
