// Dane demonstracyjne mójMińsk — realia Mińska Mazowieckiego
export type Tone = 'coral' | 'sky' | 'sand';
export type LineId = 'M1' | 'M2' | 'M3' | 'M4';

const img = (id: string, w = 600) => `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=75`;

export const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ebc999,8ca9d3,f26659,fddfdb`;

export const getAdAuthorSeed = (
  ad: { author: string; street: string; authorAvatarSeed?: string; authorId?: string | null; isOwner?: boolean },
  currentUser?: User | null,
): string => {
  const isOwner = Boolean(
    currentUser && (
      ad.isOwner ||
      (currentUser.profileId && ad.authorId && ad.authorId === currentUser.profileId) ||
      (!ad.authorId && ad.author.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
    )
  );
  if (isOwner && currentUser?.seed) {
    return currentUser.seed;
  }
  return ad.authorAvatarSeed || `${ad.author}-${ad.street}`;
};

/* ---------------- Użytkownik i ulice ---------------- */
export interface Street {
  name: string;
  as: string; // forma "z/ze ..." do podpisu
  neighbors: number;
}

export function formatNeighborCount(count: number): string {
  if (!count || count <= 0) return "Bądź pierwszy!";
  if (count === 1) return "1 sąsiad";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} sąsiedzi`;
  }
  return `${count} sąsiadów`;
}

export interface UserPrivacy {
  showStats: boolean;
  showPastAds: boolean;
  showRides: boolean;
}

export interface User {
  profileId?: string;
  name: string;
  surname?: string;
  email?: string;
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
  isAdmin?: boolean;
}

export const gminaCities: string[] = [
  'Mińsk Mazowiecki',
  'Stojadła',
  'Nowe Osiny',
  'Stare Osiny',
  'Huta Mińska',
  'Karolina',
  'Arynów',
  'Barcząca',
  'Brzóze',
  'Budy Barcząckie',
  'Cielechowizna',
  'Dłużka',
  'Gliniak',
  'Grębiszew',
  'Ignaców',
  'Janów',
  'Józefów',
  'Kolonia Janów',
  'Maliszew',
  'Marianka',
  'Mikanów',
  'Niedziałka',
  'Oględzin',
  'Podrudzie',
  'Pruszynek',
  'Tartak',
  'Wólka Iłówiecka',
  'Wólka Mińska',
  'Zamienie',
  'Żuków',
];

export interface PostalAreaOption {
  postalCode: string;
  city: string;
  locality?: string;
  label: string;
  isGmina?: boolean;
}

export const minskPostalAreas: PostalAreaOption[] = [
  // Miasto Mińsk Mazowiecki
  { postalCode: '05-300', city: 'Mińsk Mazowiecki', label: 'Mińsk Mazowiecki (miasto · 05-300)' },
  { postalCode: '05-301', city: 'Mińsk Mazowiecki', label: 'Mińsk Mazowiecki (UP Mińsk 1 · 05-301)' },
  { postalCode: '05-302', city: 'Mińsk Mazowiecki', label: 'Mińsk Mazowiecki (FUP Mińsk · 05-302)' },
  { postalCode: '05-303', city: 'Mińsk Mazowiecki', label: 'Mińsk Mazowiecki (FUP Mińsk · 05-303)' },
  // Gmina Mińsk Mazowiecki - sołectwa i miejscowości
  { postalCode: '05-300', city: 'Stojadła', locality: 'gm. Mińsk Mazowiecki', label: 'Stojadła (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Nowe Osiny', locality: 'gm. Mińsk Mazowiecki', label: 'Nowe Osiny (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Stare Osiny', locality: 'gm. Mińsk Mazowiecki', label: 'Stare Osiny (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Huta Mińska', locality: 'gm. Mińsk Mazowiecki', label: 'Huta Mińska (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Karolina', locality: 'gm. Mińsk Mazowiecki', label: 'Karolina (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Arynów', locality: 'gm. Mińsk Mazowiecki', label: 'Arynów (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Barcząca', locality: 'gm. Mińsk Mazowiecki', label: 'Barcząca (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Brzóze', locality: 'gm. Mińsk Mazowiecki', label: 'Brzóze (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Budy Barcząckie', locality: 'gm. Mińsk Mazowiecki', label: 'Budy Barcząckie (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Cielechowizna', locality: 'gm. Mińsk Mazowiecki', label: 'Cielechowizna (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Dłużka', locality: 'gm. Mińsk Mazowiecki', label: 'Dłużka (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Gliniak', locality: 'gm. Mińsk Mazowiecki', label: 'Gliniak (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Grębiszew', locality: 'gm. Mińsk Mazowiecki', label: 'Grębiszew (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Ignaców', locality: 'gm. Mińsk Mazowiecki', label: 'Ignaców (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Janów', locality: 'gm. Mińsk Mazowiecki', label: 'Janów (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Józefów', locality: 'gm. Mińsk Mazowiecki', label: 'Józefów (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Kolonia Janów', locality: 'gm. Mińsk Mazowiecki', label: 'Kolonia Janów (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Marianka', locality: 'gm. Mińsk Mazowiecki', label: 'Marianka (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Mikanów', locality: 'gm. Mińsk Mazowiecki', label: 'Mikanów (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Niedziałka', locality: 'gm. Mińsk Mazowiecki', label: 'Niedziałka / Stara Niedziałka (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Podrudzie', locality: 'gm. Mińsk Mazowiecki', label: 'Podrudzie (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Tartak', locality: 'gm. Mińsk Mazowiecki', label: 'Tartak (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Wólka Mińska', locality: 'gm. Mińsk Mazowiecki', label: 'Wólka Mińska (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Zamienie', locality: 'gm. Mińsk Mazowiecki', label: 'Zamienie (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-300', city: 'Żuków', locality: 'gm. Mińsk Mazowiecki', label: 'Żuków (gm. Mińsk Maz. · 05-300)', isGmina: true },
  { postalCode: '05-311', city: 'Dębe Wielkie', locality: 'obszar gm. Mińsk Maz.', label: 'Obszar gminy / Dębe Wielkie (05-311)', isGmina: true },
  { postalCode: '05-332', city: 'Siennica', locality: 'obszar gm. Mińsk Maz.', label: 'Obszar gminy / Siennica (05-332)', isGmina: true },
];

