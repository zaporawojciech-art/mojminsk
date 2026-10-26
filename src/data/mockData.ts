// Dane demonstracyjne mójMińsk — realia Mińska Mazowieckiego
export type Tone = 'coral' | 'sky' | 'sand';
export type LineId = 'M2' | 'M3' | 'M4';

const img = (id: string, w = 600) => `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=75`;

export const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ebc999,8ca9d3,f26659,fddfdb`;

/* ---------------- Użytkownik i ulice ---------------- */
export interface Street {
  name: string;
  as: string; // forma "z/ze ..." do podpisu
  neighbors: number;
}

export interface UserPrivacy {
  showStats: boolean;
  showPastAds: boolean;
  showRides: boolean;
}

export interface User {
  name: string;
  surname?: string;
  street: Street;
  houseNumber?: string;
  flatNumber?: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  seed: string;
  rerolls: number;
  verified: boolean;
  trialDaysLeft: number;
  activationPin?: string;
  privacy?: UserPrivacy;
  isGuest?: boolean;
}

export interface PostalAreaOption {
  postalCode: string;
  city: string;
  locality?: string;
  label: string;
  isGmina?: boolean;
}

export const minskPostalAreas: PostalAreaOption[] = [
  { postalCode: '05-300', city: 'Mińsk Mazowiecki', label: '05-300 Mińsk Mazowiecki (centrum i miasto)' },
  { postalCode: '05-300', city: 'Stojadła', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Stojadła (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Nowe Osiny', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Nowe Osiny (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Huta Mińska', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Huta Mińska (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Karolina', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Karolina (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Arynów', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Arynów (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Janów', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Janów (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Zamienie', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Zamienie (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Barcząca', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Barcząca (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Brzóze', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Brzóze (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Gliniak', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Gliniak (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Stara Niedziałka', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Stara Niedziałka (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-300', city: 'Wólka Mińska', locality: 'gm. Mińsk Mazowiecki', label: '05-300 Wólka Mińska (gm. Mińsk Maz.)', isGmina: true },
  { postalCode: '05-301', city: 'Mińsk Mazowiecki', label: '05-301 Mińsk Mazowiecki (UP Mińsk 1)' },
  { postalCode: '05-302', city: 'Mińsk Mazowiecki', label: '05-302 Mińsk Mazowiecki (FUP Mińsk)' },
  { postalCode: '05-303', city: 'Mińsk Mazowiecki', label: '05-303 Mińsk Mazowiecki (FUP Mińsk)' },
  { postalCode: '05-311', city: 'Dębe Wielkie', locality: 'pogranicze gm. Mińsk Maz.', label: '05-311 Dębe Wielkie (obszar gminy)', isGmina: true },
  { postalCode: '05-332', city: 'Siennica', locality: 'południowa gm. Mińsk Maz.', label: '05-332 Siennica (obszar gminy)', isGmina: true },
];

export const streets: Street[] = [
  { name: 'Spacerowa', as: 'ze Spacerowej', neighbors: 142 },
  { name: 'Sosnkowskiego', as: 'z Sosnkowskiego', neighbors: 118 },
  { name: 'Warszawska', as: 'z Warszawskiej', neighbors: 96 },
  { name: 'Kościuszki', as: 'z Kościuszki', neighbors: 74 },
  { name: 'Mickiewicza', as: 'z Mickiewicza', neighbors: 61 },
  { name: 'Siennicka', as: 'z Siennickiej', neighbors: 58 },
  { name: 'Chełmońskiego', as: 'z Chełmońskiego', neighbors: 44 },
  { name: 'Kazikowskiego', as: 'z Kazikowskiego', neighbors: 41 },
  { name: 'Budowlana', as: 'z Budowlanej', neighbors: 37 },
  { name: 'Dąbrówki', as: 'z Dąbrówki', neighbors: 33 },
  { name: 'Klonowa', as: 'z Klonowej', neighbors: 29 },
  { name: 'Szpitalna', as: 'ze Szpitalnej', neighbors: 27 },
  { name: 'Piękna', as: 'z Pięknej', neighbors: 24 },
  { name: 'Tartaczna', as: 'z Tartacznej', neighbors: 21 },
  { name: 'Licealna', as: 'z Licealnej', neighbors: 19 },
  { name: 'Łąkowa', as: 'z Łąkowej', neighbors: 17 },
  { name: 'Osiedlowa', as: 'z Osiedlowej', neighbors: 15 },
  { name: 'Kościelna', as: 'z Kościelnej', neighbors: 14 },
  { name: 'Mireckiego', as: 'z Mireckiego', neighbors: 12 },
  { name: 'Langiewicza', as: 'z Langiewicza', neighbors: 9 },
  // Ulice / sołectwa z terenu Gminy Mińsk Mazowiecki
  { name: 'Warszawska (Stojadła)', as: 'z Warszawskiej (Stojadła)', neighbors: 48 },
  { name: 'Mazowiecka (Huta Mińska)', as: 'z Huty Mińskiej', neighbors: 39 },
  { name: 'Sosnowa (Nowe Osiny)', as: 'z Nowych Osin', neighbors: 35 },
  { name: 'Główna (Karolina)', as: 'z Karoliny', neighbors: 28 },
  { name: 'Zamienie', as: 'z Zamienia', neighbors: 22 },
  { name: 'Arynów', as: 'z Arynowa', neighbors: 19 },
];

export const demoUser: User = {
  name: 'Wojtek',
  surname: 'Kowalski',
  street: streets[0],
  houseNumber: '14',
  flatNumber: '8',
  phone: '500 123 456',
  postalCode: '05-300',
  city: 'Mińsk Mazowiecki',
  seed: 'Wojtek-1',
  rerolls: 3,
  verified: false,
  trialDaysLeft: 9,
  activationPin: '849201',
  privacy: {
    showStats: true,
    showPastAds: true,
    showRides: true,
  },
};

/* ---------------- Pogoda ---------------- */
export interface HourlyWeather {
  temp: number;
  condition: string;
  icon: 'sun' | 'partly-cloudy' | 'cloudy' | 'rain' | 'moon';
  rainChance?: number;
}

export const weather = {
  temp: 14,
  feels: 12,
  max: 16,
  min: 7,
  condition: 'Przejaśnienia',
  aqi: { label: 'Dobra', pm25: 9, pm10: 17 },
  wind: 14,
  humidity: 62,
  uv: 2,
  pressure: 1016,
  rain: 0.4,
  visibility: 11,
  sunrise: '06:14',
  sunset: '16:35',
  hourly: [
    { temp: 14, condition: 'Przejaśnienia', icon: 'partly-cloudy', rainChance: 10 },
    { temp: 15, condition: 'Słonecznie', icon: 'sun', rainChance: 0 },
    { temp: 15, condition: 'Częściowo słonecznie', icon: 'partly-cloudy', rainChance: 5 },
    { temp: 13, condition: 'Pochmurno', icon: 'cloudy', rainChance: 25 },
    { temp: 12, condition: 'Przelotny deszcz', icon: 'rain', rainChance: 65 },
    { temp: 10, condition: 'Lekki deszcz', icon: 'rain', rainChance: 45 },
    { temp: 9, condition: 'Przejaśnienia', icon: 'moon', rainChance: 15 },
    { temp: 8, condition: 'Pogodna noc', icon: 'moon', rainChance: 0 },
  ] as HourlyWeather[],
};

export interface FavoriteBusStop {
  id: string; // `${lineId}_${stopName}_${directionIdx}`
  lineId: LineId;
  stopName: string;
  directionIdx: 0 | 1;
  directionName: string;
  destination: string;
  customLabel?: string; // np. "Dom", "Praca / Szkoła", "Dworzec PKP"
}

export const FAVORITE_BUS_STOPS_KEY = 'mojminsk_favorite_bus_stops';

export interface AvailableStopRoute {
  lineId: LineId;
  directionIdx: 0 | 1;
  directionName: string;
  destination: string;
}

export interface CityBusStop {
  name: string;
  zone: string;
  isTransfer?: boolean;
  routes: AvailableStopRoute[];
}

export function getAllBusStopsList(): CityBusStop[] {
  const map = new Map<string, CityBusStop>();

  for (const line of busLines) {
    for (const st of line.stopsDetails) {
      if (!map.has(st.name)) {
        map.set(st.name, {
          name: st.name,
          zone: st.zone,
          isTransfer: st.isTransfer,
          routes: [],
        });
      }
      const item = map.get(st.name)!;
      line.directions.forEach((dir, dirIdx) => {
        if (dir.destination.toLowerCase() === st.name.toLowerCase()) return;
        item.routes.push({
          lineId: line.id,
          directionIdx: dirIdx as 0 | 1,
          directionName: dir.name,
          destination: dir.destination,
        });
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

export function getUpcomingDepartures(lineId: LineId, stopName: string, directionIdx: 0 | 1): number[] {
  const line = busLines.find((l) => l.id === lineId);
  if (!line) return [4, 19, 34];
  const idx = Math.max(0, line.stops.indexOf(stopName));
  const shift = directionIdx === 0 ? (idx * 3) % 15 : ((idx * 3) + 8) % 15;
  return line.offsets.map((o) => (o + shift) % 60).sort((a, b) => a - b);
}

export interface BusDirection {
  name: string;
  destination: string;
  frequency: string;
  departures: {
    weekday: string[];
    saturday: string[];
    sunday: string[];
  };
}

export interface BusStopDetail {
  name: string;
  zone: string;
  x: number; // percentage on map (0-100)
  y: number; // percentage on map (0-100)
  isTransfer?: boolean;
}

export interface BusLine {
  id: LineId;
  route: string;
  colorHex: string;
  stops: string[];
  stopsDetails: BusStopDetail[];
  offsets: number[];
  directions: [BusDirection, BusDirection];
}

export const busLines: BusLine[] = [
  {
    id: 'M2',
    route: 'Plac Dworcowy ⇄ Serbinów (przez Szpital)',
    colorHex: '#8CA9D3',
    stops: ['Plac Dworcowy', 'Piękna', 'Licealna', 'Tartaczna', 'Urząd Miasta', 'Mireckiego', 'Chemik', 'Szpital', 'Cmentarz Żydowski', 'Serbinów'],
    stopsDetails: [
      { name: 'Plac Dworcowy', zone: 'Centrum', x: 20, y: 35, isTransfer: true },
      { name: 'Piękna', zone: 'Centrum', x: 28, y: 38 },
      { name: 'Licealna', zone: 'Centrum', x: 38, y: 42 },
      { name: 'Tartaczna', zone: 'Strefa Południe', x: 46, y: 48 },
      { name: 'Urząd Miasta', zone: 'Centrum', x: 55, y: 44, isTransfer: true },
      { name: 'Mireckiego', zone: 'Wschód', x: 64, y: 50 },
      { name: 'Chemik', zone: 'Wschód', x: 72, y: 56 },
      { name: 'Szpital', zone: 'Wschód', x: 80, y: 64, isTransfer: true },
      { name: 'Cmentarz Żydowski', zone: 'Serbinów', x: 86, y: 72 },
      { name: 'Serbinów', zone: 'Serbinów', x: 92, y: 80, isTransfer: true },
    ],
    offsets: [4, 19, 34],
    directions: [
      {
        name: 'Kierunek Serbinów',
        destination: 'Serbinów Pętla',
        frequency: 'Co 15–20 min',
        departures: {
          weekday: ['05:45', '06:15', '06:35', '07:05', '07:35', '08:05', '08:45', '09:30', '10:30', '11:30', '12:30', '13:15', '14:00', '14:35', '15:10', '15:45', '16:20', '17:00', '17:40', '18:30', '19:30', '20:30', '21:30'],
          saturday: ['06:30', '07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30', '20:30'],
          sunday: ['07:30', '09:30', '11:30', '13:30', '15:30', '17:30', '19:30', '20:30'],
        },
      },
      {
        name: 'Kierunek Plac Dworcowy',
        destination: 'Dworzec PKP Mińsk Maz.',
        frequency: 'Co 15–20 min',
        departures: {
          weekday: ['05:15', '05:50', '06:20', '06:50', '07:20', '07:55', '08:30', '09:15', '10:15', '11:15', '12:15', '13:00', '13:45', '14:20', '14:55', '15:30', '16:05', '16:45', '17:25', '18:15', '19:15', '20:15', '21:15'],
          saturday: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
          sunday: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '20:00'],
        },
      },
    ],
  },
  {
    id: 'M3',
    route: 'Rondo Żołnierzy Wyklętych ⇄ Osiedlowa',
    colorHex: '#EBC999',
    stops: ['Rondo Żołnierzy Wyklętych', 'Warszawskie Przedmieście', 'Sienkiewicza', 'Kościuszki', 'Chemik', 'Szpitalna', 'Spacerowa', 'Klonowa Osiedle', 'FUD', 'Osiedlowa'],
    stopsDetails: [
      { name: 'Rondo Żołnierzy Wyklętych', zone: 'Zachód', x: 15, y: 70, isTransfer: true },
      { name: 'Warszawskie Przedmieście', zone: 'Zachód', x: 25, y: 62 },
      { name: 'Sienkiewicza', zone: 'Centrum', x: 38, y: 55 },
      { name: 'Kościuszki', zone: 'Centrum', x: 48, y: 50, isTransfer: true },
      { name: 'Chemik', zone: 'Wschód', x: 58, y: 46 },
      { name: 'Szpitalna', zone: 'Wschód', x: 67, y: 40 },
      { name: 'Spacerowa', zone: 'Północ', x: 74, y: 35 },
      { name: 'Klonowa Osiedle', zone: 'Północ', x: 80, y: 28 },
      { name: 'FUD', zone: 'Strefa Przemysłowa', x: 86, y: 22 },
      { name: 'Osiedlowa', zone: 'Osiedlowa Pętla', x: 92, y: 16, isTransfer: true },
    ],
    offsets: [6, 26, 46],
    directions: [
      {
        name: 'Kierunek Osiedlowa',
        destination: 'Osiedlowa Pętla FUD',
        frequency: 'Co 20 min',
        departures: {
          weekday: ['05:30', '06:05', '06:40', '07:15', '07:50', '08:30', '09:20', '10:20', '11:20', '12:20', '13:10', '13:50', '14:30', '15:10', '15:50', '16:30', '17:15', '18:00', '19:00', '20:00', '21:00'],
          saturday: ['06:40', '07:40', '08:40', '09:40', '10:40', '11:40', '12:40', '13:40', '14:40', '15:40', '16:40', '17:40', '18:40', '19:40'],
          sunday: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        },
      },
      {
        name: 'Kierunek Rondo Ż.W.',
        destination: 'Rondo Żołnierzy Wyklętych',
        frequency: 'Co 20 min',
        departures: {
          weekday: ['05:05', '05:40', '06:15', '06:50', '07:25', '08:05', '08:55', '09:55', '10:55', '11:55', '12:45', '13:25', '14:05', '14:45', '15:25', '16:05', '16:50', '17:35', '18:35', '19:35', '20:35'],
          saturday: ['06:10', '07:10', '08:10', '09:10', '10:10', '11:10', '12:10', '13:10', '14:10', '15:10', '16:10', '17:10', '18:10', '19:10'],
          sunday: ['07:30', '09:30', '11:30', '13:30', '15:30', '17:30', '19:30'],
        },
      },
    ],
  },
  {
    id: 'M4',
    route: 'Plac Dworcowy — pętla przez Anielinę',
    colorHex: '#F26659',
    stops: ['Plac Dworcowy', 'Kazikowskiego', 'Urząd Skarbowy', 'Chełmońskiego', 'Kościelna', 'Dąbrówki', 'PKP Anielina', 'Klonowa Osiedle', 'Spacerowa', 'Szpital'],
    stopsDetails: [
      { name: 'Plac Dworcowy', zone: 'Centrum', x: 20, y: 35, isTransfer: true },
      { name: 'Kazikowskiego', zone: 'Centrum', x: 30, y: 25 },
      { name: 'Urząd Skarbowy', zone: 'Północ', x: 42, y: 20 },
      { name: 'Chełmońskiego', zone: 'Północ', x: 55, y: 18 },
      { name: 'Kościelna', zone: 'Centrum', x: 62, y: 28 },
      { name: 'Dąbrówki', zone: 'Wschód', x: 70, y: 35 },
      { name: 'PKP Anielina', zone: 'Anielina', x: 80, y: 45, isTransfer: true },
      { name: 'Klonowa Osiedle', zone: 'Północ', x: 85, y: 55 },
      { name: 'Spacerowa', zone: 'Północ', x: 75, y: 65 },
      { name: 'Szpital', zone: 'Wschód', x: 65, y: 75, isTransfer: true },
    ],
    offsets: [11, 41, 71],
    directions: [
      {
        name: 'Trasa Pętlowa A (przez PKP Anielina)',
        destination: 'Pętla Dworzec PKP',
        frequency: 'Co 30 min',
        departures: {
          weekday: ['06:10', '06:40', '07:10', '07:45', '08:20', '09:00', '10:00', '11:00', '12:00', '13:00', '13:40', '14:20', '15:00', '15:40', '16:20', '17:00', '17:45', '18:30', '19:30', '20:30'],
          saturday: ['07:15', '08:15', '09:15', '10:15', '11:15', '12:15', '13:15', '14:15', '15:15', '16:15', '17:15', '18:15', '19:15'],
          sunday: ['08:15', '10:15', '12:15', '14:15', '16:15', '18:15', '20:15'],
        },
      },
      {
        name: 'Trasa Pętlowa B (przez Szpital)',
        destination: 'Pętla Dworzec PKP',
        frequency: 'Co 30 min',
        departures: {
          weekday: ['06:25', '06:55', '07:25', '08:00', '08:35', '09:30', '10:30', '11:30', '12:30', '13:20', '14:00', '14:40', '15:20', '16:00', '16:40', '17:20', '18:05', '19:00', '20:00', '21:00'],
          saturday: ['07:45', '08:45', '09:45', '10:45', '11:45', '12:45', '13:45', '14:45', '15:45', '16:45', '17:45', '18:45', '19:45'],
          sunday: ['08:45', '10:45', '12:45', '14:45', '16:45', '18:45', '20:45'],
        },
      },
    ],
  },
];

/* ---------------- Alert i newsy ---------------- */
export const liveAlert = {
  title: 'Kolizja na rondzie Dziąga',
  description: 'Ul. Warszawska / Budowlana — ruch wahadłowy w kierunku Kałuszyna. Omijaj przez Kościelną.',
  time: '12 min temu',
};

export const news = [
  { id: 'n1', source: 'minskmaz.com', time: '1 godz.', tag: 'Drogi', title: 'Remont ul. Warszawskiej — objazdy potrwają do końca listopada', image: img('photo-1449824913935-59a10b8d2000', 500) },
  { id: 'n2', source: 'Urząd Miasta', time: '3 godz.', tag: 'Kultura', title: 'Jarmark i kino plenerowe w Parku Dernałowiczów w sobotę', image: img('photo-1441974231531-c6227db76b6e', 500) },
  { id: 'n3', source: 'Mińsk Info', time: '5 godz.', tag: 'Inwestycje', title: 'Nowe ścieżki rowerowe połączą Serbinów z centrum', image: img('photo-1485965120184-e220f721d03e', 500) },
];

export interface PollOption {
  id: string;
  name: string;
  votes: number;
}

export interface PollItem {
  id: string;
  title: string;
  author: string;
  authorStreet: string;
  createdAt: string;
  expiresAt: string;
  durationDays: number;
  options: PollOption[];
  totalVotes: number;
  category?: 'city' | 'neighborhood' | 'culture' | 'investments';
  isOfficial?: boolean;
}

const now = Date.now();
const dayMs = 86400000;

export const initialPolls: PollItem[] = [
  {
    id: 'poll_1',
    title: 'Gdzie zjesz najlepszą pizzę w Mińsku?',
    author: 'Redakcja mójMińsk',
    authorStreet: 'Centrum',
    createdAt: new Date(now - 4 * dayMs).toISOString(),
    expiresAt: new Date(now + 3 * dayMs).toISOString(),
    durationDays: 7,
    isOfficial: true,
    category: 'city',
    totalVotes: 384,
    options: [
      { id: 'o1', name: 'Pizzeria Bella Ciao', votes: 168 },
      { id: 'o2', name: 'Da Grasso', votes: 104 },
      { id: 'o3', name: 'Biesiadowo', votes: 65 },
      { id: 'o4', name: 'Pod Strzechą', votes: 47 },
    ],
  },
  {
    id: 'poll_2',
    title: 'Czy Park Dernałowiczów powinien mieć nowe oświetlenie alejek?',
    author: 'Marek',
    authorStreet: 'ze Spacerowej',
    createdAt: new Date(now - 2 * dayMs).toISOString(),
    expiresAt: new Date(now + 5 * dayMs).toISOString(),
    durationDays: 7,
    isOfficial: false,
    category: 'investments',
    totalVotes: 354,
    options: [
      { id: 'o1', name: 'Tak, zdecydowanie (bezpieczeństwo po zmroku)', votes: 214 },
      { id: 'o2', name: 'Lepszy byłby stały monitoring miejski', votes: 98 },
      { id: 'o3', name: 'Wystarczy obecne oświetlenie', votes: 42 },
    ],
  },
  {
    id: 'poll_3',
    title: 'Czy autobus linii M2 powinien kursować częściej w szczycie?',
    author: 'Kasia',
    authorStreet: 'z Sosnkowskiego',
    createdAt: new Date(now - 6 * dayMs).toISOString(),
    expiresAt: new Date(now + 1 * dayMs).toISOString(),
    durationDays: 7,
    isOfficial: false,
    category: 'city',
    totalVotes: 296,
    options: [
      { id: 'o1', name: 'Tak, co 15 minut rano i po południu', votes: 189 },
      { id: 'o2', name: 'Więcej kursów w weekendy i niedziele', votes: 76 },
      { id: 'o3', name: 'Obecny rozkład co 30 min jest w porządku', votes: 31 },
    ],
  },
  {
    id: 'poll_4',
    title: 'Najlepsze lody rzemieślnicze w Mińsku na upalne dni',
    author: 'Piotr',
    authorStreet: 'z Warszawskiej',
    createdAt: new Date(now - 14 * dayMs).toISOString(),
    expiresAt: new Date(now - 7 * dayMs).toISOString(),
    durationDays: 7,
    isOfficial: false,
    category: 'culture',
    totalVotes: 453,
    options: [
      { id: 'o1', name: 'Lodziarnia U Lodziarzy (Kościuszki)', votes: 245 },
      { id: 'o2', name: 'Cukiernia Janek', votes: 120 },
      { id: 'o3', name: 'Lody Tradycyjne przy Pałacu', votes: 88 },
    ],
  },
  {
    id: 'poll_5',
    title: 'Gdzie zorganizować piknik sąsiedzki na zakończenie lata?',
    author: 'Ania',
    authorStreet: 'z Kościuszki',
    createdAt: new Date(now - 20 * dayMs).toISOString(),
    expiresAt: new Date(now - 6 * dayMs).toISOString(),
    durationDays: 14,
    isOfficial: false,
    category: 'neighborhood',
    totalVotes: 314,
    options: [
      { id: 'o1', name: 'Polana w Parku Dernałowiczów', votes: 182 },
      { id: 'o2', name: 'Tereny zielone MOSiR przy basenie', votes: 94 },
      { id: 'o3', name: 'Skwer przy fontannie na Placu Kilińskiego', votes: 38 },
    ],
  },
];

export const isPollActive = (p: PollItem): boolean => {
  return new Date(p.expiresAt).getTime() > Date.now();
};

export const getPollTimeLeftLabel = (p: PollItem): string => {
  const diffMs = new Date(p.expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Zakończona';
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `Zostało: ${diffHours} godz.`;
  const diffDays = Math.ceil(diffMs / 86400000);
  return `Zostało: ${diffDays} ${diffDays === 1 ? 'dzień' : diffDays < 5 ? 'dni' : 'dni'}`;
};

export const poll = {
  title: initialPolls[0].title,
  total: initialPolls[0].totalVotes,
  daysLeft: 3,
  options: initialPolls[0].options,
};

/* ---------------- Strefa Kuchni ---------------- */
export interface Ingredient {
  name: string;
  amount?: string;
  image: string;
}

export interface Product {
  id: string;
  kind: 'dish' | 'grocery';
  name: string;
  vendor: string;
  price: number;
  oldPrice?: number;
  unit?: string;
  diet?: 'wege' | 'miesne';
  description: string;
  image: string;
  tone: Tone;
  cat: string;
  ingredients?: Ingredient[];
}

const ING = {
  tomato: img('photo-1592924357228-91a4daadcfea', 160),
  cheese: img('photo-1486297678162-eb2a19b0a32d', 160),
  greens: img('photo-1512621776951-a57141f2eefd', 160),
  bread: img('photo-1509440159596-0249088772ff', 160),
  milk: img('photo-1563636619-e9143da7973b', 160),
};

export const dishes: Product[] = [
  {
    id: 'd1', kind: 'dish', cat: 'pizza', name: 'Pizza Margherita DOC', vendor: 'Pizzeria Bella Ciao', price: 34, diet: 'wege', tone: 'sky',
    description: 'Sos z pomidorów San Marzano, mozzarella fior di latte, świeża bazylia i oliwa extra virgin. Pieczona 90 sekund w piecu opalanym drewnem.',
    image: img('photo-1574071318508-1cdbab80d002', 500),
    ingredients: [
      { name: 'Sos pomidorowy', amount: '80 g', image: ING.tomato },
      { name: 'Mozzarella', amount: '150 g', image: ING.cheese },
      { name: 'Bazylia', image: ING.greens },
      { name: 'Ciasto 72h', image: ING.bread },
    ],
  },
  {
    id: 'd2', kind: 'dish', cat: 'burger', name: 'Smash Burger Bacon', vendor: 'Burger Stacja', price: 36, diet: 'miesne', tone: 'coral',
    description: 'Podwójna wołowina smash, cheddar, chrupiący bekon, ogórek kiszony z Mazowsza i sos chipotle w maślanej bułce.',
    image: img('photo-1568901346375-23c9450c58cd', 500),
    ingredients: [
      { name: 'Wołowina', amount: '2×90 g', image: ING.bread },
      { name: 'Cheddar', amount: '40 g', image: ING.cheese },
      { name: 'Sałata', image: ING.greens },
    ],
  },
  {
    id: 'd3', kind: 'dish', cat: 'sushi', name: 'Zestaw Maki Mix 16 szt.', vendor: 'Sushi Kōen', price: 49, tone: 'sand',
    description: 'Futomaki z łososiem, hosomaki z ogórkiem i awokado, california z krewetką. Imbir, wasabi, sos sojowy.',
    image: img('photo-1579871494447-9811cf80d66c', 500),
  },
  {
    id: 'd4', kind: 'dish', cat: 'bakery', name: 'Chleb na zakwasie', vendor: 'Piekarnia Gromulski', price: 12.5, diet: 'wege', tone: 'sand', unit: '800 g',
    description: 'Żytnio-pszenny chleb na naturalnym zakwasie, pieczony od 5:00 rano. Chrupiąca skórka, wilgotny miąższ.',
    image: img('photo-1509440159596-0249088772ff', 500),
  },
  {
    id: 'd5', kind: 'dish', cat: 'cafe', name: 'Flat white + sernik', vendor: 'Kawiarnia Srebrna', price: 24, diet: 'wege', tone: 'coral',
    description: 'Podwójne espresso z ziaren z lokalnej palarni i aksamitne mleko. Do tego domowy sernik baskijski.',
    image: img('photo-1509042239860-f550ce710b93', 500),
  },
];

export type MotylekAisle = 'all' | 'bakery' | 'dairy' | 'produce' | 'meat' | 'drinks' | 'household';

export interface MotylekDeal {
  id: string;
  badge: string;
  title: string;
  price: number;
  oldPrice: number;
  unit: string;
  image: string;
}

export const motylekDeals: MotylekDeal[] = [
  { id: 'g7', badge: 'Hit Tygodnia −30%', title: 'Masło ekstra z Mazowsza 82%', price: 5.99, oldPrice: 8.49, unit: '200 g', image: img('photo-1589985270826-4b7bb135bc9d', 400) },
  { id: 'g2', badge: 'Świeża dostawa', title: 'Pomidory malinowe gruntowe', price: 7.99, oldPrice: 11.99, unit: '1 kg', image: img('photo-1592924357228-91a4daadcfea', 400) },
  { id: 'g13', badge: 'Gazetka', title: 'Schab wiejski bez kości', price: 16.90, oldPrice: 22.90, unit: '1 kg', image: img('photo-1607623814075-e51df1bdc82f', 400) },
  { id: 'g10', badge: 'Supercena', title: 'Kawa ziarnista Lavazza Crema', price: 44.90, oldPrice: 59.90, unit: '1 kg', image: img('photo-1559056199-641a0ac8b55e', 400) },
];

export const motylekAislesList = [
  { id: 'all', label: 'Wszystko', icon: 'Sparkles' },
  { id: 'bakery', label: 'Pieczywo', icon: 'Croissant' },
  { id: 'dairy', label: 'Nabiał i jaja', icon: 'Milk' },
  { id: 'produce', label: 'Warzywa i owoce', icon: 'Apple' },
  { id: 'meat', label: 'Wędliny i mięso', icon: 'Beef' },
  { id: 'drinks', label: 'Napoje i kawa', icon: 'Coffee' },
  { id: 'household', label: 'Dom i chemia', icon: 'Sparkles' },
] as const;

export interface GroceryProduct extends Product {
  aisle: MotylekAisle;
}

export const groceries: GroceryProduct[] = [
  { id: 'g1', kind: 'grocery', cat: 'motylek', aisle: 'bakery', name: 'Chleb wiejski tradycyjny', vendor: 'Motylek Market', price: 4.2, unit: '500 g', tone: 'sand', description: 'Codziennie świeży, pieczony w lokalnej piekarni partnerskiej.', image: img('photo-1509440159596-0249088772ff', 400) },
  { id: 'g2', kind: 'grocery', cat: 'motylek', aisle: 'produce', name: 'Pomidory malinowe gruntowe', vendor: 'Motylek Market', price: 7.99, oldPrice: 11.99, unit: '1 kg', tone: 'coral', description: 'Słodkie pomidory malinowe od rolników spod Mińska.', image: img('photo-1592924357228-91a4daadcfea', 400) },
  { id: 'g3', kind: 'grocery', cat: 'motylek', aisle: 'dairy', name: 'Mleko świeże 3,2%', vendor: 'Motylek Market', price: 3.49, unit: '1 l', tone: 'sky', description: 'Mleko z mazowieckiej mleczarni, pasteryzowane.', image: img('photo-1563636619-e9143da7973b', 400) },
  { id: 'g4', kind: 'grocery', cat: 'motylek', aisle: 'dairy', name: 'Ser gouda w plastrach', vendor: 'Motylek Market', price: 5.8, unit: '150 g', tone: 'sand', description: 'Łagodny ser żółty, idealny do kanapek.', image: img('photo-1486297678162-eb2a19b0a32d', 400) },
  { id: 'g5', kind: 'grocery', cat: 'motylek', aisle: 'produce', name: 'Jabłka Ligol grójeckie', vendor: 'Motylek Market', price: 3.99, oldPrice: 5.49, unit: '1 kg', tone: 'coral', description: 'Soczyste jabłka z grójeckich sadów, chrupkie i słodkie.', image: img('photo-1560806887-1e4cd0b6cbd6', 400) },
  { id: 'g6', kind: 'grocery', cat: 'motylek', aisle: 'dairy', name: 'Jaja z wolnego wybiegu L', vendor: 'Motylek Market', price: 12.99, unit: '10 szt.', tone: 'sky', description: 'Jaja klasy L z certyfikowanego wolnego wybiegu.', image: img('photo-1582722872445-44dc5f7e3c8f', 400) },
  { id: 'g7', kind: 'grocery', cat: 'motylek', aisle: 'dairy', name: 'Masło ekstra z Mazowsza 82%', vendor: 'Motylek Market', price: 5.99, oldPrice: 8.49, unit: '200 g', tone: 'sand', description: 'Prawdziwe masło ekstra ze śmietanki pasteryzowanej.', image: img('photo-1589985270826-4b7bb135bc9d', 400) },
  { id: 'g8', kind: 'grocery', cat: 'motylek', aisle: 'meat', name: 'Szynka z wędzarni mińskiej', vendor: 'Motylek Market', price: 9.8, unit: '200 g', tone: 'coral', description: 'Tradycyjnie wędzona dymem olchowym szynka z lokalnej masarni.', image: img('photo-1524438418049-ab2acb7aa48f', 400) },
  { id: 'g9', kind: 'grocery', cat: 'motylek', aisle: 'drinks', name: 'Woda mineralna Cisowianka Niegaz.', vendor: 'Motylek Market', price: 2.19, unit: '1,5 l', tone: 'sky', description: 'Naturalna woda mineralna średnionasycona.', image: img('photo-1559839914-17aae19cec71', 400) },
  { id: 'g10', kind: 'grocery', cat: 'motylek', aisle: 'drinks', name: 'Kawa ziarnista Lavazza Crema', vendor: 'Motylek Market', price: 44.9, oldPrice: 59.9, unit: '1 kg', tone: 'sand', description: 'Mieszanka arabiki i robusty o kremowym aromacie i nutach czekolady.', image: img('photo-1559056199-641a0ac8b55e', 400) },
  { id: 'g11', kind: 'grocery', cat: 'motylek', aisle: 'household', name: 'Ekologiczny płyn do naczyń', vendor: 'Motylek Market', price: 7.49, unit: '750 ml', tone: 'sky', description: 'Biodegradowalny płyn z ekstraktem z aloesu, łagodny dla dłoni.', image: img('photo-1585421514284-efb74c2b69ba', 400) },
  { id: 'g12', kind: 'grocery', cat: 'motylek', aisle: 'bakery', name: 'Bułka paryska chrupiąca', vendor: 'Motylek Market', price: 3.2, unit: '350 g', tone: 'sand', description: 'Lekka pszenna bagietka z chrupiącą złocistą skórką.', image: img('photo-1549931319-a545dcf3bc73', 400) },
  { id: 'g13', kind: 'grocery', cat: 'motylek', aisle: 'meat', name: 'Schab wiejski bez kości', vendor: 'Motylek Market', price: 16.90, oldPrice: 22.90, unit: '1 kg', tone: 'coral', description: 'Świeży schab wieprzowy z mazowieckiego chowu, idealny na tradycyjne kotlety.', image: img('photo-1607623814075-e51df1bdc82f', 400) },
];

export const allProducts: Product[] = [...dishes, ...groceries];

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  cat: string;
  rating: number;
  reviews: number;
  time: string;
  fee: string;
  badge?: string;
  image: string;
  dishId: string;
}

export const restaurants: Restaurant[] = [
  { id: 'r1', name: 'Pizzeria Bella Ciao', cuisine: 'Pizza neapolitańska · Włoska', cat: 'pizza', rating: 4.9, reviews: 412, time: '25–35 min', fee: 'Dostawa 0 zł', badge: 'Top w Mińsku', image: img('photo-1513104890138-7c749659a591', 700), dishId: 'd1' },
  { id: 'r2', name: 'Burger Stacja', cuisine: 'Burgery rzemieślnicze', cat: 'burger', rating: 4.8, reviews: 287, time: '30–40 min', fee: 'Dostawa 6,99 zł', image: img('photo-1550547660-d9450f859349', 700), dishId: 'd2' },
  { id: 'r3', name: 'Sushi Kōen', cuisine: 'Sushi · Japońska', cat: 'sushi', rating: 4.7, reviews: 156, time: '35–45 min', fee: 'Dostawa 7,99 zł', image: img('photo-1579871494447-9811cf80d66c', 700), dishId: 'd3' },
  { id: 'r4', name: 'Piekarnia Gromulski', cuisine: 'Pieczywo · Wypieki', cat: 'bakery', rating: 4.9, reviews: 530, time: '15–25 min', fee: 'Dostawa 4,99 zł', badge: 'Świeże od 6:00', image: img('photo-1509440159596-0249088772ff', 700), dishId: 'd4' },
];

export const kitchenCats = [
  { id: 'all', name: 'Wszystko', image: img('photo-1512621776951-a57141f2eefd', 160) },
  { id: 'motylek', name: 'Motylek', image: img('photo-1542838132-92c53300491e', 160) },
  { id: 'pizza', name: 'Pizza', image: img('photo-1513104890138-7c749659a591', 160) },
  { id: 'burger', name: 'Burgery', image: img('photo-1568901346375-23c9450c58cd', 160) },
  { id: 'sushi', name: 'Sushi', image: img('photo-1579871494447-9811cf80d66c', 160) },
  { id: 'bakery', name: 'Piekarnie', image: img('photo-1509440159596-0249088772ff', 160) },
  { id: 'cafe', name: 'Kawiarnie', image: img('photo-1509042239860-f550ce710b93', 160) },
];

export const groceryHero = img('photo-1542838132-92c53300491e', 500);

/* ---------------- Ogłoszenia ---------------- */
export interface Ad {
  id: string;
  title: string;
  price: number | null;
  kind: 'sell' | 'free' | 'lost';
  author: string;
  street: string;
  time: string;
  image: string;
  images?: string[];
  description?: string;
  category?: string;
  condition?: 'Nowe' | 'Używane' | 'Bardzo dobry';
  status?: 'active' | 'reserved' | 'sold';
  views?: number;
  isOwner?: boolean;
  negotiable?: boolean;
}

export interface AdConversation {
  id: string;
  adId: string;
  adTitle: string;
  adPrice: number | null;
  adImage: string;
  adStreet: string;
  otherUser: {
    name: string;
    street: string;
    avatarSeed?: string;
  };
  role: 'buyer' | 'seller';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const ads: Ad[] = [
  {
    id: 'a1',
    title: 'Rower dziecięcy 16", stan bardzo dobry',
    price: 150,
    kind: 'sell',
    author: 'Ania',
    street: 'Kościuszki',
    time: '2 godz.',
    image: img('photo-1485965120184-e220f721d03e', 800),
    images: [
      img('photo-1485965120184-e220f721d03e', 1000),
      img('photo-1532298229144-0ec0c57515c7', 1000),
      img('photo-1507035895480-2b3156c31fc8', 1000),
      img('photo-1571068316344-75bc76f77890', 1000),
    ],
    description: 'Rower po jednym dziecku, 100% sprawny technicznie. Nowy dzwonek, hamulce wyregulowane, opony bez zużycia. Gratis dorzucam kask w rozmiarze S. Odbiór osobisty przy ul. Kościuszki, niedaleko SP nr 1.',
    category: 'Sport & Rowery',
    condition: 'Bardzo dobry',
    status: 'active',
    views: 42,
    negotiable: true,
  },
  {
    id: 'a2',
    title: 'Sofa 3-osobowa — do odbioru własnego',
    price: null,
    kind: 'free',
    author: 'Marek',
    street: 'Siennicka',
    time: '4 godz.',
    image: img('photo-1555041469-a586c61ea9bc', 800),
    images: [
      img('photo-1555041469-a586c61ea9bc', 1000),
      img('photo-1493663284031-b7e3aefcae8e', 1000),
      img('photo-1540574163026-643ea20ade25', 1000),
    ],
    description: 'Oddam za darmo rozkładaną sofę w kolorze szarym. Czysta, bez plam, drobne przetarcie z tyłu oparcia. 2. piętro bez windy, potrzebne 2 osoby do zniesienia. Chcę zwolnić miejsce do piątku.',
    category: 'Meble & Dom',
    condition: 'Używane',
    status: 'active',
    views: 89,
  },
  {
    id: 'a3',
    title: 'Biurko dębowe 120×60 cm',
    price: 220,
    kind: 'sell',
    author: 'Wojtek',
    street: 'Spacerowa',
    time: '6 godz.',
    image: img('photo-1518455027359-f3f8164ba6bd', 800),
    images: [
      img('photo-1518455027359-f3f8164ba6bd', 1000),
      img('photo-1593062096033-9a26b09da705', 1000),
      img('photo-1524758631624-e2822e304c36', 1000),
      img('photo-1505843490538-5133c6c7d0e1', 1000),
    ],
    description: 'Solidne biurko wykonane z klejonki dębowej z czarnymi nogami w stylu loft. Idealne do pracy z laptopem lub nauki. Używane przez rok, stan gabinetowy. Odbiór ul. Spacerowa (pomogę znieść do auta).',
    category: 'Meble & Dom',
    condition: 'Bardzo dobry',
    status: 'active',
    views: 67,
    isOwner: true,
  },
  {
    id: 'a4',
    title: 'Zaginął pies Bruno — okolice Serbinowa',
    price: null,
    kind: 'lost',
    author: 'Ola',
    street: 'Dąbrówki',
    time: '1 godz.',
    image: img('photo-1543466835-00a7907e9de1', 800),
    images: [
      img('photo-1543466835-00a7907e9de1', 1000),
      img('photo-1583511655857-d19b40a7a54e', 1000),
      img('photo-1537151608828-ea2b11777ee8', 1000),
    ],
    description: 'Dziś około godz. 8:30 w rejonie ul. Dąbrówki i osiedla Serbinów wystraszył się klaksonu i uciekł. Ma czerwoną obrożę z adresatką i chip. Bardzo przyjazny dla ludzi. Dla znalazcy przewidziana nagroda!',
    category: 'Zgubiłem / Znalazłem',
    status: 'active',
    views: 154,
  },
  {
    id: 'a5',
    title: 'Klocki LEGO City, komplet 4 zestawów',
    price: 90,
    kind: 'sell',
    author: 'Piotr',
    street: 'Sosnkowskiego',
    time: 'wczoraj',
    image: img('photo-1587654780291-39c9404d746b', 800),
    images: [
      img('photo-1587654780291-39c9404d746b', 1000),
      img('photo-1560961911-ba7ef651a56c', 1000),
      img('photo-1585366119957-e9730b6d0f60', 1000),
    ],
    description: 'Zestawy policja, straż i 2 małe pojazdy. Kompletne w 100%, z papierowymi instrukcjami w bardzo dobrym stanie. Zapakowane w woreczki strunowe. Świetny prezent dla dziecka.',
    category: 'Dziecięce',
    condition: 'Bardzo dobry',
    status: 'active',
    views: 33,
  },
  {
    id: 'a6',
    title: 'Monstera Deliciosa 120 cm z doniczką',
    price: 40,
    kind: 'sell',
    author: 'Kasia',
    street: 'Mickiewicza',
    time: 'wczoraj',
    image: img('photo-1485955900006-10f4d324d411', 800),
    images: [
      img('photo-1485955900006-10f4d324d411', 1000),
      img('photo-1614594975525-e45190c55d0b', 1000),
      img('photo-1459411552884-841db9b3cc2a', 1000),
    ],
    description: 'Zdrowa roślina z 7 dużymi liśćmi z dziurami, regularnie nawożona biohumusem. Sprzedaję wraz z nową doniczką ceramiczną i podstawkiem, bo po remoncie zabrakło dla niej miejsca.',
    category: 'Ogród & Narzędzia',
    condition: 'Nowe',
    status: 'active',
    views: 51,
  },
  {
    id: 'a7',
    title: 'Słuchawki bezprzewodowe Sony WH-1000XM4 ANC',
    price: 580,
    kind: 'sell',
    author: 'Michał',
    street: 'Warszawska',
    time: '3 godz.',
    image: img('photo-1505740420928-5e560c06d30e', 800),
    images: [
      img('photo-1505740420928-5e560c06d30e', 1000),
      img('photo-1484704849700-f032a568e944', 1000),
    ],
    description: 'Oryginalne słuchawki z redukcją hałasu ANC, idealne do pociągu Kolei Mazowieckich do Warszawy. W zestawie twarde etui oraz przewód USB-C. Bateria trzyma pełne 30 godzin.',
    category: 'Elektronika',
    condition: 'Bardzo dobry',
    status: 'active',
    views: 94,
    negotiable: true,
  },
  {
    id: 'a8',
    title: 'Komplet opon zimowych 205/55 R16 Michelin (4 szt.)',
    price: 450,
    kind: 'sell',
    author: 'Krzysztof',
    street: 'Kazikowskiego',
    time: '5 godz.',
    image: img('photo-1578844251758-2f71da64c96f', 800),
    images: [
      img('photo-1578844251758-2f71da64c96f', 1000),
      img('photo-1580273916550-e323be2ae537', 1000),
    ],
    description: 'Bieżnik ponad 6,5 mm, równe, nieklejone, przechowywane w suchym garażu przy ul. Kazikowskiego. Sprzedaję po zmianie samochodu.',
    category: 'Motoryzacja',
    condition: 'Używane',
    status: 'active',
    views: 78,
    negotiable: true,
  },
];

export const initialAdConversations: AdConversation[] = [
  {
    id: 'conv_1',
    adId: 'a3',
    adTitle: 'Biurko dębowe 120×60 cm',
    adPrice: 220,
    adImage: img('photo-1518455027359-f3f8164ba6bd', 300),
    adStreet: 'Spacerowa',
    otherUser: {
      name: 'Tomasz',
      street: 'Sosnkowskiego',
      avatarSeed: 'Tomasz-1',
    },
    role: 'seller',
    lastMessage: 'Dzień dobry, czy biurko zmieści się do bagażnika kombi? Byłbym chętny dziś po 18:00.',
    lastMessageTime: '15 min temu',
    unreadCount: 1,
  },
  {
    id: 'conv_2',
    adId: 'a1',
    adTitle: 'Rower dziecięcy 16", stan bardzo dobry',
    adPrice: 150,
    adImage: img('photo-1485965120184-e220f721d03e', 300),
    adStreet: 'Kościuszki',
    otherUser: {
      name: 'Ania',
      street: 'Kościuszki',
      avatarSeed: 'Ania-2',
    },
    role: 'buyer',
    lastMessage: 'Super, możemy się umówić! Dziś po 17:30 będę w domu. Podaję klatkę B.',
    lastMessageTime: '1 godz. temu',
    unreadCount: 0,
  },
  {
    id: 'conv_3',
    adId: 'a2',
    adTitle: 'Sofa 3-osobowa — do odbioru własnego',
    adPrice: null,
    adImage: img('photo-1555041469-a586c61ea9bc', 300),
    adStreet: 'Siennicka',
    otherUser: {
      name: 'Marek',
      street: 'Siennicka',
      avatarSeed: 'Marek-3',
    },
    role: 'buyer',
    lastMessage: 'Dzięki sąsiedzie za kontakt. Sofa czeka, pomogę przy znoszeniu!',
    lastMessageTime: 'Wczoraj',
    unreadCount: 0,
  },
];

/* ---------------- Przejazdy ---------------- */
export interface Ride {
  id: string;
  driver: string;
  driverAs: string;
  rating: number;
  rides: number;
  from: string;
  to: string;
  dest: string;
  depart: string;
  arrive: string;
  seats: number;
  price: number;
  car: string;
}

export const rides: Ride[] = [
  { id: 'rd1', driver: 'Ania', driverAs: 'z Kościuszki', rating: 4.9, rides: 32, from: 'Mińsk · Kościuszki', to: 'Warszawa · Rondo Wiatraczna', dest: 'Warszawa', depart: '07:15', arrive: '07:55', seats: 2, price: 15, car: 'Toyota Corolla' },
  { id: 'rd2', driver: 'Marek', driverAs: 'z Siennickiej', rating: 4.8, rides: 18, from: 'Mińsk · PKP Anielina', to: 'Warszawa · Mokotów', dest: 'Warszawa', depart: '07:40', arrive: '08:35', seats: 3, price: 18, car: 'Skoda Octavia' },
  { id: 'rd3', driver: 'Kasia', driverAs: 'ze Spacerowej', rating: 5.0, rides: 9, from: 'Mińsk · Spacerowa', to: 'Halinów · Centrum', dest: 'Halinów', depart: '16:20', arrive: '16:45', seats: 1, price: 8, car: 'Kia Ceed' },
  { id: 'rd4', driver: 'Tomek', driverAs: 'z Osiedlowej', rating: 4.7, rides: 14, from: 'Mińsk · Osiedlowa', to: 'Sulejówek · Dworzec', dest: 'Sulejówek', depart: '17:05', arrive: '17:25', seats: 3, price: 6, car: 'VW Golf' },
];

/* ---------------- Strefa Rozmów ---------------- */
export interface Post {
  id: string;
  author: string;
  authorAs: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  replies: number;
  reposts: number;
  views: number;
}

export const posts: Post[] = [
  { id: 'p1', author: 'Ania', authorAs: 'z Kościuszki', time: '14 min', content: 'Przejście na Spacerowej przy Szpitalnej wreszcie doświetlone! Wieczorem z dziećmi czuć ogromną różnicę 👏 #Spacerowa', likes: 24, replies: 6, reposts: 2, views: 812 },
  { id: 'p2', author: 'Marek', authorAs: 'z Siennickiej', time: '38 min', content: 'Uwaga kierowcy: od jutra frezowanie na Siennickiej, objazd przez Kościelną. Planujcie poranne wyjazdy 10 min wcześniej. #Drogi', image: img('photo-1449824913935-59a10b8d2000', 700), likes: 41, replies: 12, reposts: 9, views: 1904 },
  { id: 'p3', author: 'Piotr', authorAs: 'z Dąbrówki', time: '2 godz.', content: 'W sobotę kino letnie w Parku Dernałowiczów — grają „Misia” o 20:30. Kto idzie? Bierzcie koce 🎬 #Kultura #Centrum', likes: 67, replies: 21, reposts: 14, views: 2410 },
  { id: 'p4', author: 'Ola', authorAs: 'z Osiedlowej', time: '3 godz.', content: 'Polecacie przedszkole na Serbinowie? Szukamy miejsca od września dla 3-latka. #Serbinów', likes: 9, replies: 17, reposts: 1, views: 640 },
];

export const talkTags = ['Wszystko', '#Spacerowa', '#Centrum', '#Serbinów', '#Drogi', '#Kultura'];

/* ---------------- Strefa Partnera ---------------- */
export const partner = {
  name: 'Pracownia Złota Nić',
  address: 'ul. Warszawska 12, Mińsk Mazowiecki',
  code: 'MOJMINSK15',
  hero: img('photo-1515562141207-7a88fb7ce338', 800),
  products: [
    { id: 'pp1', name: 'Pierścionek z cyrkonią', material: 'Złoto 585', price: 890, image: img('photo-1605100804763-247f67b3557e', 400) },
    { id: 'pp2', name: 'Naszyjnik Perła', material: 'Srebro 925', price: 340, image: img('photo-1599643478518-a784e5dc4c8f', 400) },
    { id: 'pp3', name: 'Kolczyki Kropla', material: 'Złoto 375', price: 520, image: img('photo-1535632066927-ab7c9ab60908', 400) },
    { id: 'pp4', name: 'Bransoletka Mińsk', material: 'Srebro 925', price: 260, image: img('photo-1611591437281-460bfbe1220a', 400) },
  ],
};
