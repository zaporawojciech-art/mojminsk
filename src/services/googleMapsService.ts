/**
 * Serwis integracji z Google Maps Places Autocomplete API
 * dla strefy przejazdów w aplikacji mójMińsk.
 */

export interface PlaceSuggestion {
  id: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  source: 'google' | 'nominatim' | 'local';
}

// Lokalna baza popularnych węzłów komunikacyjnych Mińska Mazowieckiego, powiatu i Warszawy
const LOCAL_TRANSIT_HUBS: Omit<PlaceSuggestion, 'source'>[] = [
  // Mińsk Mazowiecki & Powiat
  {
    id: 'hub_minsk_pkp',
    mainText: 'Dworzec PKP Mińsk Mazowiecki',
    secondaryText: 'Plac Dworcowy, Mińsk Mazowiecki',
    fullText: 'Dworzec PKP Mińsk Mazowiecki, Plac Dworcowy',
  },
  {
    id: 'hub_minsk_anielina',
    mainText: 'PKP Anielina',
    secondaryText: 'ul. Sosnkowskiego / Klonowa, Mińsk Mazowiecki',
    fullText: 'PKP Anielina, Mińsk Mazowiecki',
  },
  {
    id: 'hub_minsk_centrum',
    mainText: 'Mińsk Mazowiecki · Centrum',
    secondaryText: 'Plac Stary Rynek / Warszawska',
    fullText: 'Mińsk Mazowiecki, Centrum',
  },
  {
    id: 'hub_stojadla',
    mainText: 'Stojadła · Park Handlowy',
    secondaryText: 'ul. Warszawska 61, Stojadła (gm. Mińsk Maz.)',
    fullText: 'Stojadła, Park Handlowy',
  },
  {
    id: 'hub_halinow_pkp',
    mainText: 'Halinów · PKP',
    secondaryText: 'ul. Bema, Halinów (pow. miński)',
    fullText: 'Halinów, PKP',
  },
  {
    id: 'hub_sulejowek_milosna',
    mainText: 'Sulejówek Miłosna · PKP',
    secondaryText: 'ul. Staszica, Sulejówek (pow. miński)',
    fullText: 'Sulejówek Miłosna, PKP',
  },
  {
    id: 'hub_debe_wielkie',
    mainText: 'Dębe Wielkie · Urząd Gminy',
    secondaryText: 'ul. Strażacka 3, Dębe Wielkie',
    fullText: 'Dębe Wielkie, Centrum',
  },
  {
    id: 'hub_ceglow_pkp',
    mainText: 'Cegłów · PKP',
    secondaryText: 'ul. Kolejowa, Cegłów (pow. miński)',
    fullText: 'Cegłów, PKP',
  },
  {
    id: 'hub_siennica',
    mainText: 'Siennica · Rynek',
    secondaryText: 'Rynek, Siennica (pow. miński)',
    fullText: 'Siennica, Rynek',
  },
  {
    id: 'hub_stanislawow',
    mainText: 'Stanisławów · Rynek',
    secondaryText: 'Rynek, Stanisławów (pow. miński)',
    fullText: 'Stanisławów, Rynek',
  },

  // Warszawa - Główne węzły i dzielnice (w tym Mokotów)
  {
    id: 'hub_waw_mokotow',
    mainText: 'Warszawa · Mokotów',
    secondaryText: 'Dzielnica Mokotów, Warszawa',
    fullText: 'Warszawa, Mokotów',
  },
  {
    id: 'hub_waw_galeria_mokotow',
    mainText: 'Galeria Mokotów / Westfield',
    secondaryText: 'ul. Wołoska 12, Warszawa Mokotów',
    fullText: 'Warszawa, Galeria Mokotów',
  },
  {
    id: 'hub_waw_pole_mokotowskie',
    mainText: 'Metro Pole Mokotowskie',
    secondaryText: 'al. Niepodległości, Warszawa Mokotów',
    fullText: 'Warszawa, Metro Pole Mokotowskie',
  },
  {
    id: 'hub_waw_sluzew',
    mainText: 'Metro Służew / Domaniewska',
    secondaryText: 'ul. Domaniewska, Warszawa Mokotów',
    fullText: 'Warszawa, Domaniewska',
  },
  {
    id: 'hub_waw_wiatraczna',
    mainText: 'Rondo Wiatraczna',
    secondaryText: 'Warszawa, Grochów / Praga Południe',
    fullText: 'Warszawa, Rondo Wiatraczna',
  },
  {
    id: 'hub_waw_centralna',
    mainText: 'Dworzec Centralny',
    secondaryText: 'Aleje Jerozolimskie 54, Warszawa Śródmieście',
    fullText: 'Warszawa, Dworzec Centralny',
  },
  {
    id: 'hub_waw_politechnika',
    mainText: 'Metro Politechnika',
    secondaryText: 'ul. Waryńskiego / Trasa Łazienkowska, Warszawa',
    fullText: 'Warszawa, Metro Politechnika',
  },
  {
    id: 'hub_waw_wilenska',
    mainText: 'Dworzec Wileński / Metro',
    secondaryText: 'ul. Targowa, Warszawa Praga Północ',
    fullText: 'Warszawa, Dworzec Wileński',
  },
  {
    id: 'hub_waw_ursynow',
    mainText: 'Warszawa · Ursynów',
    secondaryText: 'al. KEN / Metro Imielin, Warszawa',
    fullText: 'Warszawa, Ursynów',
  },
  {
    id: 'hub_waw_wola',
    mainText: 'Warszawa · Rondo Daszyńskiego / Wola',
    secondaryText: 'ul. Prosta / Towarowa, Warszawa',
    fullText: 'Warszawa, Rondo Daszyńskiego',
  },
];