export const gminaLocalityAs: Record<string, string> = {
  'Stojadła': 'ze Stojadeł',
  'Nowe Osiny': 'z Nowych Osin',
  'Stare Osiny': 'ze Starych Osin',
  'Huta Mińska': 'z Huty Mińskiej',
  'Karolina': 'z Karoliny',
  'Arynów': 'z Arynowa',
  'Barcząca': 'z Barczącej',
  'Brzóze': 'z Brzózego',
  'Budy Barcząckie': 'z Bud Barcząckich',
  'Cielechowizna': 'z Cielechowizny',
  'Dłużka': 'z Dłużki',
  'Gliniak': 'z Gliniaku',
  'Grębiszew': 'z Grębiszewa',
  'Ignaców': 'z Ignacowa',
  'Janów': 'z Janowa',
  'Józefów': 'z Józefowa',
  'Kolonia Janów': 'z Kolonii Janów',
  'Marianka': 'z Marianki',
  'Mikanów': 'z Mikanowa',
  'Niedziałka': 'z Niedziałki',
  'Podrudzie': 'z Podrudzia',
  'Tartak': 'z Tartaku',
  'Wólka Mińska': 'z Wólki Mińskiej',
  'Zamienie': 'z Zamienia',
  'Żuków': 'z Żukowa',
  'Dębe Wielkie': 'z Dębego Wielkiego',
  'Siennica': 'z Siennicy',
};

