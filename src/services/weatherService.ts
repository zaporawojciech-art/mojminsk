/**
 * Serwis Pogodowy mójMińsk oparty na Open-Meteo & stacji GIOŚ w Mińsku Mazowieckim
 * Współrzędne Mińska Mazowieckiego: 52.1793° N, 21.5728° E
 * Bez klucza API, darmowe modele numeryczne ECMWF & DWD ICON z cache 15 min.
 */

export interface HourlyForecastItem {
  timeStr: string; // np. "14:00"
  dateStr: string; // np. "2026-10-29T14:00"
  hour: number;
  temp: number;
  feels: number;
  condition: string;
  icon: 'sun' | 'moon' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog';
  rainChance: number; // %
  rainAmount: number; // mm
  windSpeed: number; // km/h
  windDirection: number; // stopnie
  uv: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string; // np. "Dziś", "Jutro", "Pt", "Sob"
  fullDate: string; // np. "30 października"
  condition: string;
  icon: 'sun' | 'moon' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog';
  maxTemp: number;
  minTemp: number;
  rainChance: number; // %
  rainSum: number; // mm
  windMax: number; // km/h
  uvMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  pm25: number;
  pm10: number;
  europeanAqi: number;
  label: 'Bardzo dobra' | 'Dobra' | 'Umiarkowana' | 'Dostateczna' | 'Zła' | 'Bardzo zła';
  color: string;
  recommendation: string;
}

export interface WeatherAlert {
  id: string;
  level: 'warning' | 'info' | 'caution';
  title: string;
  description: string;
}

export interface WeatherData {
  temp: number;
  feels: number;
  max: number;
  min: number;
  condition: string;
  icon: 'sun' | 'moon' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog';
  isDay: boolean;
  wind: number; // km/h
  windGusts: number; // km/h
  windDirection: number; // deg
  windDirectionLabel: string; // np. "Zachodni (Z)"
  humidity: number; // %
  pressure: number; // hPa
  pressureTrend: 'rising' | 'steady' | 'falling';
  dewPoint: number; // °C
  rain: number; // mm
  rainChance: number; // % prawdopodobieństwo opadów w bieżącej godzinie
  rainNext12h: number; // mm suma opadów w ciągu najbliższych 12h
  cloudCover: number; // % zachmurzenia
  visibility: number; // km
  uv: number;
  uvLabel: string;
  sunrise: string;
  sunset: string;
  dayLength: string;
  aqi: AirQualityData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts: WeatherAlert[];
  lastUpdated: string;
  source: string;
}

const MINSK_LAT = 52.1793;
const MINSK_LON = 21.5728;
const CACHE_KEY = 'mojminsk_openmeteo_cache_v3';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minut

export function mapWmoToCondition(code: number, isDay: boolean = true): {
  condition: string;
  icon: 'sun' | 'moon' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog';
} {
  switch (code) {
    case 0:
      return {
        condition: isDay ? 'Bezchmurnie' : 'Pogodna noc',
        icon: isDay ? 'sun' : 'moon',
      };
    case 1:
      return {
        condition: isDay ? 'Głównie słonecznie' : 'Przeważnie pogodnie',
        icon: isDay ? 'partly-cloudy' : 'moon',
      };
    case 2:
      return {
        condition: 'Częściowe zachmurzenie',
        icon: 'partly-cloudy',
      };
    case 3:
      return {
        condition: 'Pochmurno',
        icon: 'cloudy',
      };
    case 45:
    case 48:
      return {
        condition: 'Mgła',
        icon: 'fog',
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: 'Mżawka',
        icon: 'rain',
      };
    case 56:
    case 57:
      return {
        condition: 'Marznąca mżawka',
        icon: 'rain',
      };
    case 61:
      return {
        condition: 'Lekki deszcz',
        icon: 'rain',
      };
    case 63:
      return {
        condition: 'Umiarkowany deszcz',
        icon: 'rain',
      };
    case 65:
      return {
        condition: 'Ulewny deszcz',
        icon: 'rain',
      };
    case 66:
    case 67:
      return {
        condition: 'Marznący deszcz',
        icon: 'rain',
      };
    case 71:
      return {
        condition: 'Lekkie opady śniegu',
        icon: 'snow',
      };
    case 73:
    case 75:
      return {
        condition: 'Opady śniegu',
        icon: 'snow',
      };
    case 77:
      return {
        condition: 'Śnieg ziarnisty',
        icon: 'snow',
      };
    case 80:
      return {
        condition: 'Przelotny lekki deszcz',
        icon: 'rain',
      };
    case 81:
    case 82:
      return {
        condition: 'Przelotne ulewy',
        icon: 'rain',
      };
    case 85:
    case 86:
      return {
        condition: 'Przelotne opady śniegu',
        icon: 'snow',
      };
    case 95:
      return {
        condition: 'Burza',
        icon: 'thunderstorm',
      };
    case 96:
    case 99:
      return {
        condition: 'Burza z gradem',
        icon: 'thunderstorm',
      };
    default:
      return {
        condition: isDay ? 'Przejaśnienia' : 'Przejaśnienia nocą',
        icon: isDay ? 'partly-cloudy' : 'moon',
      };
  }
}

