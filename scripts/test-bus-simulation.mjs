import { getActiveBuses, getActiveBusEstimate } from '../src/data/busRouteCoordinates.ts';

// Simulate Wednesday at 05:35:10
const testDate = new Date(2026, 9, 28, 5, 35, 10); // Wednesday morning

console.log('--- TEST M1 AT 05:35:10 (WEDNESDAY) ---');
const m1Buses = getActiveBuses('M1', undefined, testDate);
console.log(`Active buses found on M1: ${m1Buses.length}`);
m1Buses.forEach((b, idx) => {
  console.log(`Bus #${idx + 1}:`);
  console.log(`  ID: ${b.id}`);
  console.log(`  Direction: ${b.directionName} (idx: ${b.directionIdx}) -> ${b.destination}`);
  console.log(`  Departure time: ${b.departureTime}`);
  console.log(`  Position: [${b.position[0]}, ${b.position[1]}]`);
  console.log(`  Segment: ${b.prevStop} -> ${b.nextStop}`);
  console.log(`  Is at stop: ${b.isAtStop}`);
  console.log(`  Status: ${b.statusLabel}`);
  console.log(`  Bearing: ${b.bearing.toFixed(1)}°`);
});

// Simulate Saturday at 08:35:00
const satDate = new Date(2026, 9, 31, 8, 35, 0); // Saturday
console.log('\n--- TEST M2 AT 08:35:00 (SATURDAY) ---');
const m2Buses = getActiveBuses('M2', undefined, satDate);
console.log(`Active buses found on M2: ${m2Buses.length}`);
m2Buses.forEach((b, idx) => {
  console.log(`Bus #${idx + 1}: ${b.departureTime} -> ${b.destination} (${b.statusLabel})`);
});
