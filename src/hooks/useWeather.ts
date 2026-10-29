import { useState, useEffect, useCallback } from 'react';
import {
  fetchLiveWeatherData,
  type WeatherData,
  type HourlyForecastItem,
  type DailyForecastItem,
} from '../services/weatherService';

const fallbackHourly: HourlyForecastItem[] = [
  { timeStr: 'Teraz', dateStr: '', hour: 12, temp: 14, feels: 12, condition: 'Przejaśnienia', icon: 'partly-cloudy', rainChance: 10, rainAmount: 0.1, windSpeed: 14, windDirection: 270, uv: 2, isDay: true },
  { timeStr: '13:00', dateStr: '', hour: 13, temp: 15, feels: 13, condition: 'Słonecznie', icon: 'sun', rainChance: 0, rainAmount: 0, windSpeed: 12, windDirection: 270, uv: 3, isDay: true },
  { timeStr: '14:00', dateStr: '', hour: 14, temp: 15, feels: 14, condition: 'Częściowo słonecznie', icon: 'partly-cloudy', rainChance: 5, rainAmount: 0, windSpeed: 14, windDirection: 280, uv: 2, isDay: true },
  { timeStr: '15:00', dateStr: '', hour: 15, temp: 13, feels: 12, condition: 'Pochmurno', icon: 'cloudy', rainChance: 25, rainAmount: 0.2, windSpeed: 16, windDirection: 280, uv: 1, isDay: true },
  { timeStr: '16:00', dateStr: '', hour: 16, temp: 12, feels: 10, condition: 'Przelotny deszcz', icon: 'rain', rainChance: 65, rainAmount: 1.2, windSpeed: 18, windDirection: 290, uv: 1, isDay: true },
  { timeStr: '17:00', dateStr: '', hour: 17, temp: 10, feels: 9, condition: 'Lekki deszcz', icon: 'rain', rainChance: 45, rainAmount: 0.6, windSpeed: 15, windDirection: 290, uv: 0, isDay: true },
  { timeStr: '18:00', dateStr: '', hour: 18, temp: 9, feels: 7, condition: 'Przejaśnienia', icon: 'moon', rainChance: 15, rainAmount: 0, windSpeed: 12, windDirection: 300, uv: 0, isDay: false },
  { timeStr: '19:00', dateStr: '', hour: 19, temp: 8, feels: 6, condition: 'Pogodna noc', icon: 'moon', rainChance: 0, rainAmount: 0, windSpeed: 10, windDirection: 300, uv: 0, isDay: false },
];

const fallbackDaily: DailyForecastItem[] = [
  { date: '2026-10-29', dayName: 'Dziś', fullDate: '29 października', condition: 'Przejaśnienia', icon: 'partly-cloudy', maxTemp: 16, minTemp: 7, rainChance: 25, rainSum: 0.4, windMax: 22, uvMax: 2, sunrise: '06:14', sunset: '16:35' },
  { date: '2026-10-30', dayName: 'Jutro', fullDate: '30 października', condition: 'Słonecznie', icon: 'sun', maxTemp: 15, minTemp: 5, rainChance: 10, rainSum: 0, windMax: 18, uvMax: 3, sunrise: '06:16', sunset: '16:33' },
  { date: '2026-10-31', dayName: 'Sob', fullDate: '31 października', condition: 'Częściowo słonecznie', icon: 'partly-cloudy', maxTemp: 14, minTemp: 4, rainChance: 15, rainSum: 0.1, windMax: 16, uvMax: 2, sunrise: '06:18', sunset: '16:31' },
  { date: '2026-11-01', dayName: 'Nd', fullDate: '1 listopada', condition: 'Przelotny deszcz', icon: 'rain', maxTemp: 12, minTemp: 6, rainChance: 60, rainSum: 2.5, windMax: 28, uvMax: 1, sunrise: '06:20', sunset: '16:29' },
  { date: '2026-11-02', dayName: 'Pn', fullDate: '2 listopada', condition: 'Pochmurno', icon: 'cloudy', maxTemp: 10, minTemp: 3, rainChance: 20, rainSum: 0.2, windMax: 20, uvMax: 1, sunrise: '06:22', sunset: '16:27' },
  { date: '2026-11-03', dayName: 'Wt', fullDate: '3 listopada', condition: 'Słonecznie', icon: 'sun', maxTemp: 11, minTemp: 2, rainChance: 5, rainSum: 0, windMax: 14, uvMax: 2, sunrise: '06:24', sunset: '16:25' },
  { date: '2026-11-04', dayName: 'Śr', fullDate: '4 listopada', condition: 'Częściowo słonecznie', icon: 'partly-cloudy', maxTemp: 12, minTemp: 4, rainChance: 15, rainSum: 0.1, windMax: 16, uvMax: 2, sunrise: '06:26', sunset: '16:23' },
];

export const initialWeatherData: WeatherData = {
  temp: 14,
  feels: 12,
  max: 16,
  min: 7,
  condition: 'Przejaśnienia',
  icon: 'partly-cloudy',
  isDay: true,
  wind: 14,
  windGusts: 24,
  windDirection: 270,
  windDirectionLabel: 'Zachodni (Zach)',
  humidity: 62,
  pressure: 1016,
  pressureTrend: 'steady',
  dewPoint: 6.8,
  rain: 0.4,
  rainChance: 10,
  rainNext12h: 2.1,
  cloudCover: 55,
  visibility: 11,
  uv: 2,
  uvLabel: 'Niski',
  sunrise: '06:14',
  sunset: '16:35',
  dayLength: '10h 21m',
  aqi: {
    pm25: 9,
    pm10: 17,
    europeanAqi: 18,
    label: 'Dobra',
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    recommendation: 'Jakość powietrza zadowalająca, zanieczyszczenie nie stanowi zagrożenia.',
  },
  hourly: fallbackHourly,
  daily: fallbackDaily,
  alerts: [],
  lastUpdated: '12:00',
  source: 'Open-Meteo & stacja GIOŚ Mińsk Maz.',
};

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>(() => {
    try {
      const cached = localStorage.getItem('mojminsk_openmeteo_cache_v3');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data) return parsed.data;
      }
    } catch {
      // ignore
    }
    return initialWeatherData;
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchLiveWeatherData();
      setWeather(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd pobierania pogody';
      setError(msg);
      // zachowaj obecne/fallback dane
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();

    // Auto-refresh co 15 minut
    const interval = setInterval(() => {
      loadWeather();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadWeather]);

  return {
    weather,
    loading,
    refreshing,
    error,
    refresh: () => loadWeather(true),
  };
}