declare global {
  interface Window {
    google?: any;
    __googleMapsLoadingPromise?: Promise<boolean>;
  }
}

const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

export function hasGoogleMapsKey(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 5);
}

/**
 * Bezpieczne, jednokrotne ładowanie biblioteki Google Maps JavaScript z biblioteką places.
 */
export async function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.google?.maps?.places?.AutocompleteService) return true;
  if (!hasGoogleMapsKey()) return false;

  if (window.__googleMapsLoadingPromise) {
    return window.__googleMapsLoadingPromise;
  }

  window.__googleMapsLoadingPromise = new Promise<boolean>((resolve) => {
    // Sprawdź czy skrypt już został wstrzyknięty
    const existing = document.querySelector('script[data-gmaps="places"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-gmaps', 'places');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY!,
    )}&libraries=places&language=pl&region=PL&v=weekly`;

    script.onload = () => {
      resolve(true);
    };
    script.onerror = (err) => {
      console.warn('[GoogleMaps] Nie udało się załadować Google Maps API, aktywny fallback geocodera:', err);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

let autocompleteServiceInstance: any = null;

function getAutocompleteService(): any {
  if (autocompleteServiceInstance) return autocompleteServiceInstance;
  if (window.google?.maps?.places?.AutocompleteService) {
    autocompleteServiceInstance = new window.google.maps.places.AutocompleteService();
  }
  return autocompleteServiceInstance;
}

/**
 * Bezpośrednie wyszukiwanie w nowym Places API (New) firmy Google
 * Wspierane w projektach od 2024 roku z kluczem VITE_GOOGLE_MAPS_API_KEY.
 */
async function searchGooglePlacesNew(query: string): Promise<PlaceSuggestion[]> {
  if (!hasGoogleMapsKey()) return [];

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY!,
      },
      body: JSON.stringify({
        input: query,
        includedRegionCodes: ['pl'],
        languageCode: 'pl',
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      console.warn('[GooglePlacesNew] Błąd odpowiedzi Google:', errJson);
      return [];
    }

    const data = await res.json();
    if (!data.suggestions || !Array.isArray(data.suggestions)) return [];

    return data.suggestions
      .filter((s: any) => s.placePrediction)
      .slice(0, 6)
      .map((s: any) => {
        const p = s.placePrediction;
        const mainText = p.structuredFormat?.mainText?.text || p.text?.text?.split(',')[0] || '';
        const secondaryText = p.structuredFormat?.secondaryText?.text || '';
        const fullText = p.text?.text || `${mainText}, ${secondaryText}`;

        return {
          id: p.placeId || p.place,
          mainText,
          secondaryText,
          fullText,
          source: 'google' as const,
        };
      });
  } catch (err) {
    console.warn('[GooglePlacesNew] Wyjątek podczas wyszukiwania:', err);
    return [];
  }
}

/**
 * Fallback pobierający dane z publicznego silnika OpenStreetMap Nominatim
 * gdy klucz Google nie ma włączonej usługi Places API lub wystąpi błąd limitu.
 */
async function searchNominatim(query: string): Promise<PlaceSuggestion[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json&countrycodes=pl&limit=6&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const name = item.name || item.display_name.split(',')[0];
      const parts = item.display_name.split(',').map((s: string) => s.trim());
      // Odrzuć pierwszy element (który jest nazwą) i 'Polska' na końcu
      const secondary = parts.slice(1, 4).join(', ');

      return {
        id: `osm_${item.place_id}`,
        mainText: name,
        secondaryText: secondary || item.display_name,
        fullText: item.display_name,
        source: 'nominatim' as const,
      };
    });
  } catch (err) {
    console.warn('[Geocoder] Błąd podczas wyszukiwania w Nominatim:', err);
    return [];
  }
}

/**
 * Wyszukuje podpowiedzi lokalizacji z Google Maps Places API lub fallbacku.
 */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const cleanQuery = query.trim();

  // Jeśli zapytanie jest puste lub bardzo krótkie (< 2 znaki), zwróć rekomendowane lokalne węzły
  if (cleanQuery.length < 2) {
    return LOCAL_TRANSIT_HUBS.slice(0, 6).map((hub) => ({
      ...hub,
      source: 'local' as const,
    }));
  }

  const queryLower = cleanQuery.toLowerCase();

  // 1. Sprawdź najpierw w nowym oficjalnym Places API (New) Google
  if (hasGoogleMapsKey()) {
    const googleNewResults = await searchGooglePlacesNew(cleanQuery);
    if (googleNewResults.length > 0) {
      return googleNewResults;
    }
  }

  // 2. Próba pobrania z Google Maps SDK Places
  if (hasGoogleMapsKey()) {
    try {
      const loaded = await loadGoogleMapsScript();
      const service = loaded ? getAutocompleteService() : null;

      if (service && window.google?.maps) {
        const request: any = {
          input: cleanQuery,
          componentRestrictions: { country: 'pl' },
        };

        const googleResults: PlaceSuggestion[] = await new Promise((resolve) => {
          service.getPlacePredictions(request, (predictions: any[] | null, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
              const mapped = predictions.slice(0, 6).map((item) => ({
                id: item.place_id || item.description,
                mainText: item.structured_formatting?.main_text || item.description.split(',')[0],
                secondaryText: item.structured_formatting?.secondary_text || item.description,
                fullText: item.description,
                source: 'google' as const,
              }));
              resolve(mapped);
            } else {
              if (status !== window.google.maps.places.PlacesServiceStatus.OK && status !== 'ZERO_RESULTS') {
                console.warn(
                  `[GoogleMaps] Autocomplete status: ${status}. Sprawdź czy w Google Cloud Console włączono 'Places API (New)'. Aktywowano fallback.`,
                );
              }
              resolve([]);
            }
          });
        });

        if (googleResults.length > 0) {
          return googleResults;
        }
      }
    } catch (err) {
      console.warn('[GoogleMaps] Błąd podczas wyszukiwania w Google Places:', err);
    }
  }

  // 3. Jeśli Google nie zwrócił wyników (np. brak włączonego Places API w projekcie), spróbuj Nominatim
  const osmResults = await searchNominatim(cleanQuery);
  if (osmResults.length > 0) {
    return osmResults;
  }

  // 4. Fallback ostateczny: dopasowane węzły lokalne
  const matchedLocal = LOCAL_TRANSIT_HUBS.filter(
    (hub) =>
      hub.mainText.toLowerCase().includes(queryLower) ||
      hub.secondaryText.toLowerCase().includes(queryLower) ||
      hub.fullText.toLowerCase().includes(queryLower),
  );

  return matchedLocal.slice(0, 6).map((hub) => ({
    ...hub,
    source: 'local' as const,
  }));
}

/**
 * Otwiera bezpośrednią trasę w Google Maps dla podanych punktów początkowych i docelowych.
 */
export function openGoogleMapsRoute(origin: string, destination: string): void {
  if (!origin.trim() || !destination.trim()) return;
  const originParam = encodeURIComponent(origin.trim());
  const destParam = encodeURIComponent(destination.trim());
  const url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