export const streets: Street[] = [
  // Najpopularniejsze ulice z największą liczbą mieszkańców
  { name: 'Spacerowa', as: 'ze Spacerowej', neighbors: 0 },
  { name: 'Sosnkowskiego', as: 'z Sosnkowskiego', neighbors: 0 },
  { name: 'Warszawska', as: 'z Warszawskiej', neighbors: 0 },
  { name: 'Kościuszki', as: 'z Kościuszki', neighbors: 0 },
  { name: 'Mickiewicza', as: 'z Mickiewicza', neighbors: 0 },
  { name: 'Siennicka', as: 'z Siennickiej', neighbors: 0 },
  { name: 'Chełmońskiego', as: 'z Chełmońskiego', neighbors: 0 },
  { name: 'Kazikowskiego', as: 'z Kazikowskiego', neighbors: 0 },
  { name: 'Budowlana', as: 'z Budowlanej', neighbors: 0 },
  { name: 'Dąbrówki', as: 'z Dąbrówki', neighbors: 0 },
  { name: 'Klonowa', as: 'z Klonowej', neighbors: 0 },
  { name: 'Szpitalna', as: 'ze Szpitalnej', neighbors: 0 },
  { name: 'Piękna', as: 'z Pięknej', neighbors: 0 },
  { name: 'Tartaczna', as: 'z Tartacznej', neighbors: 0 },
  { name: 'Licealna', as: 'z Licealnej', neighbors: 0 },
  { name: 'Łąkowa', as: 'z Łąkowej', neighbors: 0 },
  { name: 'Osiedlowa', as: 'z Osiedlowej', neighbors: 0 },
  { name: 'Kościelna', as: 'z Kościelnej', neighbors: 0 },
  { name: 'Mireckiego', as: 'z Mireckiego', neighbors: 0 },
  { name: 'Langiewicza', as: 'z Langiewicza', neighbors: 0 },

  // Pełny wykaz alfabetyczny ulic Mińska Mazowieckiego
  { name: '1 Maja', as: 'z 1 Maja', neighbors: 0 },
  { name: '11 Listopada', as: 'z 11 Listopada', neighbors: 0 },
  { name: 'Agrestowa', as: 'z Agrestowej', neighbors: 0 },
  { name: 'Akacjowa', as: 'z Akacjowej', neighbors: 0 },
  { name: 'Andersa', as: 'z Andersa', neighbors: 0 },
  { name: 'Anielin', as: 'z Anielina', neighbors: 0 },
  { name: 'Armii Krajowej', as: 'z Armii Krajowej', neighbors: 0 },
  { name: 'Asnyka', as: 'z Asnyka', neighbors: 0 },
  { name: 'Aurelii', as: 'z Aurelii', neighbors: 0 },
  { name: 'Bankowa', as: 'z Bankowej', neighbors: 0 },
  { name: 'Barlickiego', as: 'z Barlickiego', neighbors: 0 },
  { name: 'Batalionów Chłopskich', as: 'z Batalionów Chłopskich', neighbors: 0 },
  { name: 'Batorego', as: 'z Batorego', neighbors: 0 },
  { name: 'Bema', as: 'z Bema', neighbors: 0 },
  { name: 'Boczna', as: 'z Bocznej', neighbors: 0 },
  { name: 'Bohaterów Warszawy', as: 'z Bohaterów Warszawy', neighbors: 0 },
  { name: 'Borelowskiego', as: 'z Borelowskiego', neighbors: 0 },
  { name: 'Borowikowa', as: 'z Borowikowej', neighbors: 0 },
  { name: 'Botaniczna', as: 'z Botanicznej', neighbors: 0 },
  { name: 'Browarna', as: 'z Browarnej', neighbors: 0 },
  { name: 'Brzozowa', as: 'z Brzozowej', neighbors: 0 },
  { name: 'Bulwarna', as: 'z Bulwarnej', neighbors: 0 },
  { name: 'Bursztynowa', as: 'z Bursztynowej', neighbors: 0 },
  { name: 'Ceglana', as: 'z Ceglanej', neighbors: 0 },
  { name: 'Chrobrego', as: 'z Chrobrego', neighbors: 0 },
  { name: 'Cicha', as: 'z Cichej', neighbors: 0 },
  { name: 'Cmentarna', as: 'z Cmentarnej', neighbors: 0 },
  { name: 'Cyprysowa', as: 'z Cyprysowej', neighbors: 0 },
  { name: 'Czackiego', as: 'z Czackiego', neighbors: 0 },
  { name: 'Czarnieckiego', as: 'z Czarnieckiego', neighbors: 0 },
  { name: 'Czeska', as: 'z Czeskiej', neighbors: 0 },
  { name: 'Daszyńskiego', as: 'z Daszyńskiego', neighbors: 0 },
  { name: 'Dębowa', as: 'z Dębowej', neighbors: 0 },
  { name: 'Diamentowa', as: 'z Diamentowej', neighbors: 0 },
  { name: 'Długa', as: 'z Długiej', neighbors: 0 },
  { name: 'Dmowskiego', as: 'z Dmowskiego', neighbors: 0 },
  { name: 'Dolna', as: 'z Dolnej', neighbors: 0 },
  { name: 'Drzymały', as: 'z Drzymały', neighbors: 0 },
  { name: 'Działkowa', as: 'z Działkowej', neighbors: 0 },
  { name: 'Fabryczna', as: 'z Fabrycznej', neighbors: 0 },
  { name: 'Florencja', as: 'z Florencji', neighbors: 0 },
  { name: 'Fredry', as: 'z Fredry', neighbors: 0 },
  { name: 'Gałczyńskiego', as: 'z Gałczyńskiego', neighbors: 0 },
  { name: 'Gliniana', as: 'z Glinianej', neighbors: 0 },
  { name: 'Głowackiego', as: 'z Głowackiego', neighbors: 0 },
  { name: 'Górna', as: 'z Górnej', neighbors: 0 },
  { name: 'Graniczna', as: 'z Granicznej', neighbors: 0 },
  { name: 'Grochowska', as: 'z Grochowskiej', neighbors: 0 },
  { name: 'Grzybowa', as: 'z Grzybowej', neighbors: 0 },
  { name: 'Gwiaździsta', as: 'z Gwiaździstej', neighbors: 0 },
  { name: 'Harcerska', as: 'z Harcerskiej', neighbors: 0 },
  { name: 'Huberta', as: 'z Huberta', neighbors: 0 },
  { name: 'Hutnicza', as: 'z Hutniczej', neighbors: 0 },
  { name: 'Inwalidów Wojennych', as: 'z Inwalidów Wojennych', neighbors: 0 },
  { name: 'Jagodowa', as: 'z Jagodowej', neighbors: 0 },
  { name: 'Jana Pawła II', as: 'z Jana Pawła II', neighbors: 0 },
  { name: 'Jasińskiego', as: 'z Jasińskiego', neighbors: 0 },
  { name: 'Jasna', as: 'z Jasnej', neighbors: 0 },
  { name: 'Jaśminowa', as: 'z Jaśminowej', neighbors: 0 },
  { name: 'Jaworowa', as: 'z Jaworowej', neighbors: 0 },
  { name: 'Jesionowa', as: 'z Jesionowej', neighbors: 0 },
  { name: 'Jeżynowa', as: 'z Jeżynowej', neighbors: 0 },
  { name: 'Jodłowa', as: 'z Jodłowej', neighbors: 0 },
  { name: 'Kalinowa', as: 'z Kalinowej', neighbors: 0 },
  { name: 'Kasztanowa', as: 'z Kasztanowej', neighbors: 0 },
  { name: 'Kątna', as: 'z Kątnej', neighbors: 0 },
  { name: 'Kędzierak', as: 'z Kędzieraku', neighbors: 0 },
  { name: 'Kilińskiego', as: 'z Kilińskiego', neighbors: 0 },
  { name: 'Kolejowa', as: 'z Kolejowej', neighbors: 0 },
  { name: 'Kołłątaja', as: 'z Kołłątaja', neighbors: 0 },
  { name: 'Konopnickiej', as: 'z Konopnickiej', neighbors: 0 },
  { name: 'Konstytucji 3 Maja', as: 'z Konstytucji 3 Maja', neighbors: 0 },
  { name: 'Kopernika', as: 'z Kopernika', neighbors: 0 },
  { name: 'Koralowa', as: 'z Koralowej', neighbors: 0 },
  { name: 'Korczaka', as: 'z Korczaka', neighbors: 0 },
  { name: 'Krakowska', as: 'z Krakowskiej', neighbors: 0 },
  { name: 'Krasickiego', as: 'z Krasickiego', neighbors: 0 },
  { name: 'Kraszewskiego', as: 'z Kraszewskiego', neighbors: 0 },
  { name: 'Królewiecka', as: 'z Królewieckiej', neighbors: 0 },
  { name: 'Krótka', as: 'z Krótkiej', neighbors: 0 },
  { name: 'Krzywa', as: 'z Krzywej', neighbors: 0 },
  { name: 'Kwiatowa', as: 'z Kwiatowej', neighbors: 0 },
  { name: 'Lawendowa', as: 'z Lawendowej', neighbors: 0 },
  { name: 'Legionów', as: 'z Legionów', neighbors: 0 },
  { name: 'Leśna', as: 'z Leśnej', neighbors: 0 },
  { name: 'Letniskowa', as: 'z Letniskowej', neighbors: 0 },
  { name: 'Lipowa', as: 'z Lipowej', neighbors: 0 },
  { name: 'Lotników', as: 'z Lotników', neighbors: 0 },
  { name: 'Lwowska', as: 'ze Lwowskiej', neighbors: 0 },
  { name: 'Łukasińskiego', as: 'z Łukasińskiego', neighbors: 0 },
  { name: 'Magnolii', as: 'z Magnolii', neighbors: 0 },
  { name: 'Majowa', as: 'z Majowej', neighbors: 0 },
  { name: 'Makowa', as: 'z Makowej', neighbors: 0 },
  { name: 'Mała', as: 'z Małej', neighbors: 0 },
  { name: 'Malinowa', as: 'z Malinowej', neighbors: 0 },
  { name: 'Matejki', as: 'z Matejki', neighbors: 0 },
  { name: 'Mazowiecka', as: 'z Mazowieckiej', neighbors: 0 },
  { name: 'Mieszka I', as: 'z Mieszka I', neighbors: 0 },
  { name: 'Miła', as: 'z Miłej', neighbors: 0 },
  { name: 'Miodowa', as: 'z Miodowej', neighbors: 0 },
  { name: 'Młynarska', as: 'z Młynarskiej', neighbors: 0 },
  { name: 'Modrzewiowa', as: 'z Modrzewiowej', neighbors: 0 },
  { name: 'Mokra', as: 'z Mokrej', neighbors: 0 },
  { name: 'Moniuszki', as: 'z Moniuszki', neighbors: 0 },
  { name: 'Morelowa', as: 'z Morelowej', neighbors: 0 },
  { name: 'Myśliwska', as: 'z Myśliwskiej', neighbors: 0 },
  { name: 'Nadrzeczna', as: 'z Nadrzecznej', neighbors: 0 },
  { name: 'Nałkowskiej', as: 'z Nałkowskiej', neighbors: 0 },
  { name: 'Narutowicza', as: 'z Narutowicza', neighbors: 0 },
  { name: 'Niecała', as: 'z Niecałej', neighbors: 0 },
  { name: 'Niska', as: 'z Niskiej', neighbors: 0 },
  { name: 'Nowa', as: 'z Nowej', neighbors: 0 },
  { name: 'Nowomiejska', as: 'z Nowomiejskiej', neighbors: 0 },
  { name: 'Nowy Świat', as: 'z Nowego Światu', neighbors: 0 },
  { name: 'Ogrodowa', as: 'z Ogrodowej', neighbors: 0 },
  { name: 'Okrzei', as: 'z Okrzei', neighbors: 0 },
  { name: 'Olchowa', as: 'z Olchowej', neighbors: 0 },
  { name: 'Olszowa', as: 'z Olszowej', neighbors: 0 },
  { name: 'Orla', as: 'z Orlej', neighbors: 0 },
  { name: 'Orzechowa', as: 'z Orzechowej', neighbors: 0 },
  { name: 'Orzeszkowej', as: 'z Orzeszkowej', neighbors: 0 },
  { name: 'Paderewskiego', as: 'z Paderewskiego', neighbors: 0 },
  { name: 'Parkowa', as: 'z Parkowej', neighbors: 0 },
  { name: 'Partyzantów', as: 'z Partyzantów', neighbors: 0 },
  { name: 'PCK', as: 'z PCK', neighbors: 0 },
  { name: 'Piaskowa', as: 'z Piaskowej', neighbors: 0 },
  { name: 'Piłsudskiego', as: 'z Piłsudskiego', neighbors: 0 },
  { name: 'Plac Dworcowy', as: 'z Placu Dworcowego', neighbors: 0 },
  { name: 'Plac Kilińskiego', as: 'z Placu Kilińskiego', neighbors: 0 },
  { name: 'Plac Stary Rynek', as: 'ze Starego Rynku', neighbors: 0 },
  { name: 'Podgórna', as: 'z Podgórnej', neighbors: 0 },
  { name: 'Podleśna', as: 'z Podleśnej', neighbors: 0 },
  { name: 'Pogodna', as: 'z Pogodnej', neighbors: 0 },
  { name: 'Polna', as: 'z Polnej', neighbors: 0 },
  { name: 'Polowa', as: 'z Polowej', neighbors: 0 },
  { name: 'Poniatowskiego', as: 'z Poniatowskiego', neighbors: 0 },
  { name: 'Poprzeczna', as: 'z Poprzecznej', neighbors: 0 },
  { name: 'Porzeczkowa', as: 'z Porzeczkowej', neighbors: 0 },
  { name: 'Powstańców Warszawy', as: 'z Powstańców Warszawy', neighbors: 0 },
  { name: 'Północna', as: 'z Północnej', neighbors: 0 },
  { name: 'Promienna', as: 'z Promiennej', neighbors: 0 },
  { name: 'Prosta', as: 'z Prostej', neighbors: 0 },
  { name: 'Prusa', as: 'z Prusa', neighbors: 0 },
  { name: 'Przemysłowa', as: 'z Przemysłowej', neighbors: 0 },
  { name: 'Przyjaźni', as: 'z Przyjaźni', neighbors: 0 },
  { name: 'Pułaskiego', as: 'z Pułaskiego', neighbors: 0 },
  { name: 'Radosna', as: 'z Radosnej', neighbors: 0 },
  { name: 'Reja', as: 'z Reja', neighbors: 0 },
  { name: 'Reymonta', as: 'z Reymonta', neighbors: 0 },
  { name: 'Rolna', as: 'z Rolnej', neighbors: 0 },
  { name: 'Różana', as: 'z Różanej', neighbors: 0 },
  { name: 'Równa', as: 'z Równej', neighbors: 0 },
  { name: 'Rubinowa', as: 'z Rubinowej', neighbors: 0 },
  { name: 'Rybna', as: 'z Rybnej', neighbors: 0 },
  { name: 'Rzemieślnicza', as: 'z Rzemieślniczej', neighbors: 0 },
  { name: 'Sadowa', as: 'z Sadowej', neighbors: 0 },
  { name: 'Serbinowska', as: 'z Serbinowskiej', neighbors: 0 },
  { name: 'Sienkiewicza', as: 'z Sienkiewicza', neighbors: 0 },
  { name: 'Sikorskiego', as: 'z Sikorskiego', neighbors: 0 },
  { name: 'Skłodowskiej-Curie', as: 'ze Skłodowskiej-Curie', neighbors: 0 },
  { name: 'Słoneczna', as: 'ze Słonecznej', neighbors: 0 },
  { name: 'Słowackiego', as: 'ze Słowackiego', neighbors: 0 },
  { name: 'Sosnowa', as: 'z Sosnowej', neighbors: 0 },
  { name: 'Spokojna', as: 'ze Spokojnej', neighbors: 0 },
  { name: 'Sportowa', as: 'ze Sportowej', neighbors: 0 },
  { name: 'Spółdzielcza', as: 'ze Spółdzielczej', neighbors: 0 },
  { name: 'Srebrna', as: 'ze Srebrnej', neighbors: 0 },
  { name: 'Stalowa', as: 'ze Stalowej', neighbors: 0 },
  { name: 'Stankowizna', as: 'ze Stankowizny', neighbors: 0 },
  { name: 'Stara', as: 'ze Starej', neighbors: 0 },
  { name: 'Staszica', as: 'ze Staszica', neighbors: 0 },
  { name: 'Stolarska', as: 'ze Stolarskiej', neighbors: 0 },
  { name: 'Strażacka', as: 'ze Strażackiej', neighbors: 0 },
  { name: 'Strzelecka', as: 'ze Strzeleckiej', neighbors: 0 },
  { name: 'Szafirowa', as: 'z Szafirowej', neighbors: 0 },
  { name: 'Szeroka', as: 'z Szerokiej', neighbors: 0 },
  { name: 'Szkolna', as: 'ze Szkolnej', neighbors: 0 },
  { name: 'Świerkowa', as: 'ze Świerkowej', neighbors: 0 },
  { name: 'Świętokrzyska', as: 'ze Świętokrzyskiej', neighbors: 0 },
  { name: 'Targowa', as: 'z Targowej', neighbors: 0 },
  { name: 'Topolowa', as: 'z Topolowej', neighbors: 0 },
  { name: 'Torowa', as: 'z Torowej', neighbors: 0 },
  { name: 'Traugutta', as: 'z Traugutta', neighbors: 0 },
  { name: 'Truskawkowa', as: 'z Truskawkowej', neighbors: 0 },
  { name: 'Tuwima', as: 'z Tuwima', neighbors: 0 },
  { name: 'Wąska', as: 'z Wąskiej', neighbors: 0 },
  { name: 'Warszawskie Przedmieście', as: 'z Warszawskiego Przedmieścia', neighbors: 0 },
  { name: 'Wesoła', as: 'z Wesołej', neighbors: 0 },
  { name: 'Widok', as: 'z Widoku', neighbors: 0 },
  { name: 'Wiejska', as: 'z Wiejskiej', neighbors: 0 },
  { name: 'Wierzbowa', as: 'z Wierzbowej', neighbors: 0 },
  { name: 'Wiklinowa', as: 'z Wiklinowej', neighbors: 0 },
  { name: 'Wilcza', as: 'z Wilczej', neighbors: 0 },
  { name: 'Wiosenna', as: 'z Wiosennej', neighbors: 0 },
  { name: 'Wiśniowa', as: 'z Wiśniowej', neighbors: 0 },
  { name: 'Wodna', as: 'z Wodnej', neighbors: 0 },
  { name: 'Wojska Polskiego', as: 'z Wojska Polskiego', neighbors: 0 },
  { name: 'Wolności', as: 'z Wolności', neighbors: 0 },
  { name: 'Wrzosowa', as: 'z Wrzosowej', neighbors: 0 },
  { name: 'Wspólna', as: 'ze Wspólnej', neighbors: 0 },
  { name: 'Wysockiego', as: 'z Wysockiego', neighbors: 0 },
  { name: 'Wyszyńskiego', as: 'z Wyszyńskiego', neighbors: 0 },
  { name: 'Zacisze', as: 'z Zacisza', neighbors: 0 },
  { name: 'Zagrodowa', as: 'z Zagrodowej', neighbors: 0 },
  { name: 'Zakątek', as: 'z Zakątka', neighbors: 0 },
  { name: 'Zaułek', as: 'z Zaułka', neighbors: 0 },
  { name: 'Zdrojowa', as: 'ze Zdrojowej', neighbors: 0 },
  { name: 'Zgoda', as: 'ze Zgody', neighbors: 0 },
  { name: 'Zielona', as: 'z Zielonej', neighbors: 0 },
  { name: 'Złota', as: 'ze Złotej', neighbors: 0 },
  { name: 'Zwycięstwa', as: 'ze Zwycięstwa', neighbors: 0 },
  { name: 'Zygmuntowska', as: 'z Zygmuntowskiej', neighbors: 0 },
  { name: 'Żeromskiego', as: 'z Żeromskiego', neighbors: 0 },
  { name: 'Żołnierska', as: 'z Żołnierskiej', neighbors: 0 },
  { name: 'Żurawia', as: 'z Żurawiej', neighbors: 0 },
  { name: 'Żwirowa', as: 'ze Żwirowej', neighbors: 0 },
  { name: 'Żwirki i Wigury', as: 'ze Żwirki i Wigury', neighbors: 0 },

  // Główne ulice i sołectwa Gminy Mińsk Mazowiecki
  { name: 'Warszawska (Stojadła)', as: 'z Warszawskiej (Stojadła)', neighbors: 0 },
  { name: 'Mazowiecka (Huta Mińska)', as: 'z Huty Mińskiej', neighbors: 0 },
  { name: 'Sosnowa (Nowe Osiny)', as: 'z Nowych Osin', neighbors: 0 },
  { name: 'Główna (Karolina)', as: 'z Karoliny', neighbors: 0 },
  { name: 'Stojadła', as: 'ze Stojadeł', neighbors: 0 },
  { name: 'Nowe Osiny', as: 'z Nowych Osin', neighbors: 0 },
  { name: 'Stare Osiny', as: 'ze Starych Osin', neighbors: 0 },
  { name: 'Huta Mińska', as: 'z Huty Mińskiej', neighbors: 0 },
  { name: 'Karolina', as: 'z Karoliny', neighbors: 0 },
  { name: 'Arynów', as: 'z Arynowa', neighbors: 0 },
  { name: 'Barcząca', as: 'z Barczącej', neighbors: 0 },
  { name: 'Brzóze', as: 'z Brzózego', neighbors: 0 },
  { name: 'Budy Barcząckie', as: 'z Bud Barcząckich', neighbors: 0 },
  { name: 'Dłużka', as: 'z Dłużki', neighbors: 0 },
  { name: 'Gliniak', as: 'z Gliniaku', neighbors: 0 },
  { name: 'Grębiszew', as: 'z Grębiszewa', neighbors: 0 },
  { name: 'Ignaców', as: 'z Ignacowa', neighbors: 0 },
  { name: 'Janów', as: 'z Janowa', neighbors: 0 },
  { name: 'Józefów', as: 'z Józefowa', neighbors: 0 },
  { name: 'Marianka', as: 'z Marianki', neighbors: 0 },
  { name: 'Niedziałka', as: 'z Niedziałki', neighbors: 0 },
  { name: 'Podrudzie', as: 'z Podrudzia', neighbors: 0 },
  { name: 'Tartak', as: 'z Tartaku', neighbors: 0 },
  { name: 'Wólka Mińska', as: 'z Wólki Mińskiej', neighbors: 0 },
  { name: 'Zamienie', as: 'z Zamienia', neighbors: 0 },
  { name: 'Żuków', as: 'z Żukowa', neighbors: 0 },
];

