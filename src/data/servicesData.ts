export type ServiceCategoryId =
  | 'all'
  | 'instalacje'
  | 'remonty'
  | 'stolarz'
  | 'ogrod'
  | 'auto';

export type ServiceSortOption = 'rating' | 'reviews' | 'experience' | 'alpha';

export interface ServiceCategory {
  id: ServiceCategoryId;
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  suggestedTags: string[];
  tone: {
    bg: string;
    text: string;
    active: string;
    border: string;
  };
}

export interface ServicePortfolioItem {
  id: string;
  imageUrl: string;
  caption: string;
  locationLabel?: string;
}

export interface ServiceReview {
  id: string;
  providerId: string;
  authorId?: string | null;
  authorName: string;
  authorStreet: string;
  authorSeed: string;
  rating: number; // 1 - 5
  comment: string;
  serviceTag?: string;
  providerReply?: string;
  providerReplyAt?: string;
  createdAt: string;
  timeLabel: string;
  reported?: boolean;
}

export interface ServiceProvider {
  id: string;
  authorId?: string | null;
  name: string;
  businessName: string;
  categoryId: Exclude<ServiceCategoryId, 'all'>;
  tags: string[];
  street: string;
  city: string;
  avatarSeed: string;
  /** Optional company logotype URL / Data URI. If omitted, UI falls back to resident avatar (`avatarSeed`). */
  logoUrl?: string | null;
  description: string;
  phone: string;
  yearsExperience: number;
  verifiedByAdmin: boolean;
  status: 'verified' | 'pending_verification';
  promoted?: boolean;
  portfolio: ServicePortfolioItem[];
  reviews: ServiceReview[];
  createdAt: string;
}

/**
 * Generates a crisp SVG company logotype data URI for local businesses that have a brand logo.
 */
export function createCompanyLogoDataUri(config: {
  monogram: string;
  subtext?: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
  textColor?: string;
}): string {
  const { monogram, subtext = '', bgStart, bgEnd, accent, textColor = '#ffffff' } = config;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="28" fill="url(#g)"/>
    <circle cx="98" cy="22" r="26" fill="${accent}" fill-opacity="0.18"/>
    <rect x="14" y="14" width="92" width-height="92" height="92" rx="20" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
    <text x="60" y="${subtext ? '62' : '70'}" text-anchor="middle" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${monogram.length > 3 ? '26' : '33'}" letter-spacing="-0.5">${monogram}</text>
    ${
      subtext
        ? `<rect x="24" y="76" width="72" height="18" rx="6" fill="${accent}"/>
           <text x="60" y="88" text-anchor="middle" fill="#101820" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="9.5" letter-spacing="0.8">${subtext}</text>`
        : ''
    }
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'all',
    slug: 'wszystkie',
    label: 'Wszystkie usługi',
    shortLabel: 'Wszystkie',
    description: 'Pełny katalog zweryfikowanych wykonawców i firm usługowych z Mińska Mazowieckiego i Gminy.',
    suggestedTags: [],
    tone: {
      bg: 'bg-sand-100',
      text: 'text-sand-900',
      active: 'bg-ink text-white',
      border: 'border-sand-300',
    },
  },
  {
    id: 'instalacje',
    slug: 'hydraulika-i-instalacje',
    label: 'Hydraulika i Instalacje',
    shortLabel: 'Instalacje',
    description: 'Instalacje wodno-kanalizacyjne, centralne ogrzewanie, pompy ciepła, gaz oraz elektryka.',
    suggestedTags: [
      'Pogotowie hydrauliczne',
      'Instalacje wod-kan i CO',
      'Pompy ciepła i kotłownie',
      'Instalacje elektryczne SEP',
      'Instalacje gazowe',
      'Klimatyzacja',
    ],
    tone: {
      bg: 'bg-sky-100',
      text: 'text-sky-900',
      active: 'bg-sky-700 text-white',
      border: 'border-sky-300',
    },
  },
  {
    id: 'remonty',
    slug: 'remonty-i-wykonczenia',
    label: 'Remonty i Wykończenia',
    shortLabel: 'Remonty',
    description: 'Wykończenia mieszkań pod klucz, glazurnik, łazienki, malowanie, gładzie oraz zabudowy G-K.',
    suggestedTags: [
      'Łazienki i glazurnik',
      'Wykończenia pod klucz',
      'Malowanie i gładzie',
      'Zabudowy G-K i poddasza',
      'Elewacje i docieplenia',
      'Drobne naprawy domowe',
    ],
    tone: {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      active: 'bg-amber-700 text-white',
      border: 'border-amber-300',
    },
  },
  {
    id: 'stolarz',
    slug: 'meble-i-stolarstwo',
    label: 'Meble i Stolarstwo',
    shortLabel: 'Stolarstwo',
    description: 'Kuchnie na wymiar, szafy wnękowe, garderoby, schody drewniane oraz montaż drzwi i okien.',
    suggestedTags: [
      'Kuchnie na wymiar',
      'Szafy wnękowe i garderoby',
      'Schody drewniane',
      'Montaż drzwi i okien',
      'Renowacja mebli',
      'Blaty i zabudowy drewniane',
    ],
    tone: {
      bg: 'bg-orange-100',
      text: 'text-orange-900',
      active: 'bg-orange-700 text-white',
      border: 'border-orange-300',
    },
  },
  {
    id: 'ogrod',
    slug: 'ogrod-i-otoczenie',
    label: 'Ogród i Otoczenie',
    shortLabel: 'Ogród',
    description: 'Zakładanie i pielęgnacja ogrodów, trawniki, nawadnianie, przycinka drzew oraz kostka brukowa.',
    suggestedTags: [
      'Pielęgnacja ogrodów',
      'Układanie kostki brukowej',
      'Systemy nawadniania',
      'Wycinka i przycinka drzew',
      'Zakładanie trawników',
      'Tarasy i ogrodzenia',
    ],
    tone: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      active: 'bg-emerald-700 text-white',
      border: 'border-emerald-300',
    },
  },
  {
    id: 'auto',
    slug: 'motoryzacja',
    label: 'Motoryzacja',
    shortLabel: 'Motoryzacja',
    description: 'Mechanika pojazdowa, diagnostyka komputerowa, wymiana opon, serwis klimatyzacji i auto detailing.',
    suggestedTags: [
      'Mechanika pojazdowa',
      'Wulkanizacja i opony',
      'Serwis klimatyzacji',
      'Diagnostyka komputerowa',
      'Auto detailing',
      'Pomoc drogowa',
    ],
    tone: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-900',
      active: 'bg-indigo-700 text-white',
      border: 'border-indigo-300',
    },
  },
];

