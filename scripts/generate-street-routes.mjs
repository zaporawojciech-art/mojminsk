import fs from 'fs';

// 1. Wczytaj bazę przystanków
const textRbs = fs.readFileSync('src/data/realBusStops.ts', 'utf8');
const rbsMatch = textRbs.match(/export const REAL_BUS_STOPS[^=]*=\s*(\[[\s\S]*?\]);/);
const REAL_BUS_STOPS = JSON.parse(rbsMatch[1]);

function getStopCoord(stopLabel) {
  const exact = REAL_BUS_STOPS.find(s => s.fullName.toLowerCase() === stopLabel.toLowerCase());
  if (exact) return [exact.lat, exact.lon];
  const clean = stopLabel.replace(/\s+\d+$/, '').trim().toLowerCase();
  const byName = REAL_BUS_STOPS.find(s => s.name.toLowerCase() === clean);
  if (byName) return [byName.lat, byName.lon];
  return [52.1793, 21.5658];
}

const LINE_STOPS = {
  M1: {
    forward: [
      'PLAC DWORCOWY 01', 'Rondo Bitwy Warszawskiej 1920 r. 01', 'Kazikowskiego 03', 'Urząd Miasta 03',
      '11 Listopada 02', 'Boczna 02', 'Szkoła Podstawowa nr 5 02', 'Jagiellońska 04', 'Nowy Świat 06',
      'Kwiatowa 02', 'Bagnista 04', 'Leśna 06', 'Krasickiego 01', 'Małaszczyckiej 01', 'Karolina 03',
      'Jasna 01', 'Budowlana 01', 'Cmentarz 06', 'Żwirowa 01', 'Chrobrego 03', 'Mickiewicza 02',
      'Łupińskiego 01', 'SERBINÓW 03'
    ],
    backward: [
      'SERBINÓW 03', 'Chrobrego 02', 'Żwirowa 04', 'Cmentarz 05', 'Budowlana 02', 'Jasna 02',
      'Karolina 04', 'Małaszczyckiej 02', 'Krasickiego 04', 'Leśna 03', 'Bagnista 01', 'Kwiatowa 03',
      'Nowy Świat 01', 'Jagiellońska 03', 'Szkoła Podstawowa nr 5 01', 'Boczna 07', '11 Listopada 01',
      'Kościuszki 02', 'Okrzei 04', 'PLAC DWORCOWY 01'
    ]
  },
  M2: {
    forward: [
      'PLAC DWORCOWY 01', 'Piękna 01', 'Licealna 03', 'Tartaczna 01', 'Jana Pawła II 02',
      'Miejska Szkoła Artystyczna 04', 'Przedszkole Miejskie nr 5 02', 'Mireckiego 01', 'Chemik 02',
      'Szpital 04', 'Cmentarz Żydowski 06', 'Łupińskiego 01', 'SERBINÓW 03'
    ],
    backward: [
      'SERBINÓW 03', 'Mickiewicza 02', 'Dąbrówki 01', 'Szkoła Podstawowa nr 2 02', 'Chemik 05',
      'Mireckiego 02', 'Przedszkole Miejskie nr 5 01', 'Urząd Miasta 03', 'Miejska Szkoła Artystyczna 01',
      'Jana Pawła II 03', 'Tartaczna 02', 'Licealna 02', 'Piękna 04', 'PLAC DWORCOWY 01'
    ]
  },
  M3: {
    forward: [
      'OSIEDLOWA 12', 'Sosnkowskiego 14', 'Mechanik 16', 'Widok 18', 'Szkoła Podstawowa nr 6 20',
      'FUD 02', 'Rudzkiego 04', 'Dźwigowa 02', 'Łąkowa 01', 'Langiewicza 01', 'Spacerowa 04',
      'Klonowa Osiedle 03', 'Klonowa 45', 'Szpitalna 02', 'Śniadeckich 01', 'Chemik 05',
      'Mireckiego 02', 'Przedszkole Miejskie nr 5 01', 'Urząd Miasta 03', '11 Listopada 02',
      'Targowisko 06', 'Sienkiewicza 01', 'Warszawskie Przedmieście 03', 'Warszawska 01',
      'RONDO ŻOŁNIERZY WYKLĘTYCH 02'
    ],
    backward: [
      'RONDO ŻOŁNIERZY WYKLĘTYCH 02', 'Warszawskie Przedmieście - Osiedle 02', 'Warszawskie Przedmieście 04',
      'Sienkiewicza 06', 'Targowisko 01', '11 Listopada 01', 'Kościuszki 02', 'Przedszkole Miejskie nr 5 02',
      'Mireckiego 01', 'Chemik 02', 'Śniadeckich 04', 'Szpitalna 01', 'Spacerowa 04', 'Klonowa Osiedle 03',
      'Klonowa 45', 'Langiewicza 02', 'Łąkowa 02', 'Dźwigowa 01', 'Rudzkiego 01', 'FUD 03',
      'Szkoła Podstawowa nr 6 19', 'Widok 17', 'Mechanik 15', 'Sosnkowskiego 13', 'OSIEDLOWA 12'
    ]
  },
  M4: {
    forward: [
      'PLAC DWORCOWY 01', 'Rondo Bitwy Warszawskiej 1920 r. 01', 'Kazikowskiego 03', 'Urząd Skarbowy 02',
      'Urząd Gminy 03', 'Chełmońskiego 05', 'Budowlana 01', 'Rondo Dziąga 03', 'Kościelna 01',
      'Zespół Szkolno-Przedszkolny nr 1 02', 'Dąbrówki 04', 'Mickiewicza 01', 'Serbinów 02',
      'Łupińskiego 02', 'PKP Anielina 02', 'Ludowa 01', 'Klonowa Osiedle 03', 'SPACEROWA 04'
    ],
    backward: [
      'SPACEROWA 04', 'Ludowa 04', 'PKP Anielina 01', 'Łupińskiego 03', 'Cmentarz Żydowski 01',
      'Szpital 03', 'Chemik 05', 'Siennicka 47', 'Kościelna 02', 'Rondo Dziąga 04', 'Budowlana 02',
      'Chełmońskiego 02', 'Urząd Gminy 04', 'Urząd Skarbowy 01', 'Kazikowskiego 02', 'PLAC DWORCOWY 01'
    ]
  }
};