export function resolveStreetName(streetOrAs?: string | null): string {
  if (!streetOrAs) return 'Centrum';
  const trimmed = streetOrAs.trim();
  const byAs = streets.find((s) => s.as.toLowerCase() === trimmed.toLowerCase());
  if (byAs) return byAs.name;
  const byName = streets.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  if (byName) return byName.name;
  for (const [city, asForm] of Object.entries(gminaLocalityAs)) {
    if (asForm.toLowerCase() === trimmed.toLowerCase()) return city;
  }
  return trimmed
    .replace(/^Mieszkaniec Mińska\s*·\s*/i, '')
    .replace(/^z\s+ul\.\s*/i, '')
    .replace(/^ul\.\s*/i, '')
    .replace(/^ze?\s+/i, '');
}

export function formatResidentLabel(streetOrAs?: string | null): string {
  return `Mieszkaniec Mińska · ul. ${resolveStreetName(streetOrAs)}`;
}

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
  verified: true,
  trialDaysLeft: 999,
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

export type TimetableDayType = 'weekday' | 'saturday' | 'sunday';

import { OFFICIAL_TIMETABLES, getOfficialStopDepartures } from './officialTimetables';
import { REAL_BUS_STOPS } from './realBusStops';

export function getCurrentTimetableDay(): TimetableDayType {
  const day = new Date().getDay();
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

/**
 * Zwraca autentyczny rozkład odjazdów dla przystanku bezpośrednio z tabel PDF ZDiTM
 */
export function getOfficialStopTimetable(lineId: LineId, stopName: string, directionIdx: 0 | 1 = 0): {
  weekday: string[];
  saturday: string[];
  sunday: string[];
} {
  const departures = getOfficialStopDepartures(lineId, stopName, directionIdx);
  if (departures.weekday.length > 0) {
    return departures;
  }

  // Fallback gdyby dany przystanek miał inną pisownię
  const line = busLines.find((l) => l.id === lineId) || busLines[0];
  const dir = line.directions[directionIdx] || line.directions[0];
  return {
    weekday: dir.departures.weekday,
    saturday: dir.departures.saturday,
    sunday: dir.departures.sunday,
  };
}

export function getNextScheduledBus(times: string[]): {
  time: string;
  minutesLeft: number;
  isTomorrow: boolean;
  label: string;
} | null {
  if (!times || times.length === 0) return null;
  
  // Posortuj chronologicznie, aby wyszukiwanie zawsze było niezawodne
  const sorted = [...times].sort((a, b) => {
    const [ha, ma] = a.split(':').map(Number);
    const [hb, mb] = b.split(':').map(Number);
    return ha * 60 + ma - (hb * 60 + mb);
  });

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const t of sorted) {
    const [h, m] = t.split(':').map(Number);
    const depMinutes = h * 60 + m;
    if (depMinutes >= currentMinutes) {
      const minutesLeft = depMinutes - currentMinutes;
      const label = minutesLeft <= 60 ? `za ${minutesLeft} min` : `o ${t}`;
      return {
        time: t,
        minutesLeft,
        isTomorrow: false,
        label,
      };
    }
  }

  const [firstH, firstM] = sorted[0].split(':').map(Number);
  const firstDepMinutes = 24 * 60 + firstH * 60 + firstM;
  return {
    time: sorted[0],
    minutesLeft: firstDepMinutes - currentMinutes,
    isTomorrow: true,
    label: `Jutro o ${sorted[0]}`,
  };
}