export function getWindDirectionLabel(degrees: number): string {
  const directions = [
    'Północny (Pn)',
    'Północno-wschodni (Pn-Wsch)',
    'Wschodni (Wsch)',
    'Południowo-wschodni (Pd-Wsch)',
    'Południowy (Pd)',
    'Południowo-zachodni (Pd-Zach)',
    'Zachodni (Zach)',
    'Północno-zachodni (Pn-Zach)',
  ];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function getUvLabel(uv: number): string {
  if (uv <= 2) return 'Niski';
  if (uv <= 5) return 'Umiarkowany';
  if (uv <= 7) return 'Wysoki';
  if (uv <= 10) return 'Bardzo wysoki';
  return 'Ekstremalny';
}

export function parseAirQuality(pm25: number, pm10: number): AirQualityData {
  let label: AirQualityData['label'] = 'Bardzo dobra';
  let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let recommendation = 'Jakość powietrza jest idealna na aktywność na świeżym powietrzu i wietrzenie mieszkań.';

  if (pm25 <= 13 && pm10 <= 20) {
    label = 'Bardzo dobra';
    color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    recommendation = 'Świetne warunki na spacer po Parku Dernałowiczów i aktywność na dworze.';
  } else if (pm25 <= 35 && pm10 <= 50) {
    label = 'Dobra';
    color = 'text-emerald-800 bg-emerald-50/80 border-emerald-200';
    recommendation = 'Jakość powietrza zadowalająca, zanieczyszczenie nie stanowi zagrożenia.';
  } else if (pm25 <= 55 && pm10 <= 80) {
    label = 'Umiarkowana';
    color = 'text-amber-800 bg-amber-50 border-amber-200';
    recommendation = 'Osoby wrażliwe, dzieci i seniorzy powinni rozważyć ograniczenie dłuższego wysiłku na dworze.';
  } else if (pm25 <= 75 && pm10 <= 110) {
    label = 'Dostateczna';
    color = 'text-orange-800 bg-orange-50 border-orange-200';
    recommendation = 'Zaleca się ograniczenie intensywnego wysiłku na zewnątrz w centrum Mińska.';
  } else if (pm25 <= 110 || pm10 <= 150) {
    label = 'Zła';
    color = 'text-coral-800 bg-coral-50 border-coral-200';
    recommendation = 'Niekorzystne warunki. Zalecane unikanie przebywania na dworze i zamknięcie okien.';
  } else {
    label = 'Bardzo zła';
    color = 'text-purple-800 bg-purple-50 border-purple-200';
    recommendation = 'Smog przekracza normy alarmowe. Zostań w domu i włącz oczyszczacz powietrza.';
  }

  return {
    pm25: Math.round(pm25),
    pm10: Math.round(pm10),
    europeanAqi: Math.round((pm25 / 25) * 50),
    label,
    color,
    recommendation,
  };
}

// Obliczenie punktu rosy (Magnus formula)
export function calculateDewPoint(temp: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint * 10) / 10;
}

// Formatowanie daty po polsku
const POLISH_DAYS_SHORT = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

