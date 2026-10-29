/**
 * Infografiki pogodowe mójMińsk – wysokiej jakości wektorowe SVG z bogatą kolorystyką,
 * wyraźnymi obrysami (nigdy nie znikającymi na białym tle) oraz animacjami.
 *
 * - WeatherIllustration / WeatherIcon: słońce, księżyc, częściowe zachmurzenie,
 *   chmury (pochmurno), deszcz / mżawka, burza, śnieg, mgła.
 * - CloudCoverTile / RainTile / WindTile / UvTile / SunTile / AirTile:
 *   nowoczesne mini-infografiki kluczowych parametrów meteo.
 */
import { useId } from 'react';
import { cn } from './ui';
import type { WeatherData } from '../services/weatherService';

export type WeatherIconKind = WeatherData['icon'];

/* ================================================================== */
/* 1. GŁÓWNA ILUSTRACJA / IKONA POGODY                                */
/* ================================================================== */

export function WeatherIllustration({
  icon,
  isDay = true,
  animated = true,
  className,
}: {
  icon: WeatherIconKind;
  isDay?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '_');
  const night = !isDay;

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('h-10 w-10 shrink-0 overflow-visible select-none', className)}
      aria-hidden="true"
    >
      <defs>
        {/* Słońce: promienisty, ciepły gradient */}
        <radialGradient id={`sunGrad_${uid}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>

        {/* Księżyc */}
        <linearGradient id={`moonGrad_${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Jasna chmura (front): wysoki kontrast na białym tle dzięki ciemniejszej bazie */}
        <linearGradient id={`cloudFront_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Tylna chmura (głębia 3D, pochmurno) */}
        <linearGradient id={`cloudBack_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Ciemna chmura deszczowa / burzowa */}
        <linearGradient id={`cloudRain_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="60%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Błyskawica */}
        <linearGradient id={`boltGrad_${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>

        {/* Krople deszczu */}
        <linearGradient id={`dropGrad_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* 1. SŁOŃCE (BEZCHMURNIE DZIEŃ) */}
      {icon === 'sun' && (
        <g>
          {/* Promienie */}
          <g className={animated ? 'wx-spin' : undefined} style={{ transformOrigin: '32px 32px' }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              return (
                <line
                  key={i}
                  x1={32 + Math.cos(a) * 16}
                  y1={32 + Math.sin(a) * 16}
                  x2={32 + Math.cos(a) * 23}
                  y2={32 + Math.sin(a) * 23}
                  stroke="#F59E0B"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
          {/* Korona i dysk */}
          <circle cx="32" cy="32" r="14.5" fill={`url(#sunGrad_${uid})`} stroke="#EA580C" strokeWidth="1.2" />
          <circle cx="28" cy="28" r="4.5" fill="#FFFFFF" fillOpacity="0.45" />
        </g>
      )}

      {/* 2. KSIĘŻYC (BEZCHMURNIE NOC) */}
      {icon === 'moon' && (
        <g>
          <path
            d="M37 15 C26 15 18 23 18 33 C18 43 26 51 36 51 C39 51 42 50 45 48 C37 46 31 39 31 31 C31 22 37 17 45 17 C42 15 39 15 37 15 Z"
            fill={`url(#moonGrad_${uid})`}
            stroke="#D97706"
            strokeWidth="1.2"
          />
          {/* Gwiazdy */}
          <g className={animated ? 'wx-twinkle' : undefined}>
            <polygon points="17,17 18.5,13 20,17 24,18.5 20,20 18.5,24 17,20 13,18.5" fill="#F8FAFC" />
            <polygon points="46,38 47,35 48,38 51,39 48,40 47,43 46,40 43,39" fill="#F8FAFC" />
          </g>
        </g>
      )}

      {/* 3. CZĘŚCIOWO ZACHMURZONE (SŁOŃCE / KSIĘŻYC + CHMURA) */}
      {icon === 'partly-cloudy' && (
        <g>
          {/* Słońce / Księżyc w tle po prawej stronie */}
          {night ? (
            <path
              d="M40 14 C33 14 27 19 27 26 C27 32 32 38 39 38 C41 38 43 37 45 36 C39 34 35 29 35 23 C35 17 39 13 45 13 C43 14 41 14 40 14 Z"
              fill={`url(#moonGrad_${uid})`}
              stroke="#D97706"
              strokeWidth="1"
            />
          ) : (
            <g>
              <g className={animated ? 'wx-spin' : undefined} style={{ transformOrigin: '40px 22px' }}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={40 + Math.cos(rad) * 12}
                      y1={22 + Math.sin(rad) * 12}
                      x2={40 + Math.cos(rad) * 17}
                      y2={22 + Math.sin(rad) * 17}
                      stroke="#F59E0B"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
              <circle cx="40" cy="22" r="10.5" fill={`url(#sunGrad_${uid})`} stroke="#EA580C" strokeWidth="1" />
            </g>
          )}

          {/* Wyraźna, mięsista chmura na pierwszym planie */}
          <g className={animated ? 'wx-drift' : undefined}>
            {/* Cień pod chmurą */}
            <path
              d="M18 47 a9 9 0 0 1 1-17.8 A13 13 0 0 1 43 27 a10 10 0 0 1 9 19 z"
              fill="#64748B"
              fillOpacity="0.22"
              transform="translate(0 2)"
            />
            {/* Chmura */}
            <path
              d="M18 46 a9 9 0 0 1 1-17.8 A13 13 0 0 1 43 26 a10 10 0 0 1 9 19 z"
              fill={`url(#cloudFront_${uid})`}
              stroke="#64748B"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Biały refleks na grzbiecie chmury */}
            <path
              d="M21 28.5 A11.5 11.5 0 0 1 39 25.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        </g>
      )}

      {/* 4. POCHMURNO (DWIE WARSTWY CHMUR, 100% WIDOCZNE NA BIAŁYM TLE) */}
      {icon === 'cloudy' && (
        <g>
          {/* Tylna ciemniejsza chmura */}
          <g transform="translate(6 -4) scale(0.9)">
            <path
              d="M18 45 a9 9 0 0 1 1-17.8 A13 13 0 0 1 43 25 a10 10 0 0 1 9 19 z"
              fill={`url(#cloudBack_${uid})`}
              stroke="#475569"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </g>

          {/* Przednia jasna chmura z mocnym obrysem i cieniem */}
          <g className={animated ? 'wx-drift' : undefined} transform="translate(-2 2)">
            <path
              d="M16 46 a9.5 9.5 0 0 1 1-18.8 A14 14 0 0 1 44 25 a11 11 0 0 1 10 20 z"
              fill="#64748B"
              fillOpacity="0.25"
              transform="translate(0 2.5)"
            />
            <path
              d="M16 46 a9.5 9.5 0 0 1 1-18.8 A14 14 0 0 1 44 25 a11 11 0 0 1 10 20 z"
              fill={`url(#cloudFront_${uid})`}
              stroke="#475569"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Światło na chmurze */}
            <path
              d="M20 27.5 A12 12 0 0 1 40 24.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      )}

      {/* 5. DESZCZ / MŻAWKA */}
      {icon === 'rain' && (
        <g>
          {/* Ciemna chmura deszczowa */}
          <g className={animated ? 'wx-drift' : undefined}>
            <path
              d="M15 39 a8.5 8.5 0 0 1 1-16.8 A13 13 0 0 1 41 20 a10 10 0 0 1 10 18 z"
              fill="#334155"
              fillOpacity="0.25"
              transform="translate(0 2)"
            />
            <path
              d="M15 38 a8.5 8.5 0 0 1 1-16.8 A13 13 0 0 1 41 19 a10 10 0 0 1 10 18 z"
              fill={`url(#cloudRain_${uid})`}
              stroke="#334155"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M18 21.5 A11 11 0 0 1 37 19"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>

          {/* Wyraziste, krople deszczu ze skośnym spadem */}
          <g className={animated ? 'wx-rain' : undefined}>
            {[
              { x: 20, y: 44 },
              { x: 30, y: 43 },
              { x: 40, y: 44 },
              { x: 25, y: 51 },
              { x: 35, y: 51 },
            ].map((drop, i) => (
              <line
                key={i}
                x1={drop.x}
                y1={drop.y}
                x2={drop.x - 3}
                y2={drop.y + 7}
                stroke="#0284C7"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
      )}

      {/* 6. BURZA Z PIORUNAMI */}
      {icon === 'thunderstorm' && (
        <g>
          {/* Ciemna burzowa chmura */}
          <path
            d="M14 36 a8.5 8.5 0 0 1 1-16.8 A13 13 0 0 1 41 17 a10 10 0 0 1 10 18 z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Błyskawica wychodząca z chmury */}
          <polygon
            points="33,26 24,40 31,40 26,56 42,38 35,38"
            fill={`url(#boltGrad_${uid})`}
            stroke="#CA8A04"
            strokeWidth="1.2"
            className={animated ? 'wx-flash' : undefined}
          />

          {/* Dwie krople deszczu po bokach */}
          <line x1="18" y1="44" x2="15" y2="52" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="46" y1="43" x2="43" y2="51" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

      {/* 7. ŚNIEG */}
      {icon === 'snow' && (
        <g>
          {/* Chmura */}
          <path
            d="M15 37 a8.5 8.5 0 0 1 1-16.8 A13 13 0 0 1 41 18 a10 10 0 0 1 10 18 z"
            fill={`url(#cloudRain_${uid})`}
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Gwiazdki śniegu / płatki */}
          <g className={animated ? 'wx-snow' : undefined}>
            {[
              { cx: 20, cy: 46 },
              { cx: 32, cy: 45 },
              { cx: 44, cy: 46 },
              { cx: 26, cy: 53 },
              { cx: 38, cy: 53 },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.cx} cy={p.cy} r="2.2" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            ))}
          </g>
        </g>
      )}

      {/* 8. MGŁA */}
      {icon === 'fog' && (
        <g>
          <path
            d="M17 31 a7.5 7.5 0 0 1 1-14.8 A11.5 11.5 0 0 1 39 14 a9 9 0 0 1 9 16 z"
            fill={`url(#cloudFront_${uid})`}
            stroke="#64748B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Wyraźne poziome pasy mgły */}
          <line x1="12" y1="38" x2="52" y2="38" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="45" x2="48" y2="45" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="52" x2="44" y2="52" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/** Kompatybilny alias dla czytelności */
export const WeatherIcon = WeatherIllustration;

/* ================================================================== */
/* 2. MINI-INFOGRAFIKI PARAMETRÓW METEO                               */
/* ================================================================== */

function Tile({
  label,
  children,
  value,
  sub,
  className,
}: {
  label: string;
  children: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl bg-white/90 border border-white/80 p-2.5 shadow-2xs transition-all hover:bg-white hover:shadow-xs min-w-0',
        className,
      )}
    >
      <div className="shrink-0">{children}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 leading-none">{label}</p>
        <p className="mt-1 font-display text-[15px] font-extrabold text-ink leading-tight truncate">{value}</p>
        {sub && <p className="mt-0.5 text-[10.5px] font-semibold text-ink-500 leading-tight truncate">{sub}</p>}
      </div>
    </div>
  );
}

/** Pierścień postępu zachmurzenia z chmurą w centrum */
export function CloudCoverTile({ value }: { value: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const label =
    clamped < 15 ? 'Bezchmurnie' : clamped < 45 ? 'Małe zachmurzenie' : clamped < 75 ? 'Umiarkowane' : 'Całkowite';

  return (
    <Tile label="Zachmurzenie" value={`${clamped}%`} sub={label}>
      <div className="relative h-11 w-11 flex items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
          <circle cx="18" cy="18" r={r} fill="none" stroke="#E2E8F0" strokeWidth="3.6" />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke="#0284C7"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeDasharray={`${(clamped / 100) * c} ${c}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path
              d="M7 16 a3 3 0 0 1 .4-5.9 A4.5 4.5 0 0 1 15.5 9 a3.5 3.5 0 0 1 3.5 7 z"
              fill="#64748B"
            />
          </svg>
        </div>
      </div>
    </Tile>
  );
}

/** Kropla deszczu z wypełnieniem płynem i wolumenem opadów */
export function RainTile({ chance, next12h }: { chance: number; next12h: number }) {
  const uid = useId().replace(/:/g, '_');
  const clampedChance = Math.min(100, Math.max(0, chance));
  const fillHeight = (clampedChance / 100) * 32;
  const fillY = 36 - fillHeight;

  return (
    <Tile
      label="Opady"
      value={`${clampedChance}%`}
      sub={next12h > 0 ? `${next12h} mm w 12h` : 'Brak opadów w 12h'}
    >
      <svg viewBox="0 0 36 36" className="h-11 w-11">
        <defs>
          <clipPath id={`dropClip_${uid}`}>
            <path d="M18 3 C18 3 7 15 7 23 a11 11 0 0 0 22 0 C29 15 18 3 18 3 z" />
          </clipPath>
        </defs>

        {/* Tło kropli */}
        <path d="M18 3 C18 3 7 15 7 23 a11 11 0 0 0 22 0 C29 15 18 3 18 3 z" fill="#E0F2FE" />

        {/* Poziom wody z falą */}
        <g clipPath={`url(#dropClip_${uid})`}>
          <rect
            x="0"
            y={fillY}
            width="36"
            height="36"
            fill="#0284C7"
            className="transition-all duration-700"
          />
          <path
            d={`M0 ${fillY} q4.5 -2.5 9 0 t9 0 t9 0 t9 0 v5 h-36 z`}
            fill="#38BDF8"
            className="wx-wave"
          />
        </g>

        {/* Wyrazisty kontur kropli */}
        <path
          d="M18 3 C18 3 7 15 7 23 a11 11 0 0 0 22 0 C29 15 18 3 18 3 z"
          fill="none"
          stroke="#0284C7"
          strokeWidth="1.8"
        />
      </svg>
    </Tile>
  );
}

/** Kompas z aerodynamiczną igłą wiatru i porywami */
export function WindTile({
  speed,
  gusts,
  direction,
  directionLabel,
}: {
  speed: number;
  gusts: number;
  direction: number;
  directionLabel: string;
}) {
  const shortDir = directionLabel.match(/\(([^)]+)\)/)?.[1] ?? '';

  return (
    <Tile label="Wiatr" value={`${speed} km/h`} sub={`${shortDir} · porywy do ${gusts}`}>
      <svg viewBox="0 0 40 40" className="h-11 w-11">
        {/* Tarcza kompasu */}
        <circle cx="20" cy="20" r="17" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.6" />

        {/* Kierunki świata */}
        <text x="20" y="8" textAnchor="middle" fontSize="5" fontWeight="800" fill="#64748B">
          N
        </text>
        <text x="33.5" y="21.5" textAnchor="middle" fontSize="5" fontWeight="800" fill="#64748B">
          E
        </text>
        <text x="20" y="35" textAnchor="middle" fontSize="5" fontWeight="800" fill="#64748B">
          S
        </text>
        <text x="6.5" y="21.5" textAnchor="middle" fontSize="5" fontWeight="800" fill="#64748B">
          W
        </text>

        {/* Igła kompasu: wskazuje dokąd wieje wiatr */}
        <g
          style={{ transform: `rotate(${direction + 180}deg)`, transformOrigin: '20px 20px' }}
          className="transition-transform duration-700"
        >
          {/* Czerwony grot */}
          <polygon points="20,7 24,19 20,16.5 16,19" fill="#EF4444" stroke="#DC2626" strokeWidth="0.6" />
          {/* Ciemny trzon */}
          <line x1="20" y1="16.5" x2="20" y2="30" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <circle cx="20" cy="20" r="2.2" fill="#0F172A" />
      </svg>
    </Tile>
  );
}

/** Tarcza indeksu UV ze spektrum barw i igłą wskaźnika */
export function UvTile({ uv, label }: { uv: number; label: string }) {
  const uid = useId().replace(/:/g, '_');
  const clamped = Math.min(11, Math.max(0, uv));
  const angle = -90 + (clamped / 11) * 180;

  return (
    <Tile label="Indeks UV" value={`${uv} / 11`} sub={label}>
      <svg viewBox="0 0 40 40" className="h-11 w-11">
        <defs>
          <linearGradient id={`uvGrad_${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="30%" stopColor="#EAB308" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="85%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* Łuk indeksu UV */}
        <path
          d="M6 29 A14 14 0 0 1 34 29"
          fill="none"
          stroke={`url(#uvGrad_${uid})`}
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Wskaźnik igłowy */}
        <g
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: '20px 29px' }}
          className="transition-transform duration-700"
        >
          <line x1="20" y1="29" x2="20" y2="15" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        <circle cx="20" cy="29" r="3" fill="#0F172A" />
      </svg>
    </Tile>
  );
}

/** Łuk słońca z aktualną pozycją, wschodem, zachodem i czasem dnia */
export function SunTile({ sunrise, sunset, dayLength }: { sunrise: string; sunset: string; dayLength: string }) {
  const now = new Date();
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const riseMin = toMin(sunrise);
  const setMin = toMin(sunset);
  const span = Math.max(1, setMin - riseMin);
  const t = Math.min(1, Math.max(0, (nowMin - riseMin) / span));
  const isUp = nowMin >= riseMin && nowMin <= setMin;

  // Pozycja słońca na łuku parabolicznym
  const x = (1 - t) ** 2 * 5 + 2 * (1 - t) * t * 24 + t ** 2 * 43;
  const y = (1 - t) ** 2 * 28 + 2 * (1 - t) * t * 2 + t ** 2 * 28;

  const minsToSunset = setMin - nowMin;
  const sub = isUp
    ? minsToSunset < 120
      ? `Zachód za ${Math.floor(minsToSunset / 60)}h ${minsToSunset % 60}m`
      : `Dzień trwa ${dayLength}`
    : `Wschód słońca o ${sunrise}`;

  return (
    <Tile label="Słońce" value={`${sunrise} – ${sunset}`} sub={sub}>
      <svg viewBox="0 0 48 36" className="h-11 w-12">
        {/* Horyzont */}
        <line x1="2" y1="29" x2="46" y2="29" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

        {/* Trajektoria dzienna */}
        <path
          d="M5 29 Q24 2 43 29"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="2.2"
          strokeDasharray="3 3"
        />

        {/* Przebyta część dnia */}
        {isUp && (
          <path
            d="M5 29 Q24 2 43 29"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.8"
            strokeDasharray={`${t * 54} 100`}
            strokeLinecap="round"
          />
        )}

        {/* Słońce na niebie */}
        <circle
          cx={x}
          cy={y}
          r="4.8"
          fill={isUp ? '#FBBF24' : '#94A3B8'}
          stroke="#EA580C"
          strokeWidth="1.2"
        />
        <circle cx={x - 1} cy={y - 1} r="1.5" fill="#FFFFFF" />
      </svg>
    </Tile>
  );
}

/** Wskaźnik jakości powietrza ze stacji GIOŚ w Mińsku Mazowieckim */
export function AirTile({ pm25, pm10, label }: { pm25: number; pm10: number; label: string }) {
  // Skala GIOŚ dla PM2.5 (0 do 110 µg/m³)
  const pos = Math.min(100, Math.max(0, (pm25 / 110) * 100));

  return (
    <Tile label="Powietrze (GIOŚ)" value={label} sub={`PM2.5: ${pm25} · PM10: ${pm10} µg/m³`}>
      <div className="w-12 py-1">
        <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 via-55% to-rose-500 shadow-inner">
          <span
            className="absolute -top-0.5 h-3.5 w-2 -translate-x-1/2 rounded-sm bg-ink ring-2 ring-white shadow-xs transition-all duration-700"
            style={{ left: `${pos}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[7.5px] font-extrabold text-ink-400">
          <span>0</span>
          <span>norma 15</span>
          <span>110</span>
        </div>
      </div>
    </Tile>
  );
}

/** Zestaw 6 infografik bieżących warunków */
export function WeatherInfographicsRow({ weather, className }: { weather: WeatherData; className?: string }) {
  return (
    <div className={cn('grid gap-2', className)}>
      <CloudCoverTile value={weather.cloudCover ?? 0} />
      <RainTile chance={weather.rainChance ?? weather.hourly[0]?.rainChance ?? 0} next12h={weather.rainNext12h ?? 0} />
      <WindTile
        speed={weather.wind}
        gusts={weather.windGusts}
        direction={weather.windDirection}
        directionLabel={weather.windDirectionLabel}
      />
      <UvTile uv={weather.uv} label={weather.uvLabel} />
      <SunTile sunrise={weather.sunrise} sunset={weather.sunset} dayLength={weather.dayLength} />
      <AirTile pm25={weather.aqi.pm25} pm10={weather.aqi.pm10} label={weather.aqi.label} />
    </div>
  );
}
