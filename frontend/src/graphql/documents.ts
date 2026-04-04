export const ZONES_QUERY = /* GraphQL */ `
  query Zones {
    zones {
      id
      name
      slug
      polygon
    }
  }
`;

export const MY_SIGHTINGS_QUERY = /* GraphQL */ `
  query MySightings($limit: Int) {
    mySightings(limit: $limit) {
      id
      latitude
      longitude
      species
      count
      behavior
      observedAt
      createdAt
      comment
      zoneId
      zoneName
    }
  }
`;

export const SUBMIT_SIGHTING_MUTATION = /* GraphQL */ `
  mutation SubmitSighting($input: SubmitSightingInput!) {
    submitSighting(input: $input) {
      id
      latitude
      longitude
      species
      count
      behavior
      observedAt
      createdAt
      comment
      zoneId
      zoneName
    }
  }
`;
