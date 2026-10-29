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

  // Pełny wykaz alfabetyczny ulic Mińska Mazowieckiego
  { name: '1 Maja', as: 'z 1 Maja', neighbors: 18 },
  { name: '11 Listopada', as: 'z 11 Listopada', neighbors: 14 },
  { name: 'Agrestowa', as: 'z Agrestowej', neighbors: 11 },
  { name: 'Akacjowa', as: 'z Akacjowej', neighbors: 16 },
  { name: 'Andersa', as: 'z Andersa', neighbors: 12 },
  { name: 'Anielin', as: 'z Anielina', neighbors: 22 },
  { name: 'Armii Krajowej', as: 'z Armii Krajowej', neighbors: 25 },
  { name: 'Asnyka', as: 'z Asnyka', neighbors: 10 },
  { name: 'Aurelii', as: 'z Aurelii', neighbors: 8 },
  { name: 'Bankowa', as: 'z Bankowej', neighbors: 15 },
  { name: 'Barlickiego', as: 'z Barlickiego', neighbors: 11 },
  { name: 'Batalionów Chłopskich', as: 'z Batalionów Chłopskich', neighbors: 14 },
  { name: 'Batorego', as: 'z Batorego', neighbors: 16 },
  { name: 'Bema', as: 'z Bema', neighbors: 19 },
  { name: 'Boczna', as: 'z Bocznej', neighbors: 13 },
  { name: 'Bohaterów Warszawy', as: 'z Bohaterów Warszawy', neighbors: 17 },
  { name: 'Borelowskiego', as: 'z Borelowskiego', neighbors: 12 },
  { name: 'Borowikowa', as: 'z Borowikowej', neighbors: 9 },
  { name: 'Botaniczna', as: 'z Botanicznej', neighbors: 14 },
  { name: 'Browarna', as: 'z Browarnej', neighbors: 8 },
  { name: 'Brzozowa', as: 'z Brzozowej', neighbors: 18 },
  { name: 'Bulwarna', as: 'z Bulwarnej', neighbors: 16 },
  { name: 'Bursztynowa', as: 'z Bursztynowej', neighbors: 15 },
  { name: 'Ceglana', as: 'z Ceglanej', neighbors: 11 },
  { name: 'Chrobrego', as: 'z Chrobrego', neighbors: 21 },
  { name: 'Cicha', as: 'z Cichej', neighbors: 17 },
  { name: 'Cmentarna', as: 'z Cmentarnej', neighbors: 12 },
  { name: 'Cyprysowa', as: 'z Cyprysowej', neighbors: 10 },
  { name: 'Czackiego', as: 'z Czackiego', neighbors: 9 },
  { name: 'Czarnieckiego', as: 'z Czarnieckiego', neighbors: 23 },
  { name: 'Czeska', as: 'z Czeskiej', neighbors: 8 },
  { name: 'Daszyńskiego', as: 'z Daszyńskiego', neighbors: 26 },
  { name: 'Dębowa', as: 'z Dębowej', neighbors: 16 },
  { name: 'Diamentowa', as: 'z Diamentowej', neighbors: 7 },
  { name: 'Długa', as: 'z Długiej', neighbors: 15 },
  { name: 'Dmowskiego', as: 'z Dmowskiego', neighbors: 18 },
  { name: 'Dolna', as: 'z Dolnej', neighbors: 10 },
  { name: 'Drzymały', as: 'z Drzymały', neighbors: 9 },
  { name: 'Działkowa', as: 'z Działkowej', neighbors: 13 },
  { name: 'Fabryczna', as: 'z Fabrycznej', neighbors: 21 },
  { name: 'Florencja', as: 'z Florencji', neighbors: 14 },
  { name: 'Fredry', as: 'z Fredry', neighbors: 11 },
  { name: 'Gałczyńskiego', as: 'z Gałczyńskiego', neighbors: 15 },
  { name: 'Gliniana', as: 'z Glinianej', neighbors: 12 },
  { name: 'Głowackiego', as: 'z Głowackiego', neighbors: 14 },
  { name: 'Górna', as: 'z Górnej', neighbors: 13 },
  { name: 'Graniczna', as: 'z Granicznej', neighbors: 19 },
  { name: 'Grochowska', as: 'z Grochowskiej', neighbors: 12 },
  { name: 'Grzybowa', as: 'z Grzybowej', neighbors: 10 },
  { name: 'Gwiaździsta', as: 'z Gwiaździstej', neighbors: 8 },
  { name: 'Harcerska', as: 'z Harcerskiej', neighbors: 11 },
  { name: 'Huberta', as: 'z Huberta', neighbors: 20 },
  { name: 'Hutnicza', as: 'z Hutniczej', neighbors: 16 },
  { name: 'Inwalidów Wojennych', as: 'z Inwalidów Wojennych', neighbors: 14 },
  { name: 'Jagodowa', as: 'z Jagodowej', neighbors: 9 },
  { name: 'Jana Pawła II', as: 'z Jana Pawła II', neighbors: 28 },
  { name: 'Jasińskiego', as: 'z Jasińskiego', neighbors: 12 },
  { name: 'Jasna', as: 'z Jasnej', neighbors: 15 },
  { name: 'Jaśminowa', as: 'z Jaśminowej', neighbors: 11 },
  { name: 'Jaworowa', as: 'z Jaworowej', neighbors: 10 },
  { name: 'Jesionowa', as: 'z Jesionowej', neighbors: 14 },
  { name: 'Jeżynowa', as: 'z Jeżynowej', neighbors: 8 },
  { name: 'Jodłowa', as: 'z Jodłowej', neighbors: 13 },
  { name: 'Kalinowa', as: 'z Kalinowej', neighbors: 12 },
  { name: 'Kasztanowa', as: 'z Kasztanowej', neighbors: 17 },
  { name: 'Kątna', as: 'z Kątnej', neighbors: 7 },
  { name: 'Kędzierak', as: 'z Kędzieraku', neighbors: 19 },
  { name: 'Kilińskiego', as: 'z Kilińskiego', neighbors: 27 },
  { name: 'Kolejowa', as: 'z Kolejowej', neighbors: 22 },
  { name: 'Kołłątaja', as: 'z Kołłątaja', neighbors: 11 },
  { name: 'Konopnickiej', as: 'z Konopnickiej', neighbors: 16 },
  { name: 'Konstytucji 3 Maja', as: 'z Konstytucji 3 Maja', neighbors: 25 },
  { name: 'Kopernika', as: 'z Kopernika', neighbors: 20 },
  { name: 'Koralowa', as: 'z Koralowej', neighbors: 9 },
  { name: 'Korczaka', as: 'z Korczaka', neighbors: 13 },
  { name: 'Krakowska', as: 'z Krakowskiej', neighbors: 15 },
  { name: 'Krasickiego', as: 'z Krasickiego', neighbors: 12 },
  { name: 'Kraszewskiego', as: 'z Kraszewskiego', neighbors: 14 },
  { name: 'Królewiecka', as: 'z Królewieckiej', neighbors: 21 },
  { name: 'Krótka', as: 'z Krótkiej', neighbors: 10 },
  { name: 'Krzywa', as: 'z Krzywej', neighbors: 8 },
  { name: 'Kwiatowa', as: 'z Kwiatowej', neighbors: 16 },
  { name: 'Lawendowa', as: 'z Lawendowej', neighbors: 12 },
  { name: 'Legionów', as: 'z Legionów', neighbors: 18 },
  { name: 'Leśna', as: 'z Leśnej', neighbors: 19 },
  { name: 'Letniskowa', as: 'z Letniskowej', neighbors: 11 },
  { name: 'Lipowa', as: 'z Lipowej', neighbors: 17 },
  { name: 'Lotników', as: 'z Lotników', neighbors: 14 },
  { name: 'Lwowska', as: 'ze Lwowskiej', neighbors: 13 },
  { name: 'Łukasińskiego', as: 'z Łukasińskiego', neighbors: 12 },
  { name: 'Magnolii', as: 'z Magnolii', neighbors: 10 },
  { name: 'Majowa', as: 'z Majowej', neighbors: 13 },
  { name: 'Makowa', as: 'z Makowej', neighbors: 9 },
  { name: 'Mała', as: 'z Małej', neighbors: 8 },
  { name: 'Malinowa', as: 'z Malinowej', neighbors: 11 },
  { name: 'Matejki', as: 'z Matejki', neighbors: 14 },
  { name: 'Mazowiecka', as: 'z Mazowieckiej', neighbors: 24 },
  { name: 'Mieszka I', as: 'z Mieszka I', neighbors: 16 },
  { name: 'Miła', as: 'z Miłej', neighbors: 11 },
  { name: 'Miodowa', as: 'z Miodowej', neighbors: 10 },
  { name: 'Młynarska', as: 'z Młynarskiej', neighbors: 15 },
  { name: 'Modrzewiowa', as: 'z Modrzewiowej', neighbors: 12 },
  { name: 'Mokra', as: 'z Mokrej', neighbors: 7 },
  { name: 'Moniuszki', as: 'z Moniuszki', neighbors: 14 },
  { name: 'Morelowa', as: 'z Morelowej', neighbors: 9 },
  { name: 'Myśliwska', as: 'z Myśliwskiej', neighbors: 13 },
  { name: 'Nadrzeczna', as: 'z Nadrzecznej', neighbors: 18 },
  { name: 'Nałkowskiej', as: 'z Nałkowskiej', neighbors: 12 },
  { name: 'Narutowicza', as: 'z Narutowicza', neighbors: 21 },
  { name: 'Niecała', as: 'z Niecałej', neighbors: 8 },
  { name: 'Niska', as: 'z Niskiej', neighbors: 10 },
  { name: 'Nowa', as: 'z Nowej', neighbors: 14 },
  { name: 'Nowomiejska', as: 'z Nowomiejskiej', neighbors: 16 },
  { name: 'Nowy Świat', as: 'z Nowego Światu', neighbors: 15 },
  { name: 'Ogrodowa', as: 'z Ogrodowej', neighbors: 19 },
  { name: 'Okrzei', as: 'z Okrzei', neighbors: 23 },
  { name: 'Olchowa', as: 'z Olchowej', neighbors: 10 },
  { name: 'Olszowa', as: 'z Olszowej', neighbors: 8 },
  { name: 'Orla', as: 'z Orlej', neighbors: 9 },
  { name: 'Orzechowa', as: 'z Orzechowej', neighbors: 11 },
  { name: 'Orzeszkowej', as: 'z Orzeszkowej', neighbors: 14 },
  { name: 'Paderewskiego', as: 'z Paderewskiego', neighbors: 17 },
  { name: 'Parkowa', as: 'z Parkowej', neighbors: 21 },
  { name: 'Partyzantów', as: 'z Partyzantów', neighbors: 18 },
  { name: 'PCK', as: 'z PCK', neighbors: 11 },
  { name: 'Piaskowa', as: 'z Piaskowej', neighbors: 13 },
  { name: 'Piłsudskiego', as: 'z Piłsudskiego', neighbors: 35 },
  { name: 'Plac Dworcowy', as: 'z Placu Dworcowego', neighbors: 16 },
  { name: 'Plac Kilińskiego', as: 'z Placu Kilińskiego', neighbors: 14 },
  { name: 'Plac Stary Rynek', as: 'ze Starego Rynku', neighbors: 15 },
  { name: 'Podgórna', as: 'z Podgórnej', neighbors: 11 },
  { name: 'Podleśna', as: 'z Podleśnej', neighbors: 14 },
  { name: 'Pogodna', as: 'z Pogodnej', neighbors: 12 },
  { name: 'Polna', as: 'z Polnej', neighbors: 17 },
  { name: 'Polowa', as: 'z Polowej', neighbors: 13 },
  { name: 'Poniatowskiego', as: 'z Poniatowskiego', neighbors: 16 },
  { name: 'Poprzeczna', as: 'z Poprzecznej', neighbors: 10 },
  { name: 'Porzeczkowa', as: 'z Porzeczkowej', neighbors: 8 },
  { name: 'Powstańców Warszawy', as: 'z Powstańców Warszawy', neighbors: 15 },
  { name: 'Północna', as: 'z Północnej', neighbors: 12 },
  { name: 'Promienna', as: 'z Promiennej', neighbors: 10 },
  { name: 'Prosta', as: 'z Prostej', neighbors: 11 },
  { name: 'Prusa', as: 'z Prusa', neighbors: 18 },
  { name: 'Przemysłowa', as: 'z Przemysłowej', neighbors: 22 },
  { name: 'Przyjaźni', as: 'z Przyjaźni', neighbors: 9 },
  { name: 'Pułaskiego', as: 'z Pułaskiego', neighbors: 14 },
  { name: 'Radosna', as: 'z Radosnej', neighbors: 12 },
  { name: 'Reja', as: 'z Reja', neighbors: 11 },
  { name: 'Reymonta', as: 'z Reymonta', neighbors: 19 },
  { name: 'Rolna', as: 'z Rolnej', neighbors: 15 },
  { name: 'Różana', as: 'z Różanej', neighbors: 14 },
  { name: 'Równa', as: 'z Równej', neighbors: 8 },
  { name: 'Rubinowa', as: 'z Rubinowej', neighbors: 7 },
  { name: 'Rybna', as: 'z Rybnej', neighbors: 9 },
  { name: 'Rzemieślnicza', as: 'z Rzemieślniczej', neighbors: 13 },
  { name: 'Sadowa', as: 'z Sadowej', neighbors: 15 },
  { name: 'Serbinowska', as: 'z Serbinowskiej', neighbors: 19 },
  { name: 'Sienkiewicza', as: 'z Sienkiewicza', neighbors: 24 },
  { name: 'Sikorskiego', as: 'z Sikorskiego', neighbors: 23 },
  { name: 'Skłodowskiej-Curie', as: 'ze Skłodowskiej-Curie', neighbors: 18 },
  { name: 'Słoneczna', as: 'ze Słonecznej', neighbors: 19 },
  { name: 'Słowackiego', as: 'ze Słowackiego', neighbors: 16 },
  { name: 'Sosnowa', as: 'z Sosnowej', neighbors: 15 },
  { name: 'Spokojna', as: 'ze Spokojnej', neighbors: 13 },
  { name: 'Sportowa', as: 'ze Sportowej', neighbors: 20 },
  { name: 'Spółdzielcza', as: 'ze Spółdzielczej', neighbors: 14 },
  { name: 'Srebrna', as: 'ze Srebrnej', neighbors: 11 },
  { name: 'Stalowa', as: 'ze Stalowej', neighbors: 12 },
  { name: 'Stankowizna', as: 'ze Stankowizny', neighbors: 17 },
  { name: 'Stara', as: 'ze Starej', neighbors: 10 },
  { name: 'Staszica', as: 'ze Staszica', neighbors: 14 },
  { name: 'Stolarska', as: 'ze Stolarskiej', neighbors: 11 },
  { name: 'Strażacka', as: 'ze Strażackiej', neighbors: 12 },
  { name: 'Strzelecka', as: 'ze Strzeleckiej', neighbors: 9 },
  { name: 'Szafirowa', as: 'z Szafirowej', neighbors: 8 },
  { name: 'Szeroka', as: 'z Szerokiej', neighbors: 11 },
  { name: 'Szkolna', as: 'ze Szkolnej', neighbors: 18 },
  { name: 'Świerkowa', as: 'ze Świerkowej', neighbors: 16 },
  { name: 'Świętokrzyska', as: 'ze Świętokrzyskiej', neighbors: 13 },
  { name: 'Targowa', as: 'z Targowej', neighbors: 21 },
  { name: 'Topolowa', as: 'z Topolowej', neighbors: 14 },
  { name: 'Torowa', as: 'z Torowej', neighbors: 10 },
  { name: 'Traugutta', as: 'z Traugutta', neighbors: 26 },
  { name: 'Truskawkowa', as: 'z Truskawkowej', neighbors: 9 },
  { name: 'Tuwima', as: 'z Tuwima', neighbors: 15 },
  { name: 'Wąska', as: 'z Wąskiej', neighbors: 9 },
  { name: 'Warszawskie Przedmieście', as: 'z Warszawskiego Przedmieścia', neighbors: 22 },
  { name: 'Wesoła', as: 'z Wesołej', neighbors: 17 },
  { name: 'Widok', as: 'z Widoku', neighbors: 10 },
  { name: 'Wiejska', as: 'z Wiejskiej', neighbors: 15 },
  { name: 'Wierzbowa', as: 'z Wierzbowej', neighbors: 12 },
  { name: 'Wiklinowa', as: 'z Wiklinowej', neighbors: 9 },
  { name: 'Wilcza', as: 'z Wilczej', neighbors: 8 },
  { name: 'Wiosenna', as: 'z Wiosennej', neighbors: 13 },
  { name: 'Wiśniowa', as: 'z Wiśniowej', neighbors: 14 },
  { name: 'Wodna', as: 'z Wodnej', neighbors: 10 },
  { name: 'Wojska Polskiego', as: 'z Wojska Polskiego', neighbors: 25 },
  { name: 'Wolności', as: 'z Wolności', neighbors: 16 },
  { name: 'Wrzosowa', as: 'z Wrzosowej', neighbors: 11 },
  { name: 'Wspólna', as: 'ze Wspólnej', neighbors: 18 },
  { name: 'Wysockiego', as: 'z Wysockiego', neighbors: 12 },
  { name: 'Wyszyńskiego', as: 'z Wyszyńskiego', neighbors: 24 },
  { name: 'Zacisze', as: 'z Zacisza', neighbors: 10 },
  { name: 'Zagrodowa', as: 'z Zagrodowej', neighbors: 8 },
  { name: 'Zakątek', as: 'z Zakątka', neighbors: 7 },
  { name: 'Zaułek', as: 'z Zaułka', neighbors: 6 },
  { name: 'Zdrojowa', as: 'ze Zdrojowej', neighbors: 11 },
  { name: 'Zgoda', as: 'ze Zgody', neighbors: 12 },
  { name: 'Zielona', as: 'z Zielonej', neighbors: 16 },
  { name: 'Złota', as: 'ze Złotej', neighbors: 10 },
  { name: 'Zwycięstwa', as: 'ze Zwycięstwa', neighbors: 11 },
  { name: 'Zygmuntowska', as: 'z Zygmuntowskiej', neighbors: 15 },
  { name: 'Żeromskiego', as: 'z Żeromskiego', neighbors: 17 },
  { name: 'Żołnierska', as: 'z Żołnierskiej', neighbors: 11 },
  { name: 'Żurawia', as: 'z Żurawiej', neighbors: 8 },
  { name: 'Żwirowa', as: 'ze Żwirowej', neighbors: 10 },
  { name: 'Żwirki i Wigury', as: 'ze Żwirki i Wigury', neighbors: 14 },

  // Główne ulice i sołectwa Gminy Mińsk Mazowiecki
  { name: 'Warszawska (Stojadła)', as: 'z Warszawskiej (Stojadła)', neighbors: 48 },
  { name: 'Mazowiecka (Huta Mińska)', as: 'z Huty Mińskiej', neighbors: 39 },
  { name: 'Sosnowa (Nowe Osiny)', as: 'z Nowych Osin', neighbors: 35 },
  { name: 'Główna (Karolina)', as: 'z Karoliny', neighbors: 28 },
  { name: 'Stojadła', as: 'ze Stojadeł', neighbors: 52 },
  { name: 'Nowe Osiny', as: 'z Nowych Osin', neighbors: 45 },
  { name: 'Stare Osiny', as: 'ze Starych Osin', neighbors: 38 },
  { name: 'Huta Mińska', as: 'z Huty Mińskiej', neighbors: 41 },
  { name: 'Karolina', as: 'z Karoliny', neighbors: 34 },
  { name: 'Arynów', as: 'z Arynowa', neighbors: 26 },
  { name: 'Barcząca', as: 'z Barczącej', neighbors: 23 },
  { name: 'Brzóze', as: 'z Brzózego', neighbors: 19 },
  { name: 'Budy Barcząckie', as: 'z Bud Barcząckich', neighbors: 17 },
  { name: 'Dłużka', as: 'z Dłużki', neighbors: 16 },
  { name: 'Gliniak', as: 'z Gliniaku', neighbors: 15 },
  { name: 'Grębiszew', as: 'z Grębiszewa', neighbors: 14 },
  { name: 'Ignaców', as: 'z Ignacowa', neighbors: 20 },
  { name: 'Janów', as: 'z Janowa', neighbors: 22 },
  { name: 'Józefów', as: 'z Józefowa', neighbors: 13 },
  { name: 'Marianka', as: 'z Marianki', neighbors: 24 },
  { name: 'Niedziałka', as: 'z Niedziałki', neighbors: 25 },
  { name: 'Podrudzie', as: 'z Podrudzia', neighbors: 18 },
  { name: 'Tartak', as: 'z Tartaku', neighbors: 16 },
  { name: 'Wólka Mińska', as: 'z Wólki Mińskiej', neighbors: 27 },
  { name: 'Zamienie', as: 'z Zamienia', neighbors: 22 },
  { name: 'Żuków', as: 'z Żukowa', neighbors: 15 },
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