export interface TimetableHourGroup {
  hour: string;
  minutes: string[];
}

export function groupTimetableByHours(times: string[]): TimetableHourGroup[] {
  if (!times || times.length === 0) return [];

  // Posortuj chronologicznie od początku dnia (00:00 do 23:59)
  const sorted = [...times].sort((a, b) => {
    const [ha, ma] = a.split(':').map(Number);
    const [hb, mb] = b.split(':').map(Number);
    return ha * 60 + ma - (hb * 60 + mb);
  });

  const map = new Map<string, string[]>();
  for (const t of sorted) {
    const [h, m] = t.split(':');
    if (!map.has(h)) map.set(h, []);
    map.get(h)!.push(m);
  }

  // Zwróć tablicę grup posortowaną numerycznie według godziny (04, 05, 06... 21, 22),
  // co eliminuje błąd silników JS sortujących obiekty (klucze 10-23 przed kluczami z zerem '05'-'09')
  return Array.from(map.entries())
    .map(([hour, minutes]) => ({ hour, minutes }))
    .sort((a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10));
}

export interface StopRouteDepartureSummary {
  lineId: LineId;
  destination: string;
  nextTime: string;
  isToday: boolean;
  minutesLeft?: number;
  badgeLabel: string;
  subsequentTimes: string[];
}

