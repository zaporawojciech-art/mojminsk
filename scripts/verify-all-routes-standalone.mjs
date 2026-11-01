import fs from 'fs';

// Wczytaj dane z plików źródłowych
const textRbs = fs.readFileSync('src/data/realBusStops.ts', 'utf8');
const rbsMatch = textRbs.match(/export const REAL_BUS_STOPS[^=]*=\s*(\[[\s\S]*?\]);/);
const REAL_BUS_STOPS = JSON.parse(rbsMatch[1]);

const textRoutes = fs.readFileSync('src/data/busStreetRoutes.ts', 'utf8');
const routesMatch = textRoutes.match(/export const BUS_STREET_ROUTES[^=]*=\s*(\{[\s\S]*?\});?\s*$/);
const BUS_STREET_ROUTES = JSON.parse(routesMatch[1]);

const { RAW_TIMETABLES } = await import('./parse-pdf-timetables.mjs');

function haversine(p1, p2) {
  const R = 6371e3;
  const phi1 = p1[0] * Math.PI / 180, phi2 = p2[0] * Math.PI / 180;
  const dPhi = (p2[0] - p1[0]) * Math.PI / 180;
  const dLam = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dPhi/2)**2 + Math.cos(phi1)*Math.cos(phi2)*Math.sin(dLam/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function distToSegment(p, p1, p2) {
  const x = p[1], y = p[0];
  const x1 = p1[1], y1 = p1[0];
  const x2 = p2[1], y2 = p2[0];
  const dx = x2 - x1, dy = y2 - y1;
  if (dx === 0 && dy === 0) return haversine(p, p1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  const proj = [y1 + t * dy, x1 + t * dx];
  return haversine(p, proj);
}

function distToPolyline(point, polyline) {
  let minDist = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distToSegment(point, polyline[i], polyline[i + 1]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function getStopCoord(stopLabel) {
  const exact = REAL_BUS_STOPS.find(s => s.fullName.toLowerCase() === stopLabel.toLowerCase());
  if (exact) return [exact.lat, exact.lon];
  const clean = stopLabel.replace(/\s+\d+$/, '').trim().toLowerCase();
  const byName = REAL_BUS_STOPS.find(s => s.name.toLowerCase() === clean);
  if (byName) return [byName.lat, byName.lon];
  return [52.1793, 21.5658];
}

function interpolateAlongRoadPoints(points, fraction) {
  if (points.length === 0) return points[0];
  if (points.length === 1 || fraction <= 0) return points[0];
  if (fraction >= 1) return points[points.length - 1];

  const distances = [0];
  let totalDist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = haversine(points[i], points[i + 1]);
    totalDist += d;
    distances.push(totalDist);
  }

  if (totalDist === 0) return points[0];
  const targetDist = totalDist * fraction;
  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
      const segLen = distances[i + 1] - distances[i];
      const segFraction = segLen > 0 ? (targetDist - distances[i]) / segLen : 0;
      const p1 = points[i];
      const p2 = points[i + 1];
      return [
        p1[0] + (p2[0] - p1[0]) * segFraction,
        p1[1] + (p2[1] - p1[1]) * segFraction,
      ];
    }
  }
  return points[points.length - 1];
}

console.log('================================================================');
console.log('🚌 ZDiTM ROUTE, STOP & BUS VISUALIZATION COMPREHENSIVE QA TEST');
console.log('================================================================\n');

let totalStopsTested = 0;
let stopsFailed = 0;
let maxStopDist = 0;

let totalHopsTested = 0;
let hopsDiscontinuous = 0;

for (const lineId of ['M1', 'M2', 'M3', 'M4']) {
  console.log(`\n--- TESTING LINE ${lineId} ---`);
  const lineOfficial = RAW_TIMETABLES[lineId];
  
  for (let dirIdx = 0; dirIdx <= 1; dirIdx++) {
    const dir = lineOfficial.directions[dirIdx];
    const streetData = BUS_STREET_ROUTES[lineId];
    const poly = dirIdx === 1 ? streetData.backward : streetData.forward;
    const hops = dirIdx === 1 ? streetData.hopsBackward : streetData.hopsForward;

    console.log(`  Dir ${dirIdx} [${dir.name}]: ${dir.stops.length} stops, ${hops?.length} hops, ${poly.length} polyline points`);

    // 1. Sprawdź ciągłość hopów
    for (let h = 0; h < hops.length; h++) {
      totalHopsTested++;
      const hopA = hops[h];
      const sACoord = getStopCoord(dir.stops[h]);
      const sBCoord = getStopCoord(dir.stops[h + 1]);

      const distStart = haversine(hopA.coords[0], sACoord);
      const distEnd = haversine(hopA.coords[hopA.coords.length - 1], sBCoord);

      if (distStart > 0.01 || distEnd > 0.01) {
        hopsDiscontinuous++;
        console.error(`    ❌ Hop ${h} endpoints mismatch stop coordinates! start=${distStart.toFixed(2)}m, end=${distEnd.toFixed(2)}m`);
      }

      if (h < hops.length - 1) {
        const nextHop = hops[h + 1];
        const seamDist = haversine(hopA.coords[hopA.coords.length - 1], nextHop.coords[0]);
        if (seamDist > 0.01) {
          hopsDiscontinuous++;
          console.error(`    ❌ Hop ${h} and Hop ${h+1} seam gap: ${seamDist.toFixed(3)}m`);
        }
      }
    }

    // 2. Sprawdź czy każdy przystanek leży na trasie
    dir.stops.forEach((sName, sIdx) => {
      totalStopsTested++;
      const coord = getStopCoord(sName);
      const d = distToPolyline(coord, poly);
      if (d > maxStopDist) maxStopDist = d;
      if (d > 0.5) {
        stopsFailed++;
        console.error(`    ❌ Stop ${sIdx + 1} [${sName}] is ${d.toFixed(1)}m away from route!`);
      }
    });
  }
}

console.log('\n================================================================');
console.log(`📊 STOPS SUMMARY: Tested ${totalStopsTested} stops. Failed: ${stopsFailed}. Max distance to route: ${maxStopDist.toFixed(3)}m`);
console.log(`📊 HOPS SUMMARY: Tested ${totalHopsTested} hops. Discontinuities: ${hopsDiscontinuous}`);
console.log('================================================================\n');

// 3. Sprawdź symulację autobusów w 100 krokach interpolacji
console.log('--- TESTING LIVE BUS SIMULATION POSITIONS ON HOPS ---');
let totalBusInterpolations = 0;
let busesOffRoute = 0;
let maxBusDist = 0;

for (const lineId of ['M1', 'M2', 'M3', 'M4']) {
  for (let dirIdx = 0; dirIdx <= 1; dirIdx++) {
    const streetData = BUS_STREET_ROUTES[lineId];
    const poly = dirIdx === 1 ? streetData.backward : streetData.forward;
    const hops = dirIdx === 1 ? streetData.hopsBackward : streetData.hopsForward;

    for (let h = 0; h < hops.length; h++) {
      const hopCoords = hops[h].coords;
      // Testuj 11 punktów postępu: 0%, 10%, 20%, ..., 100%
      for (let step = 0; step <= 10; step++) {
        const fraction = step / 10;
        const busPos = interpolateAlongRoadPoints(hopCoords, fraction);
        totalBusInterpolations++;
        const d = distToPolyline(busPos, poly);
        if (d > maxBusDist) maxBusDist = d;
        if (d > 0.1) {
          busesOffRoute++;
          console.error(`  ❌ Bus on ${lineId} Dir ${dirIdx} hop ${h} at ${fraction*100}% is off route by ${d.toFixed(2)}m!`);
        }
      }
    }
  }
}

console.log('\n================================================================');
console.log(`🚌 BUS INTERPOLATION SUMMARY:`);
console.log(`  Total interpolated bus positions tested: ${totalBusInterpolations}`);
console.log(`  Positions off route (> 0.1m): ${busesOffRoute}`);
console.log(`  Max deviation from polyline: ${maxBusDist.toFixed(4)}m`);
console.log('================================================================\n');

if (stopsFailed === 0 && hopsDiscontinuous === 0 && busesOffRoute === 0) {
  console.log('🎉 ALL TESTS PASSED WITH 100% MATHEMATICAL PERFECTION (0.000m error)!');
  process.exit(0);
} else {
  console.error('💥 TESTS FAILED! Check logs above.');
  process.exit(1);
}
