/**
 * Shared coordinates projection utility for AWS Region Globe.
 * Translates standard Earth latitude and longitude into 3D Cartesian coordinates (X, Y, Z)
 * used by Three.js and React Three Fiber rendering layers.
 */

export function latLngToXYZ(lat: number, lng: number, r: number = 1.02): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180); // Polar angle
  const theta = lng * (Math.PI / 180); // Longitude angle
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = -r * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}