async function fetchRouteForStops(stops) {
  const coords = stops.map(s => getStopCoord(s));
  const coordsStr = coords.map(([lat, lon]) => `${lon},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(url).then(r => r.json());
  if (res.code !== 'Ok' || !res.routes || !res.routes[0]) {
    throw new Error(`OSRM error: ${res.code} - ${res.message || 'no route'}`);
  }

  const legs = res.routes[0].legs;
  const hops = [];
  const fullPolyline = [];

  for (let i = 0; i < legs.length; i++) {
    const fromStop = stops[i];
    const toStop = stops[i + 1];
    const startCoord = coords[i];
    const endCoord = coords[i + 1];

    const leg = legs[i];
    const legCoords = [];

    // Dodaj punkt startowy (dokładne współrzędne przystanku)
    legCoords.push([startCoord[0], startCoord[1]]);

    leg.steps.forEach(step => {
      step.geometry.coordinates.forEach(c => {
        const pt = [c[1], c[0]];
        const last = legCoords[legCoords.length - 1];
        if (Math.abs(last[0] - pt[0]) > 0.000001 || Math.abs(last[1] - pt[1]) > 0.000001) {
          legCoords.push(pt);
        }
      });
    });

    // Upewnij się, że ostatni punkt odpowiada dokładnie przystankowi końcowemu
    const last = legCoords[legCoords.length - 1];
    if (Math.abs(last[0] - endCoord[0]) > 0.000001 || Math.abs(last[1] - endCoord[1]) > 0.000001) {
      legCoords.push([endCoord[0], endCoord[1]]);
    } else {
      legCoords[legCoords.length - 1] = [endCoord[0], endCoord[1]];
    }

    hops.push({
      from: fromStop,
      to: toStop,
      coords: legCoords
    });

    // Sklejaj z całą trasą (bez duplikatu punktu łączenia)
    if (fullPolyline.length === 0) {
      fullPolyline.push(...legCoords);
    } else {
      fullPolyline.push(...legCoords.slice(1));
    }
  }

  return { hops, fullPolyline };
}

async function generateAll() {
  console.log('Rozpoczynam pobieranie precyzyjnych geometrii ulicznych OSRM...');
  const result = {};

  for (const lineId of ['M1', 'M2', 'M3', 'M4']) {
    console.log(`\n=== Przetwarzanie linii ${lineId} ===`);
    
    console.log(`  Pobieranie kierunku 0 (Forward: ${LINE_STOPS[lineId].forward.length} przystanków)...`);
    const fRes = await fetchRouteForStops(LINE_STOPS[lineId].forward);
    console.log(`  ✓ Kierunek 0: ${fRes.hops.length} hopów, ${fRes.fullPolyline.length} punktów drogowych`);

    // Krótkie opóźnienie dla OSRM public API
    await new Promise(r => setTimeout(r, 600));

    console.log(`  Pobieranie kierunku 1 (Backward: ${LINE_STOPS[lineId].backward.length} przystanków)...`);
    const bRes = await fetchRouteForStops(LINE_STOPS[lineId].backward);
    console.log(`  ✓ Kierunek 1: ${bRes.hops.length} hopów, ${bRes.fullPolyline.length} punktów drogowych`);

    result[lineId] = {
      forward: fRes.fullPolyline,
      backward: bRes.fullPolyline,
      hopSegments: fRes.hops,
      hopsForward: fRes.hops,
      hopsBackward: bRes.hops
    };

    await new Promise(r => setTimeout(r, 600));
  }

  const fileContent = `// Pre-computed, high-fidelity street route coordinates for lines M1, M2, M3, M4
// Generated from OpenStreetMap road network geometry via OSRM and official ZDiTM stops in Mińsk Mazowiecki.
// All coordinates strictly follow physical road alignments (no cutting through buildings or terrain).

export interface HopSegment {
  from: string;
  to: string;
  coords: [number, number][];
}

export interface LineStreetData {
  forward: [number, number][];
  backward: [number, number][];
  hopSegments: HopSegment[];
  hopsForward: HopSegment[];
  hopsBackward: HopSegment[];
}

export const BUS_STREET_ROUTES: Record<'M1' | 'M2' | 'M3' | 'M4', LineStreetData> = ${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync('src/data/busStreetRoutes.ts', fileContent, 'utf8');
  console.log('\n🎉 ZAPISANO NOWY PLIK: src/data/busStreetRoutes.ts');
}

generateAll().catch(e => {
  console.error('Błąd generowania:', e);
  process.exit(1);
});