export function getStopRoutesOverview(rawStopName: string): StopRouteDepartureSummary[] {
  const day = getCurrentTimetableDay();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Normalizuj nazwę przystanku (np. "Plac Dworcowy 01" -> "Plac Dworcowy")
  const cleanName = rawStopName.replace(/\s+\d{2}$/i, '').trim();

  const results: StopRouteDepartureSummary[] = [];

  for (const line of busLines) {
    const hasStop = line.stops.some(
      (s) =>
        s.toLowerCase().includes(cleanName.toLowerCase()) ||
        cleanName.toLowerCase().includes(s.toLowerCase())
    );

    if (hasStop) {
      line.directions.forEach((dir, dirIdx) => {
        const timetable = getOfficialStopTimetable(line.id, cleanName, dirIdx as 0 | 1);
        const dayTimes = timetable[day];
        if (!dayTimes || dayTimes.length === 0) return;

        const todayRemaining: { time: string; minutesLeft: number }[] = [];
        for (const t of dayTimes) {
          const [h, m] = t.split(':').map(Number);
          const depMinutes = h * 60 + m;
          if (depMinutes >= currentMinutes) {
            todayRemaining.push({
              time: t,
              minutesLeft: depMinutes - currentMinutes,
            });
          }
        }

        if (todayRemaining.length > 0) {
          const next = todayRemaining[0];
          const subsequentTimes = todayRemaining.slice(1, 4).map((x) => x.time);
          if (subsequentTimes.length < 3) {
            const need = 3 - subsequentTimes.length;
            subsequentTimes.push(...dayTimes.slice(0, need));
          }

          results.push({
            lineId: line.id,
            destination: dir.destination,
            nextTime: next.time,
            isToday: true,
            minutesLeft: next.minutesLeft,
            badgeLabel: next.time,
            subsequentTimes,
          });
        } else {
          // Kursy na dziś zakończone -> podaj pierwszy poranny kurs jutra
          const firstMorning = dayTimes[0] || '05:30';
          results.push({
            lineId: line.id,
            destination: dir.destination,
            nextTime: firstMorning,
            isToday: false,
            badgeLabel: firstMorning,
            subsequentTimes: dayTimes.slice(1, 4),
          });
        }
      });
    }
  }

  if (results.length === 0) {
    const fallbackLines: LineId[] = ['M1', 'M2', 'M3', 'M4'];
    for (const lid of fallbackLines) {
      const line = busLines.find((l) => l.id === lid);
      if (line) {
        const dir = line.directions[0];
        const dayTimes = dir.departures[day];
        const nextTime = dayTimes[0] || '06:00';
        results.push({
          lineId: lid,
          destination: dir.destination,
          nextTime,
          isToday: false,
          badgeLabel: `Jutro ${nextTime}`,
          subsequentTimes: dayTimes.slice(1, 4),
        });
      }
    }
  }

  // Posortuj: najpierw odjazdy na dziś (chronologicznie), potem na jutro
  return results.slice(0, 4);
}

