import { haversine, DEFAULT_LOCATION } from '../data/geoUtils';

describe('haversine', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversine(34.0522, -118.2437, 34.0522, -118.2437)).toBe(0);
  });

  it('computes distance between LA and NYC (approx 3944 km)', () => {
    // Los Angeles to New York City
    const distance = haversine(34.0522, -118.2437, 40.7128, -74.0060);
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });

  it('computes distance between London and Paris (approx 343 km)', () => {
    const distance = haversine(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(330);
    expect(distance).toBeLessThan(360);
  });

  it('computes short distance within a city (LA downtown to Hollywood ~13 km)', () => {
    // Downtown LA to Hollywood
    const distance = haversine(34.0522, -118.2437, 34.0928, -118.3287);
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(20);
  });

  it('is symmetric (A->B == B->A)', () => {
    const ab = haversine(34.0522, -118.2437, 40.7128, -74.0060);
    const ba = haversine(40.7128, -74.0060, 34.0522, -118.2437);
    expect(ab).toBeCloseTo(ba, 10);
  });

  it('handles antipodal points (approx 20015 km, half Earth circumference)', () => {
    // North Pole to South Pole
    const distance = haversine(90, 0, -90, 0);
    expect(distance).toBeGreaterThan(20000);
    expect(distance).toBeLessThan(20100);
  });

  it('handles negative longitudes (western hemisphere)', () => {
    const distance = haversine(0, -10, 0, -20);
    expect(distance).toBeGreaterThan(0);
  });

  it('handles equator points correctly', () => {
    // 1 degree of longitude at equator is ~111 km
    const distance = haversine(0, 0, 0, 1);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(112);
  });
});

describe('DEFAULT_LOCATION', () => {
  it('is downtown Los Angeles', () => {
    expect(DEFAULT_LOCATION.latitude).toBeCloseTo(34.0522, 2);
    expect(DEFAULT_LOCATION.longitude).toBeCloseTo(-118.2437, 2);
  });
});
