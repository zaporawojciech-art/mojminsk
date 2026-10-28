import type { Ad, LineId } from '../data/mockData';
import type { TabId } from '../components/BottomNav';

const PL_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
};

export function slugify(text: string): string {
  return text
    .split('')
    .map((char) => PL_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const TAB_PATHS: Record<TabId, string> = {
  home: '/',
  ads: '/ogloszenia',
  rides: '/przejazdy',
  talks: '/rozmowy',
};

export function buildAdUrl(ad: Pick<Ad, 'id' | 'title' | 'street'>): string {
  return `/ogloszenia/${slugify(ad.title)}-${slugify(ad.street)}-${ad.id}`;
}

export function extractAdIdFromSlug(slugId?: string): string | null {
  if (!slugId) return null;
  const parts = slugId.split('-');
  return parts[parts.length - 1] || null;
}

export function buildZditmUrl(lineId?: LineId, stopName?: string): string {
  if (!lineId) return '/zditm';
  const base = `/zditm/${lineId.toLowerCase()}`;
  return stopName ? `${base}/${slugify(stopName)}` : base;
}

export function buildNeighborUrl(name: string, street: string): string {
  return `/sasiad/${slugify(name)}-${slugify(street)}`;
}

export const CATEGORY_URL_MAP: Record<string, string> = {
  all: '/ogloszenia',
  free: '/ogloszenia/kategoria/oddam-za-darmo',
  home: '/ogloszenia/kategoria/dom-i-meble',
  electronics: '/ogloszenia/kategoria/elektronika',
  kids: '/ogloszenia/kategoria/dla-dzieci',
  sport: '/ogloszenia/kategoria/sport-i-rowery',
  garden: '/ogloszenia/kategoria/ogrod-i-rosliny',
  moto: '/ogloszenia/kategoria/motoryzacja',
  lost: '/ogloszenia/kategoria/zgubione-znalezione',
};

export const SLUG_TO_CATEGORY_ID: Record<string, string> = {
  'oddam-za-darmo': 'free',
  'dom-i-meble': 'home',
  'elektronika': 'electronics',
  'dla-dzieci': 'kids',
  'sport-i-rowery': 'sport',
  'ogrod-i-rosliny': 'garden',
  'motoryzacja': 'moto',
  'zgubione-znalezione': 'lost',
};

export const CATEGORY_SEO_META: Record<
  string,
  { title: string; description: string; heading: string }
> = {
  all: {
    title: 'Ogłoszenia lokalne Mińsk Mazowiecki — kupuj, sprzedawaj, oddawaj',
    description:
      'Tablica ogłoszeń sąsiedzkich w Mińsku Mazowieckim i gminie Mińsk Mazowiecki. Ogłoszenia bezpośrednio od zweryfikowanych sąsiadów z Twojej ulicy bez prowizji.',
    heading: 'Tablica ogłoszeń sąsiedzkich',
  },
  free: {
    title: 'Oddam za darmo Mińsk Mazowiecki — ogłoszenia sąsiedzkie',
    description:
      'Oddam za darmo w Mińsku Mazowieckim. Sprawdź meble, ubranka dziecięce, książki i sprzęty oddawane bezpłatnie przez sąsiadów z Twojej ulicy.',
    heading: 'Oddam za darmo w Mińsku',
  },
  home: {
    title: 'Dom i Meble Mińsk Mazowiecki — ogłoszenia sąsiedzkie',
    description:
      'Meble, wyposażenie wnętrz i AGD z odbiorem osobistym w Mińsku Mazowieckim. Kupuj bezpośrednio od sąsiadów.',
    heading: 'Dom i Meble',
  },
  electronics: {
    title: 'Elektronika Mińsk Mazowiecki — telefony, laptopy, RTV od sąsiadów',
    description:
      'Sprawdzona elektronika z odbiorem na Twojej ulicy w Mińsku Mazowieckim: smartfony, laptopy, konsole i sprzęt audio.',
    heading: 'Elektronika',
  },
  kids: {
    title: 'Dla Dzieci Mińsk Mazowiecki — wózki, foteliki, zabawki i ubranka',
    description:
      'Artykuły dziecięce od rodziców z Mińska Mazowieckiego: rowerki, wózki, foteliki i ubranka w świetnym stanie.',
    heading: 'Dla Dzieci',
  },
  sport: {
    title: 'Sport i Rowery Mińsk Mazowiecki — ogłoszenia lokalne',
    description:
      'Rowery miejskie, górskie, dziecięce oraz sprzęt sportowy w Mińsku Mazowieckim bezpośrednio od mieszkańców.',
    heading: 'Sport i Rowery',
  },
  garden: {
    title: 'Ogród i Rośliny Mińsk Mazowiecki — sadzonki, narzędzia ogrodowe',
    description:
      'Sadzonki, kwiaty doniczkowe, kosiarki i narzędzia ogrodowe od sąsiadów z Mińska Mazowieckiego i okolicznych sołectw.',
    heading: 'Ogród i Rośliny',
  },
  moto: {
    title: 'Motoryzacja Mińsk Mazowiecki — opony, części, akcesoria',
    description:
      'Ogłoszenia motoryzacyjne mieszkańców Mińska Mazowieckiego: felgi, opony, bagażniki dachowe i akcesoria samochodowe.',
    heading: 'Motoryzacja',
  },
  lost: {
    title: 'Zgubione i Znalezione Mińsk Mazowiecki — zwierzęta, klucze, dokumenty',
    description:
      'Biuro rzeczy znalezionych i alerty o zagubionych zwierzętach na ulicach Mińska Mazowieckiego.',
    heading: 'Zgubione / Znalezione',
  },
};