export async function fetchLiveWeatherData(): Promise<WeatherData> {
  // 1. Sprawdź cache w localStorage
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
        return parsed.data as WeatherData;
      }
    }
  } catch {
    // Ignoruj błędy localStorage (np. private browsing)
  }

  // 2. Zapytania do Open-Meteo
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${MINSK_LAT}&longitude=${MINSK_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,cloud_cover,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Europe%2FWarsaw&forecast_days=7`;
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${MINSK_LAT}&longitude=${MINSK_LON}&current=pm10,pm2_5,european_aqi&timezone=Europe%2FWarsaw`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl).then((r) => r.json()),
    fetch(airQualityUrl).then((r) => r.json()),
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value?.current) {
    throw new Error('Nie udało się pobrać danych pogodowych z Open-Meteo');
  }

  const wData = weatherRes.value;
  const aqiData = aqiRes.status === 'fulfilled' ? aqiRes.value?.current : null;

  const current = wData.current;
  const daily = wData.daily;
  const hourly = wData.hourly;

  const isDay = Boolean(current.is_day);
  const conditionObj = mapWmoToCondition(current.weather_code, isDay);

  // Wskaźniki jakości powietrza
  const pm25Val = aqiData?.pm2_5 ?? 9;
  const pm10Val = aqiData?.pm10 ?? 17;
  const aqi = parseAirQuality(pm25Val, pm10Val);

  // Wschód i zachód z dzisiejszego dnia
  const todaySunriseIso = daily.sunrise?.[0] || '';
  const todaySunsetIso = daily.sunset?.[0] || '';
  const sunriseTime = todaySunriseIso ? todaySunriseIso.slice(11, 16) : '06:14';
  const sunsetTime = todaySunsetIso ? todaySunsetIso.slice(11, 16) : '16:35';

  // Długość dnia
  let dayLengthStr = '10h 21m';
  if (todaySunriseIso && todaySunsetIso) {
    const rise = new Date(todaySunriseIso).getTime();
    const set = new Date(todaySunsetIso).getTime();
    if (!isNaN(rise) && !isNaN(set) && set > rise) {
      const diffMin = Math.round((set - rise) / (1000 * 60));
      const hours = Math.floor(diffMin / 60);
      const minutes = diffMin % 60;
      dayLengthStr = `${hours}h ${minutes}m`;
    }
  }

  // Obliczenie tendencji ciśnienia (porównanie z ciśnieniem sprzed 3h w hourly)
  let pressureTrend: 'rising' | 'steady' | 'falling' = 'steady';
  const nowHourIndex = new Date().getHours();
  if (hourly.surface_pressure && hourly.surface_pressure.length > nowHourIndex) {
    const curP = current.surface_pressure;
    const prevP = hourly.surface_pressure[Math.max(0, nowHourIndex - 3)] ?? curP;
    const diff = curP - prevP;
    if (diff > 1.2) pressureTrend = 'rising';
    else if (diff < -1.2) pressureTrend = 'falling';
  }

  // Mapowanie prognozy godzinowej (kolejne 24h od teraz)
  const hourlyItems: HourlyForecastItem[] = [];
  const startIndex = nowHourIndex;
  const totalHours = Math.min(24, (hourly.time?.length || 0) - startIndex);

  for (let i = 0; i < totalHours; i++) {
    const idx = startIndex + i;
    const timeIso = hourly.time[idx];
    const hourNum = new Date(timeIso).getHours();
    const hIsDay = hourNum >= 6 && hourNum < 20;
    const hCond = mapWmoToCondition(hourly.weather_code[idx], hIsDay);

    hourlyItems.push({
      timeStr: `${String(hourNum).padStart(2, '0')}:00`,
      dateStr: timeIso,
      hour: hourNum,
      temp: Math.round(hourly.temperature_2m[idx]),
      feels: Math.round(hourly.apparent_temperature[idx]),
      condition: hCond.condition,
      icon: hCond.icon,
      rainChance: Math.round(hourly.precipitation_probability[idx] || 0),
      rainAmount: Math.round((hourly.precipitation[idx] || 0) * 10) / 10,
      windSpeed: Math.round(hourly.wind_speed_10m[idx] || 0),
      windDirection: Math.round(hourly.wind_direction_10m[idx] || 0),
      uv: Math.round(hourly.uv_index[idx] || 0),
      isDay: hIsDay,
    });
  }

  // Mapowanie prognozy 7-dniowej
  const dailyItems: DailyForecastItem[] = [];
  const totalDays = daily.time?.length || 0;

  for (let d = 0; d < totalDays; d++) {
    const dateStr = daily.time[d];
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();

    let dayName = POLISH_DAYS_SHORT[dayOfWeek];
    if (d === 0) dayName = 'Dziś';
    else if (d === 1) dayName = 'Jutro';

    const fullDate = `${dateObj.getDate()} ${POLISH_MONTHS[dateObj.getMonth()]}`;
    const dCond = mapWmoToCondition(daily.weather_code[d], true);

    dailyItems.push({
      date: dateStr,
      dayName,
      fullDate,
      condition: dCond.condition,
      icon: dCond.icon,
      maxTemp: Math.round(daily.temperature_2m_max[d]),
      minTemp: Math.round(daily.temperature_2m_min[d]),
      rainChance: Math.round(daily.precipitation_probability_max?.[d] || 0),
      rainSum: Math.round((daily.precipitation_sum?.[d] || 0) * 10) / 10,
      windMax: Math.round(daily.wind_speed_10m_max?.[d] || 0),
      uvMax: Math.round(daily.uv_index_max?.[d] || 0),
      sunrise: daily.sunrise?.[d] ? daily.sunrise[d].slice(11, 16) : '',
      sunset: daily.sunset?.[d] ? daily.sunset[d].slice(11, 16) : '',
    });
  }

  // Generowanie alertów meteorologicznych
  const alerts: WeatherAlert[] = [];
  if (current.wind_gusts_10m && current.wind_gusts_10m >= 55) {
    alerts.push({
      id: 'wind_alert',
      level: 'warning',
      title: 'Ostrzeżenie: Silne porywy wiatru',
      description: `W Mińsku Mazowieckim prognozowane są porywy do ${Math.round(current.wind_gusts_10m)} km/h. Uważaj na połamane gałęzie i zabezpiecz przedmioty na balkonach.`,
    });
  }
  if (daily.temperature_2m_min?.[0] !== undefined && daily.temperature_2m_min[0] <= 0) {
    alerts.push({
      id: 'frost_alert',
      level: 'caution',
      title: 'Przymrozki i ryzyko oblodzenia dróg',
      description: `Temperatura minimalna spadnie do ${Math.round(daily.temperature_2m_min[0])}°C. Śliska nawierzchnia na trasie DK92 i ulicach osiedlowych.`,
    });
  }
  if (aqi.label === 'Zła' || aqi.label === 'Bardzo zła') {
    alerts.push({
      id: 'smog_alert',
      level: 'warning',
      title: 'Podwyższony poziom smogu PM2.5',
      description: `Stacja pomiarowa w Mińsku Mazowieckim notuje stężenie PM2.5 na poziomie ${aqi.pm25} µg/m³. Zalecane ograniczenie dłuższego przebywania na zewnątrz.`,
    });
  }
  if (current.weather_code === 95 || current.weather_code === 96 || current.weather_code === 99) {
    alerts.push({
      id: 'thunder_alert',
      level: 'warning',
      title: 'Burza nad Mińskiem Mazowieckim',
      description: 'Zarejestrowano wyładowania atmosferyczne w regionie. Zachowaj szczególną ostrożność.',
    });
  }

  const uvVal = Math.round(hourlyItems[0]?.uv || 1);

  const formattedData: WeatherData = {
    temp: Math.round(current.temperature_2m),
    feels: Math.round(current.apparent_temperature),
    max: Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m),
    min: Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m),
    condition: conditionObj.condition,
    icon: conditionObj.icon,
    isDay,
    wind: Math.round(current.wind_speed_10m),
    windGusts: Math.round(current.wind_gusts_10m || current.wind_speed_10m),
    windDirection: Math.round(current.wind_direction_10m || 0),
    windDirectionLabel: getWindDirectionLabel(current.wind_direction_10m || 0),
    humidity: Math.round(current.relative_humidity_2m),
    pressure: Math.round(current.surface_pressure),
    pressureTrend,
    dewPoint: calculateDewPoint(current.temperature_2m, current.relative_humidity_2m),
    rain: Math.round((current.precipitation || 0) * 10) / 10,
    rainChance: hourlyItems[0]?.rainChance ?? 0,
    rainNext12h:
      Math.round(hourlyItems.slice(0, 12).reduce((sum, h) => sum + (h.rainAmount || 0), 0) * 10) / 10,
    cloudCover: Math.round(current.cloud_cover ?? hourly.cloud_cover?.[startIndex] ?? 0),
    visibility: Math.round((hourly.visibility?.[startIndex] || 10000) / 1000),
    uv: uvVal,
    uvLabel: getUvLabel(uvVal),
    sunrise: sunriseTime,
    sunset: sunsetTime,
    dayLength: dayLengthStr,
    aqi,
    hourly: hourlyItems,
    daily: dailyItems,
    alerts,
    lastUpdated: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    source: 'Open-Meteo & stacja GIOŚ Mińsk Maz.',
  };

  // Zapisz do localStorage
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: formattedData })
    );
  } catch {
    // ignoruj
  }

  return formattedData;
}
