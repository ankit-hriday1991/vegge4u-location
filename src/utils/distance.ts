import { getDistance } from 'geolib';

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const distance = getDistance(
    { latitude: lat1, longitude: lng1 },
    { latitude: lat2, longitude: lng2 }
  );
  return Math.round(distance / 1000); // Convert to kilometers
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return 'Less than 1 km';
  }
  return `${distance} km`;
}