export const INITIAL_SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'sp_1',
    name: 'Marek Kowalski',
    businessName: 'MK-Instal Technika Grzewcza i Sanitarna',
    categoryId: 'instalacje',
    tags: ['Instalacje wod-kan i CO', 'Pompy ciepła i kotłownie', 'Pogotowie hydrauliczne', 'Instalacje gazowe'],
    street: 'Kościuszki',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Marek-Kosciuszki',
    logoUrl: createCompanyLogoDataUri({
      monogram: 'MK',
      subtext: 'INSTAL',
      bgStart: '#0c4a6e',
      bgEnd: '#0369a1',
      accent: '#38bdf8',
    }),
    description:
      'Od 14 lat wykonuję oraz modernizuję instalacje wodno-kanalizacyjne, gazowe i grzewcze na terenie Mińska Mazowieckiego oraz całej gminy. Posiadam pełne uprawnienia gazowe G3 oraz certyfikaty instalatora pomp ciepła.',
    phone: '+48 501 420 811',
    yearsExperience: 14,
    verifiedByAdmin: true,
    status: 'verified',
    promoted: false,
    createdAt: '2026-09-10T10:00:00.000Z',
    portfolio: [
      {
        id: 'port_1_1',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80',
        caption: 'Montaż kotłowni z pompą ciepła i buforem',
        locationLabel: 'ul. Spacerowa, Mińsk Maz.',
      },
      {
        id: 'port_1_2',
        imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80',
        caption: 'Rozdzielacz ogrzewania podłogowego — 11 pętli',
        locationLabel: 'Stojadła',
      },
      {
        id: 'port_1_3',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
        caption: 'Kompleksowa instalacja podtynkowa w łazience',
        locationLabel: 'os. Serbinów',
      },
    ],
    reviews: [
      {
        id: 'rev_1_1',
        providerId: 'sp_1',
        authorName: 'Kasia',
        authorStreet: 'Spacerowa',
        authorSeed: 'Kasia-Spacerowa',
        rating: 5,
        serviceTag: 'Pompy ciepła i kotłownie',
        comment:
          'Pan Marek wykonywał u nas całą kotłownię i podłogówkę. Wszystko ułożone od linijki, rzetelnie wytłumaczone działanie sterowników i zostawiony idealny porządek.',
        providerReply:
          'Bardzo dziękuję Pani Kasiu za zaufanie i miłe słowa! Niech instalacja bezawaryjnie służy przez długie lata.',
        providerReplyAt: '2 dni temu',
        createdAt: '2026-10-28T14:20:00.000Z',
        timeLabel: '3 dni temu',
      },
      {
        id: 'rev_1_2',
        providerId: 'sp_1',
        authorName: 'Tomasz',
        authorStreet: 'Sosnkowskiego',
        authorSeed: 'Tomasz-Sosnkowskiego',
        rating: 5,
        serviceTag: 'Pogotowie hydrauliczne',
        comment:
          'Pęknięty zawór pod zlewem w sobotnie popołudnie. Pan Marek przyjechał w 40 minut z częściami na wymianę i uratował nam parkiet w kuchni.',
        createdAt: '2026-10-20T18:10:00.000Z',
        timeLabel: 'tydzień temu',
      },
      {
        id: 'rev_1_3',
        providerId: 'sp_1',
        authorName: 'Andrzej',
        authorStreet: 'Dąbrówki',
        authorSeed: 'Andrzej-Dabrowki',
        rating: 5,
        serviceTag: 'Instalacje gazowe',
        comment:
          'Szybka próba szczelności gazu wraz z protokołem do spółdzielni i podłączenie nowej płyty. Konkretny i słowny sąsiad.',
        createdAt: '2026-10-12T09:30:00.000Z',
        timeLabel: '2 tygodnie temu',
      },
    ],
  },
  {
    id: 'sp_2',
    name: 'Łukasz Zieliński',
    businessName: 'Łukasz Zieliński — Instalacje Elektryczne SEP',
    categoryId: 'instalacje',
    tags: ['Instalacje elektryczne SEP', 'Rozdzielnice i pomiary', 'Oświetlenie i osprzęt'],
    street: 'Warszawska',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Lukasz-Warszawska',
    // Individual specialist without company logo -> displays resident avatar
    logoUrl: null,
    description:
      'Inżynier elektryk z uprawnieniami SEP E+D do 15kV oraz pomiarowymi. Wykonuję nowe instalacje elektryczne, modernizacje starych rozdzielnic w blokach i domach jednorodzinnych oraz pomiary odbiorcze.',
    phone: '+48 604 892 310',
    yearsExperience: 11,
    verifiedByAdmin: true,
    status: 'verified',
    promoted: false,
    createdAt: '2026-09-12T11:00:00.000Z',
    portfolio: [
      {
        id: 'port_2_1',
        imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
        caption: 'Sznurowanie i opis rozdzielnicy 72-modułowej w domu jednorodzinnym',
        locationLabel: 'Nowe Osiny',
      },
      {
        id: 'port_2_2',
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80',
        caption: 'Montaż automatyki i wideodomofonu IP',
        locationLabel: 'ul. Boczna, Mińsk Maz.',
      },
    ],
    reviews: [
      {
        id: 'rev_2_1',
        providerId: 'sp_2',
        authorName: 'Michał',
        authorStreet: 'Piękna',
        authorSeed: 'Michal-Piekna',
        rating: 5,
        serviceTag: 'Instalacje elektryczne SEP',
        comment:
          'Rozdzielnica zrobiona jak dzieło sztuki – każdy obwód czytelnie opisany, wykonane pełne pomiary rezystancji izolacji pod odbiór budynku.',
        providerReply: 'Dzięki Panie Michale! Bezpieczeństwo i czytelność w rozdzielnicy to podstawa.',
        providerReplyAt: '4 dni temu',
        createdAt: '2026-10-25T16:00:00.000Z',
        timeLabel: '5 dni temu',
      },
      {
        id: 'rev_2_2',
        providerId: 'sp_2',
        authorName: 'Ewelina',
        authorStreet: 'Siennicka',
        authorSeed: 'Ewelina-Siennicka',
        rating: 5,
        serviceTag: 'Instalacje elektryczne SEP',
        comment:
          'Szybka diagnoza zwarcia w instalacji i wymiana bezpieczników w mieszkaniu. Punktualnie i bardzo czysto.',
        createdAt: '2026-10-16T12:15:00.000Z',
        timeLabel: '2 tygodnie temu',
      },
    ],
  },
  {
    id: 'sp_3',
    name: 'Krzysztof Dąbrowski',
    businessName: 'Stolarnia Dąbrowscy — Kuchnie i Meble na Wymiar',
    categoryId: 'stolarz',
    tags: ['Kuchnie na wymiar', 'Szafy wnękowe i garderoby', 'Schody drewniane'],
    street: 'Stojadła',
    city: 'Gmina Mińsk Mazowiecki',
    avatarSeed: 'Krzysztof-Stojadla',
    logoUrl: createCompanyLogoDataUri({
      monogram: 'SD',
      subtext: 'STOLARNIA',
      bgStart: '#7c2d12',
      bgEnd: '#9a3412',
      accent: '#fdba74',
    }),
    description:
      'Rodzinna stolarnia w Stojadłach pod Mińskiem. Projektujemy i produkujemy kuchnie na wymiar, szafy wnękowe, garderoby, blaty dębowe oraz schody drewniane. Pracujemy na okuciach Blum i Peka.',
    phone: '+48 512 774 900',
    yearsExperience: 18,
    verifiedByAdmin: true,
    status: 'verified',
    promoted: false,
    createdAt: '2026-09-14T09:00:00.000Z',
    portfolio: [
      {
        id: 'port_3_1',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
        caption: 'Zabudowa kuchenna z wyspą — lakier mat + fornir dębowy',
        locationLabel: 'ul. Kazikowskiego, Mińsk Maz.',
      },
      {
        id: 'port_3_2',
        imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80',
        caption: 'Garderoba pod skosem z oświetleniem LED w profilach',
        locationLabel: 'Stare Osiny',
      },
    ],
    reviews: [
      {
        id: 'rev_3_1',
        providerId: 'sp_3',
        authorName: 'Marta',
        authorStreet: 'Kazikowskiego',
        authorSeed: 'Marta-Kazikowskiego',
        rating: 5,
        serviceTag: 'Kuchnie na wymiar',
        comment:
          'Kuchnia marzeń wykonana co do milimetra! Pan Krzysztof doradził świetne rozwiązania w narożnikach, a montaż trwał dokładnie dwa dni.',
        providerReply: 'Dziękujemy Pani Marto! Niech kuchnia dobrze służy całej rodzinie.',
        providerReplyAt: 'tydzień temu',
        createdAt: '2026-10-19T19:40:00.000Z',
        timeLabel: 'tydzień temu',
      },
      {
        id: 'rev_3_2',
        providerId: 'sp_3',
        authorName: 'Paweł',
        authorStreet: 'Tartaczna',
        authorSeed: 'Pawel-Tartaczna',
        rating: 5,
        serviceTag: 'Szafy wnękowe i garderoby',
        comment:
          'Trzy szafy w zabudowie i szafka łazienkowa. Lokalny producent ze Stojadeł, wszystko mogliśmy obejrzeć na żywo w stolarni.',
        createdAt: '2026-10-05T11:20:00.000Z',
        timeLabel: '3 tygodnie temu',
      },
    ],
  },
  {
    id: 'sp_4',
    name: 'Piotr Nowak',
    businessName: 'Piotr Nowak — Glazurnik i Wykończenia Wnętrz',
    categoryId: 'remonty',
    tags: ['Łazienki i glazurnik', 'Wykończenia pod klucz', 'Malowanie i gładzie', 'Zabudowy G-K i poddasza'],
    street: 'Serbinów',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Piotr-Serbinow',
    // Individual specialist -> uses resident avatar
    logoUrl: null,
    description:
      'Brygada remontowo-wykończeniowa z Mińska Mazowieckiego. Realizujemy wykończenia mieszkań ze stanu deweloperskiego pod klucz, generalne remonty łazienek (wielki format, cięcie 45°), gładzie bezpyłowe oraz malowanie.',
    phone: '+48 508 319 442',
    yearsExperience: 12,
    verifiedByAdmin: true,
    status: 'verified',
    promoted: false,
    createdAt: '2026-09-18T08:00:00.000Z',
    portfolio: [
      {
        id: 'port_4_1',
        imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80',
        caption: 'Łazienka w gresie wielkoformatowym 120x60 ze strefą walk-in',
        locationLabel: 'ul. Sosnkowskiego, Mińsk Maz.',
      },
      {
        id: 'port_4_2',
        imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
        caption: 'Wykończenie salonu pod klucz — gładzie, sufity podwieszane LED',
        locationLabel: 'os. Serbinów',
      },
    ],
    reviews: [
      {
        id: 'rev_4_1',
        providerId: 'sp_4',
        authorName: 'Karolina',
        authorStreet: 'Sosnkowskiego',
        authorSeed: 'Karolina-Sosnkowskiego',
        rating: 5,
        serviceTag: 'Łazienki i glazurnik',
        comment:
          'Płytki 120x60 położone idealnie, szlifowanie narożników na 45 stopni bez listew wyszło przepięknie. Ekipa punktualna.',
        createdAt: '2026-10-22T15:00:00.000Z',
        timeLabel: 'tydzień temu',
      },
      {
        id: 'rev_4_2',
        providerId: 'sp_4',
        authorName: 'Grzegorz',
        authorStreet: 'Okrzei',
        authorSeed: 'Grzegorz-Okrzei',
        rating: 5,
        serviceTag: 'Malowanie i gładzie',
        comment:
          'Bardzo wysoka jakość gładzi i malowania całego piętra. Zdecydowanie warto polecić sąsiadom.',
        createdAt: '2026-10-14T10:00:00.000Z',
        timeLabel: '2 tygodnie temu',
      },
    ],
  },
  {
    id: 'sp_5',
    name: 'Damian Mazur',
    businessName: 'Zielony Mińsk — Projektowanie Ogrodów i Brukarstwo',
    categoryId: 'ogrod',
    tags: ['Pielęgnacja ogrodów', 'Układanie kostki brukowej', 'Systemy nawadniania', 'Zakładanie trawników'],
    street: 'Dąbrówki',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Damian-Dabrowki',
    logoUrl: createCompanyLogoDataUri({
      monogram: 'ZM',
      subtext: 'OGRÓD',
      bgStart: '#064e3b',
      bgEnd: '#047857',
      accent: '#6ee7b7',
    }),
    description:
      'Kompleksowe zagospodarowanie ogrodów i posesji w powiecie mińskim. Zakładamy trawniki z rolki i siewu, automatyczne systemy nawadniania, wykonujemy nasadzenia, przycinkę drzew oraz układamy podjazdy i ścieżki z kostki brukowej.',
    phone: '+48 693 118 205',
    yearsExperience: 9,
    verifiedByAdmin: true,
    status: 'verified',
    promoted: false,
    createdAt: '2026-09-20T12:00:00.000Z',
    portfolio: [
      {
        id: 'port_5_1',
        imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80',
        caption: 'Założenie trawnika z rolki wraz z nawadnianiem i podjazdem',
        locationLabel: 'Huta Mińska',
      },
    ],
    reviews: [
      {
        id: 'rev_5_1',
        providerId: 'sp_5',
        authorName: 'Robert',
        authorStreet: 'Huta Mińska',
        authorSeed: 'Robert-HutaMinska',
        rating: 5,
        serviceTag: 'Układanie kostki brukowej',
        comment:
          '180 m² podjazdu i trawnik wokół domu zrobione w 6 dni. Porządna podbudowa, spadki wyprowadzone z niwelatorem – po ulewach zero kałuż.',
        createdAt: '2026-10-18T17:45:00.000Z',
        timeLabel: 'tydzień temu',
      },
    ],
  },
  {
    id: 'sp_6',
    name: 'Michał Jabłoński',
    businessName: 'Auto-Tech Mińsk — Mechanika Pojazdowa i Serwis',
    categoryId: 'auto',
    tags: ['Mechanika pojazdowa', 'Wulkanizacja i opony', 'Serwis klimatyzacji', 'Diagnostyka komputerowa'],
    street: 'Siennicka',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Michal-Siennicka',
    logoUrl: createCompanyLogoDataUri({
      monogram: 'AT',
      subtext: 'AUTO·TECH',
      bgStart: '#1e1b4b',
      bgEnd: '#3730a3',
      accent: '#a5b4fc',
    }),
    description:
      'Niezależny warsztat samochodowy w Mińsku Mazowieckim. Wykonujemy bieżące naprawy zawieszenia, układów hamulcowych, rozrządów i sprzęgieł, komputerową diagnostykę usterek, serwis klimatyzacji oraz wymianę opon.',
    phone: '+48 509 312 400',
    yearsExperience: 13,
    verifiedByAdmin: true,
    status: 'verified',
    promoted: false,
    createdAt: '2026-09-21T10:00:00.000Z',
    portfolio: [],
    reviews: [
      {
        id: 'rev_6_1',
        providerId: 'sp_6',
        authorName: 'Kamil',
        authorStreet: 'Tuwima',
        authorSeed: 'Kamil-Tuwima',
        rating: 5,
        serviceTag: 'Mechanika pojazdowa',
        comment:
          'Uczciwy warsztat – stare części zawsze do wglądu, kosztorys podany przed naprawą co do złotówki. Rozrząd i hamulce zrobione jednego dnia.',
        createdAt: '2026-10-21T11:00:00.000Z',
        timeLabel: 'tydzień temu',
      },
    ],
  },
  {
    id: 'sp_7',
    name: 'Tomek Wiśniewski',
    businessName: 'Tomek Wiśniewski — Malowanie, Gładzie i Drobne Naprawy',
    categoryId: 'remonty',
    tags: ['Malowanie i gładzie', 'Drobne naprawy domowe', 'Zabudowy G-K i poddasza'],
    street: 'Spacerowa',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Tomek-Spacerowa',
    // Individual specialist -> uses resident avatar
    logoUrl: null,
    description:
      'Dokładne malowanie mieszkań i domów, szpachlowanie, naprawy pęknięć na ścianach i sufitach, montaż listew przypodłogowych, karniszy oraz składanie i wieszanie szafek u sąsiadów w Mińsku.',
    phone: '+48 668 410 290',
    yearsExperience: 9,
    verifiedByAdmin: true,
    status: 'verified',
    promoted: false,
    createdAt: '2026-09-22T09:00:00.000Z',
    portfolio: [],
    reviews: [
      {
        id: 'rev_7_1',
        providerId: 'sp_7',
        authorName: 'Beata',
        authorStreet: 'Kopernika',
        authorSeed: 'Beata-Kopernika',
        rating: 5,
        serviceTag: 'Malowanie i gładzie',
        comment:
          'Pomalowane trzy pokoje i przedpokój w dwa dni. Wszystko dokładnie oklejone folią, po pracy ani jednej kropli farby na podłodze.',
        createdAt: '2026-10-23T16:15:00.000Z',
        timeLabel: '6 dni temu',
      },
    ],
  },
  {
    id: 'sp_8',
    name: 'Grzegorz Kamiński',
    businessName: 'Klima-Mińsk — Montaż i Serwis Klimatyzacji',
    categoryId: 'instalacje',
    tags: ['Klimatyzacja', 'Pompy ciepła i kotłownie', 'Instalacje elektryczne SEP'],
    street: 'Sosnkowskiego',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Grzegorz-Sosnkowskiego',
    logoUrl: createCompanyLogoDataUri({
      monogram: 'KM',
      subtext: 'KLIMA',
      bgStart: '#0369a1',
      bgEnd: '#0284c7',
      accent: '#7dd3fc',
    }),
    description:
      'Autoryzowany montaż i coroczny serwis klimatyzacji domowej oraz biurowej (Gree, Rotenso, Mitsubishi) na terenie Mińska Mazowieckiego i powiatu. Posiadam certyfikat F-Gaz z UDT.',
    phone: '+48 514 820 330',
    yearsExperience: 8,
    verifiedByAdmin: false,
    status: 'pending_verification',
    promoted: false,
    createdAt: '2026-10-31T19:30:00.000Z',
    portfolio: [
      {
        id: 'port_8_1',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80',
        caption: 'Montaż klimatyzatora ściennego Multisplit w mieszkaniu',
        locationLabel: 'ul. Sosnkowskiego, Mińsk Maz.',
      },
    ],
    reviews: [],
  },
  {
    id: 'sp_9',
    name: 'Rafał Wójcik',
    businessName: 'Rafał Wójcik — Montaż Drzwi, Okien i Podłóg',
    categoryId: 'stolarz',
    tags: ['Montaż drzwi i okien', 'Renowacja mebli', 'Blaty i zabudowy drewniane'],
    street: 'Kazikowskiego',
    city: 'Mińsk Mazowiecki',
    avatarSeed: 'Rafal-Kazikowskiego',
    logoUrl: null,
    description:
      'Profesjonalny montaż drzwi wewnętrznych i wejściowych (bezprzylgowe, ukryte ościeżnice), układanie deski warstwowej, paneli winylowych w jodełkę oraz regulacja okien przed zimą.',
    phone: '+48 607 912 450',
    yearsExperience: 10,
    verifiedByAdmin: false,
    status: 'pending_verification',
    promoted: false,
    createdAt: '2026-10-31T21:15:00.000Z',
    portfolio: [],
    reviews: [],
  },
];