export interface BusDirection {
  name: string;
  destination: string;
  frequency: string;
  stops?: string[];
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

function createOfficialBusLine(
  id: LineId,
  route: string,
  colorHex: string,
  offsets: number[],
): BusLine {
  const lineOfficial = OFFICIAL_TIMETABLES[id];
  const dir0 = lineOfficial.directions[0];
  const dir1 = lineOfficial.directions[1];

  const allUniqueStops = Array.from(new Set([...dir0.stops, ...dir1.stops]));

  const stopsDetails: BusStopDetail[] = allUniqueStops.map((stopName, idx) => {
    const clean = stopName.replace(/\s+\d+$/, '').trim().toLowerCase();
    const found = REAL_BUS_STOPS.find(
      (s) => s.fullName.toLowerCase() === stopName.toLowerCase() || s.name.toLowerCase() === clean,
    );
    return {
      name: stopName,
      zone: found?.zone || 'Mińsk Mazowiecki',
      isTransfer:
        found?.isTransfer ||
        stopName.toLowerCase().includes('dworc') ||
        stopName.toLowerCase().includes('szpital'),
      x: (idx * 4) % 100,
      y: (idx * 5) % 100,
    };
  });

  const getDirDepartures = (dir: typeof dir0) => {
    const firstStop = dir.stops[0];
    const dep = dir.stopDepartures[firstStop] || { weekday: [], saturday: [], sunday: [] };
    return {
      weekday: dep.weekday,
      saturday: dep.saturday,
      sunday: dep.sunday,
    };
  };

  return {
    id,
    route,
    colorHex,
    stops: dir0.stops,
    stopsDetails,
    offsets,
    directions: [
      {
        name: dir0.name,
        destination: dir0.destination,
        frequency: 'Według oficjalnego rozkładu ZDiTM',
        stops: dir0.stops,
        departures: getDirDepartures(dir0),
      },
      {
        name: dir1.name,
        destination: dir1.destination,
        frequency: 'Według oficjalnego rozkładu ZDiTM',
        stops: dir1.stops,
        departures: getDirDepartures(dir1),
      },
    ],
  };
}

export const busLines: BusLine[] = [
  createOfficialBusLine('M1', 'Plac Dworcowy ⇄ Serbinów', '#10B981', [0, 15, 30]),
  createOfficialBusLine('M2', 'Plac Dworcowy ⇄ Serbinów (przez Szpital)', '#8CA9D3', [4, 19, 34]),
  createOfficialBusLine('M3', 'Osiedlowa ⇄ Rondo Żołnierzy Wyklętych', '#EBC999', [6, 26, 46]),
  createOfficialBusLine('M4', 'Plac Dworcowy ⇄ Spacerowa (przez Anielinę)', '#F26659', [11, 41, 71]),
];

/* ---------------- Alert i newsy ---------------- */
export const liveAlert: {
  title: string;
  description: string;
  time: string;
} | null = null;

export const news: {
  id: string;
  source: string;
  time: string;
  tag: string;
  title: string;
  image: string;
}[] = [];

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

export const initialPolls: PollItem[] = [];

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

export const poll: {
  title: string;
  total: number;
  daysLeft: number;
  options: PollOption[];
} | null = null;

/* ---------------- Ogłoszenia ---------------- */
export interface Ad {
  id: string;
  title: string;
  price: number | null;
  kind: 'sell' | 'free' | 'lost';
  author: string;
  authorId?: string | null;
  authorAvatarSeed?: string;
  street: string;
  time: string;
  image: string;
  images?: string[];
  description?: string;
  category?: string;
  condition?: 'Nowe' | 'Używane' | 'Bardzo dobry';
  status?: 'active' | 'reserved' | 'sold' | 'expired';
  views?: number;
  isOwner?: boolean;
  negotiable?: boolean;
  createdAt?: string;
  expiresAt?: string;
}

export function formatAdExactDate(isoString?: string | null): string {
  if (!isoString) return 'niedawno';
  const ts = Date.parse(isoString);
  if (Number.isNaN(ts)) return isoString;
  const date = new Date(ts);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getAdValidityInfo(ad: Pick<Ad, 'createdAt' | 'expiresAt' | 'status'>): {
  daysLeft: number;
  isExpired: boolean;
  label: string;
  shortLabel: string;
} {
  if (ad.status === 'expired') {
    return {
      daysLeft: 0,
      isExpired: true,
      label: 'Ogłoszenie wygasło (minęło 14 dni)',
      shortLabel: 'Wygasło',
    };
  }

  let expiresTs: number;
  if (ad.expiresAt) {
    expiresTs = Date.parse(ad.expiresAt);
  } else if (ad.createdAt) {
    expiresTs = Date.parse(ad.createdAt) + 14 * 24 * 60 * 60 * 1000;
  } else {
    return {
      daysLeft: 14,
      isExpired: false,
      label: 'Ważne 14 dni',
      shortLabel: 'Ważne 14 dni',
    };
  }

  if (Number.isNaN(expiresTs)) {
    return {
      daysLeft: 14,
      isExpired: false,
      label: 'Ważne 14 dni',
      shortLabel: 'Ważne 14 dni',
    };
  }

  const diffMs = expiresTs - Date.now();
  const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (daysLeft <= 0) {
    return {
      daysLeft: 0,
      isExpired: true,
      label: 'Ogłoszenie wygasło (minęło 14 dni)',
      shortLabel: 'Wygasło',
    };
  }

  if (daysLeft === 1) {
    return {
      daysLeft: 1,
      isExpired: false,
      label: 'Wygasa dzisiaj (ostatni dzień)',
      shortLabel: 'Ostatni dzień',
    };
  }

  return {
    daysLeft,
    isExpired: false,
    label: `Ważne jeszcze ${daysLeft} dni`,
    shortLabel: `Jeszcze ${daysLeft} dni`,
  };
}

export interface AdConversation {
  id: string;
  adId: string;
  adTitle: string;
  adPrice: number | null;
  adImage: string;
  adStreet: string;
  otherUser: {
    profileId?: string;
    name: string;
    street: string;
    streetAs?: string;
    avatarSeed?: string;
  };
  role: 'buyer' | 'seller';
  lastMessage: string;
  lastMessageTime: string;
  lastMessageAt?: string | null;
  unreadCount: number;
}

export function formatRelativeChatTime(isoString?: string | null): string {
  if (!isoString) return 'Teraz';
  const ts = Date.parse(isoString);
  if (Number.isNaN(ts)) return isoString;
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Przed chwilą';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min temu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} godz. temu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Wczoraj';
  if (diffDays < 7) return `${diffDays} dni temu`;
  return new Date(ts).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

export const ads: Ad[] = [];

export const initialAdConversations: AdConversation[] = [];

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

export const rides: Ride[] = [];

/* ---------------- Strefa Rozmów ---------------- */
export interface Post {
  id: string;
  author: string;
  authorAs: string;
  authorProfileId?: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  replies: number;
  reposts: number;
  views: number;
  createdAt?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  author: string;
  authorAs: string;
  authorProfileId?: string;
  content: string;
  createdAt: string;
  time?: string;
}

export const posts: Post[] = [];

export const talkTags = ['Wszystko', '#Centrum', '#Serbinów', '#Drogi', '#Kultura', '#Inwestycje'];

/* ---------------- Strefa Partnera ---------------- */
export interface PartnerProduct {
  id: string;
  name: string;
  category: string;
  material: string;
  specs: string;
  badge?: string;
  image: string;
  priceFrom?: number;
}

export const partner = {
  name: 'Grupa ADK — Okna, Drzwi, Pergole',
  shortName: 'Grupa ADK',
  tagline: 'Ty wybierasz nas, My robimy resztę.',
  subtagline: 'Stolarka budowlana | Konstrukcje aluminiowe | Zabudowy tarasów | Ogrodzenia | Systemy przeciwsłoneczne',
  description:
    'Lokalny lider nowoczesnej stolarki otworowej, wielkoformatowych przeszkleń HST, energooszczędnych drzwi i całorocznych pergoli bioklimatycznych. Salon pokazowy i doradztwo techniczne na miejscu w Mińsku.',
  address: 'ul. Siennicka 47, Mińsk Mazowiecki',
  phone: '514 481 473',
  phoneSecondary: '505 750 825',
  email: 'kontakt@adkokna.pl',
  website: 'https://grupaadk.pl',
  openingHours: 'Pn – Pt: 08:00 – 16:00',
  code: 'ADK-MINSK',
  discount: '−10%',
  hero: '/partners/grupa-adk-hero.jpg',
  logo: '/partners/grupa-adk-logo.png',
  brandColor: '#4abbc3',
  brandDark: '#162438',
  brandNavy: '#0e243f',
  perks: [
    'Bezpłatny profesjonalny pomiar laserowy na posesji w Mińsku i powiecie',
    'Certyfikowane profile Uw ≤ 0,72 W/m²K do programu „Czyste Powietrze”',
    'Własne, wykwalifikowane ekipy montażowe z Mińska Mazowieckiego',
    'Salon stacjonarny przy ul. Siennickiej 47 z ekspozycją profili i automatyki',
  ],
  products: [
    {
      id: 'adk-p1',
      name: 'Okna Pasywne & Energooszczędne',
      category: 'Okna PCV / ALU',
      material: 'System 3-szybowy 7-komorowy',
      specs: 'Współczynnik Uw od 0,72 W/m²K · Ciepłe ramki międzyszybowe',
      badge: 'Czyste Powietrze',
      image: img('photo-1600566753376-12c8ab7fb75b', 600),
    },
    {
      id: 'adk-p2',
      name: 'Przeszklenia Panoramiczne HST',
      category: 'Systemy Tarasowe',
      material: 'Aluminium Ciepłe Slim',
      specs: 'Próg bezbarierowy 0 mm · Przesuwne skrzydła do 400 kg · Panoramiczny widok',
      badge: 'Bestseller',
      image: img('photo-1600607687939-ce8a6c25118c', 600),
    },
    {
      id: 'adk-p3',
      name: 'Drzwi Zewnętrzne Premium & Smart',
      category: 'Drzwi Wejściowe',
      material: 'Aluminium / Kompozyt RC3',
      specs: 'Zasuwnica wielopunktowa · Czytnik linii papilarnych · Izolacja termiczna Ud < 0,8',
      badge: 'Smart Home',
      image: img('photo-1513694203232-719a280e022f', 600),
    },
    {
      id: 'adk-p4',
      name: 'Pergole Bioklimatyczne & Tarasy',
      category: 'Architektura Ogrodu',
      material: 'Aluminium Ekstrudowane',
      specs: 'Obrotowe lamele dachowe · Odprowadzanie wody · Oświetlenie LED · Sensory wiatru',
      badge: 'Całoroczne',
      image: img('photo-1512917774080-9991f1c4c750', 600),
    },
    {
      id: 'adk-p5',
      name: 'Rolety Podtynkowe & Żaluzje Fasad.',
      category: 'Osłony Przeciwsłoneczne',
      material: 'Lamele Z90 / Pancerz Alu',
      specs: 'Ochrona przed nagrzewaniem · Wyciszenie akustyczne · Sterowanie Somfy IO',
      badge: 'Komfort Termiczny',
      image: img('photo-1582582494705-f8ce0b0c24f0', 600),
    },
    {
      id: 'adk-p6',
      name: 'Bramy Garażowe & Ogrodzenia',
      category: 'Bramy i Posesja',
      material: 'Panel 40/60 mm & Profil Alu',
      specs: 'Automatyka zintegrowana z pilotem / smartfonem · Spójny design posesji',
      badge: 'Bezpieczeństwo',
      image: img('photo-1590381105924-c72589b9ef3f', 600),
    },
  ],
};
