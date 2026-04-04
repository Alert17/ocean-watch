/**
 * Ray casting — point inside polygon ring [lng, lat].
 * Ring must be closed (first point === last) or treated as implicit close.
 */
export function pointInPolygon(
  lng: number,
  lat: number,
  ring: [number, number][],
): boolean {
  if (ring.length < 3) return false;
  const closed =
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring
      : [...ring, ring[0]];

  let inside = false;
  for (let i = 0, j = closed.length - 1; i < closed.length; j = i++) {
    const xi = closed[i][0];
    const yi = closed[i][1];
    const xj = closed[j][0];
    const yj = closed[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function findZoneForPoint(
  lng: number,
  lat: number,
  zones: { id: string; polygon: [number, number][] }[],
): string | null {
  for (const z of zones) {
    if (pointInPolygon(lng, lat, z.polygon)) return z.id;
  }
  return null;
}