export function getServiceCategoryById(id: ServiceCategoryId): ServiceCategory {
  return SERVICE_CATEGORIES.find((c) => c.id === id) || SERVICE_CATEGORIES[0];
}

export function getServiceCategoryBySlug(slug: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((c) => c.slug === slug);
}

export function computeProviderRatingStats(reviews: ServiceReview[]): {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
} {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (!reviews || reviews.length === 0) {
    return { average: 0, count: 0, distribution };
  }
  let sum = 0;
  for (const r of reviews) {
    const clamped = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[clamped] += 1;
    sum += r.rating;
  }
  const average = Math.round((sum / reviews.length) * 10) / 10;
  return { average, count: reviews.length, distribution };
}

export function filterAndSortServiceProviders(
  providers: ServiceProvider[],
  options: {
    categoryId: ServiceCategoryId;
    searchQuery: string;
    sortBy: ServiceSortOption;
    selectedTags?: string[];
    selectedStreet?: string | null;
    currentUserAuthorId?: string | null;
    currentUserName?: string | null;
  },
): ServiceProvider[] {
  const {
    categoryId,
    searchQuery,
    sortBy,
    selectedTags = [],
    selectedStreet,
    currentUserAuthorId,
    currentUserName,
  } = options;
  const q = searchQuery.trim().toLowerCase();

  const filtered = providers.filter((p) => {
    const isOwnProfile =
      (currentUserAuthorId && p.authorId === currentUserAuthorId) ||
      (currentUserName && p.name.toLowerCase().includes(currentUserName.toLowerCase()));
    if (p.status !== 'verified' && !isOwnProfile) {
      return false;
    }

    if (categoryId !== 'all' && p.categoryId !== categoryId) {
      return false;
    }

    if (selectedTags.length > 0 && !selectedTags.some((tag) => p.tags.includes(tag))) {
      return false;
    }

    if (selectedStreet && p.street !== selectedStreet) {
      return false;
    }

    if (q.length > 0) {
      const cat = getServiceCategoryById(p.categoryId);
      const haystack = [
        p.name,
        p.businessName,
        p.street,
        p.city,
        p.description,
        cat.label,
        ...p.tags,
      ]
        .join(' ')
        .toLowerCase();

      const words = q.split(/\s+/).filter(Boolean);
      const matchesAll = words.every((w) => haystack.includes(w));
      if (!matchesAll) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    const statsA = computeProviderRatingStats(a.reviews);
    const statsB = computeProviderRatingStats(b.reviews);

    if (sortBy === 'rating') {
      if (statsB.average !== statsA.average) return statsB.average - statsA.average;
      return statsB.count - statsA.count;
    }
    if (sortBy === 'reviews') {
      if (statsB.count !== statsA.count) return statsB.count - statsA.count;
      return statsB.average - statsA.average;
    }
    if (sortBy === 'experience') {
      if (b.yearsExperience !== a.yearsExperience) return b.yearsExperience - a.yearsExperience;
      return statsB.average - statsA.average;
    }
    return a.businessName.localeCompare(b.businessName, 'pl');
  });
}
