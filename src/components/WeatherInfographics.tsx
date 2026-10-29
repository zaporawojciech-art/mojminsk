/**
 * Infografiki pogodowe mójMińsk – lekkie, animowane SVG bez zewnętrznych bibliotek.
 * - WeatherIllustration: animowana scena aktualnej pogody (słońce, chmury, deszcz, śnieg, burza, mgła, noc)
 * - CloudCoverTile / RainTile / WindTile / UvTile / SunTile / AirTile: mini-infografiki kluczowych parametrów
 */
import { cn } from './ui';
import type { WeatherData } from '../services/weatherService';

type IconKind = WeatherData['icon'];

/* ------------------------------------------------------------------ */
/* 1. Animowana ilustracja aktualnej pogody                            */
/* ------------------------------------------------------------------ */

function Sun({ cx = 38, cy = 34, r = 15 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <g>
      <g className="wx-spin" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * (r + 4)}
              y1={cy + Math.sin(a) * (r + 4)}
              x2={cx + Math.cos(a) * (r + 10)}
              y2={cy + Math.sin(a) * (r + 10)}
              stroke="#F2B544"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="url(#wxSun)" />
    </g>
  );
}

function Moon({ cx = 40, cy = 32 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="14" fill="#F4E7C5" />
      <circle cx={cx + 7} cy={cy - 5} r="12" fill="url(#wxNightBg)" />
      <circle cx={cx - 22} cy={cy - 14} r="1.3" fill="#fff" className="wx-twinkle" />
      <circle cx={cx + 22} cy={cy + 10} r="1" fill="#fff" className="wx-twinkle" style={{ animationDelay: '0.8s' }} />
    </g>
  );
}

function CloudShape({
  x,
  y,
  scale = 1,
  tone = 'light',
  drift = true,
}: {
  x: number;
  y: number;
  scale?: number;
  tone?: 'light' | 'grey' | 'dark';
  drift?: boolean;
}) {
  const fill = tone === 'dark' ? 'url(#wxCloudDark)' : tone === 'grey' ? 'url(#wxCloudGrey)' : 'url(#wxCloudLight)';
  return (
    <g className={drift ? 'wx-drift' : undefined}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path
          d="M10 30 a10 10 0 0 1 2-19.8 A14 14 0 0 1 39 8 a11 11 0 0 1 11 22 z"
          fill={fill}
          stroke={tone === 'light' ? '#8E9BB0' : tone === 'grey' ? '#6B788D' : '#3B4558'}
          strokeWidth="1.4"
          strokeLinejoin="round"
          filter="url(#wxShadow)"
        />
      </g>
    </g>
  );
}

function RainDrops({ heavy = false }: { heavy?: boolean }) {
  const drops = heavy ? [24, 34, 44, 54, 64, 29, 49, 59] : [30, 44, 58, 37, 51];
  return (
    <g>
      {drops.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={62}
          x2={x - 3}
          y2={70}
          stroke="#4A8FD9"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="wx-rain"
          style={{ animationDelay: `${(i * 0.17) % 0.9}s` }}
        />
      ))}
    </g>
  );
}

function SnowFlakes() {
  return (
    <g>
      {[28, 42, 56, 35, 50].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={64}
          r="2.2"
          fill="#fff"
          stroke="#9CC3EC"
          strokeWidth="0.8"
          className="wx-snow"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </g>
  );
}

export function WeatherIllustration({
  icon,
  isDay = true,
  className,
}: {
  icon: IconKind;
  isDay?: boolean;
  className?: string;
}) {
  const night = !isDay;
  return (
    <svg viewBox="0 0 90 84" className={cn('h-20 w-20 shrink-0 overflow-visible', className)} aria-hidden>
      <defs>
        <radialGradient id="wxSun" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF4D6" />
          <stop offset="55%" stopColor="#F7C15A" />
          <stop offset="100%" stopColor="#E9A23B" />
        </radialGradient>
        <linearGradient id="wxCloudLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D3DCEA" />
        </linearGradient>
        <linearGradient id="wxCloudGrey" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C3CCDA" />
          <stop offset="100%" stopColor="#8D9AAF" />
        </linearGradient>
        <linearGradient id="wxCloudDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A869A" />
          <stop offset="100%" stopColor="#465267" />
        </linearGradient>
        <filter id="wxShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#1F1D2B" floodOpacity="0.22" />
        </filter>
        <linearGradient id="wxNightBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7D6EC" />
          <stop offset="100%" stopColor="#B7C9E3" />
        </linearGradient>
      </defs>

      {icon === 'sun' && <Sun cx={45} cy={40} r={18} />}

      {icon === 'moon' && <Moon cx={45} cy={40} />}

      {icon === 'partly-cloudy' && (
        <>
          {night ? <Moon cx={34} cy={30} /> : <Sun cx={34} cy={30} r={14} />}
          <CloudShape x={22} y={34} scale={1.15} />
        </>
      )}

      {icon === 'cloudy' && (
        <>
          <CloudShape x={6} y={20} scale={0.9} tone="grey" />
          <CloudShape x={24} y={32} scale={1.15} />
        </>
      )}

      {icon === 'fog' && (
        <>
          <CloudShape x={18} y={18} scale={1.1} tone="grey" drift={false} />
          {[56, 64, 72].map((y, i) => (
            <line
              key={y}
              x1={14 + i * 4}
              y1={y}
              x2={76 - i * 4}
              y2={y}
              stroke="#8D9AAF"
              strokeWidth="3"
              strokeLinecap="round"
              className="wx-drift"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          ))}
        </>
      )}

      {icon === 'rain' && (
        <>
          <CloudShape x={6} y={14} scale={0.85} tone="grey" />
          <CloudShape x={20} y={24} scale={1.15} tone="grey" />
          <RainDrops />
        </>
      )}

      {icon === 'snow' && (
        <>
          <CloudShape x={18} y={22} scale={1.15} tone="grey" />
          <SnowFlakes />
        </>
      )}

      {icon === 'thunderstorm' && (
        <>
          <CloudShape x={18} y={20} scale={1.2} tone="dark" />
          <path d="M46 54 L38 68 L45 68 L40 80 L54 63 L47 63 L52 54 Z" fill="#F7C15A" className="wx-flash" />
          <RainDrops heavy />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Mini-infografiki parametrów                                       */
/* ------------------------------------------------------------------ */

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
        'flex items-center gap-2.5 rounded-xl bg-white/80 border border-white/70 px-2.5 py-2 shadow-2xs min-w-0',
        className,
      )}
    >
      <div className="shrink-0">{children}</div>
      <div className="min-w-0">
        <p className="text-[9.5px] font-bold uppercase tracking-wide text-ink-400 leading-none">{label}</p>
        <p className="mt-1 font-display text-[14px] font-extrabold text-ink leading-none truncate">{value}</p>
        {sub && <p className="mt-0.5 text-[10px] font-medium text-ink-500 leading-tight truncate">{sub}</p>}
      </div>
    </div>
  );
}

/** Pierścień postępu z ikoną chmury w środku */
export function CloudCoverTile({ value }: { value: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const label =
    value < 15 ? 'Bezchmurnie' : value < 40 ? 'Małe zachm.' : value < 75 ? 'Umiarkowane' : 'Całkowite';
  return (
    <Tile label="Zachmurzenie" value={`${value}%`} sub={label}>
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#E4EBF5" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#8CA9D3"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          transform="rotate(-90 20 20)"
          className="transition-all duration-700"
        />
        <path
          d="M14 25 a4 4 0 0 1 .8-7.9 A5.6 5.6 0 0 1 25.6 16 a4.4 4.4 0 0 1 .4 9 z"
          fill="#7F8DA3"
        />
      </svg>
    </Tile>
  );
}

/** Kropla wypełniona proporcjonalnie do prawdopodobieństwa opadów */
export function RainTile({ chance, next12h }: { chance: number; next12h: number }) {
  const fillY = 36 - (Math.min(100, Math.max(0, chance)) / 100) * 30;
  return (
    <Tile
      label="Opady"
      value={`${chance}%`}
      sub={next12h > 0 ? `${next12h} mm w 12h` : 'Brak opadów w 12h'}
    >
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <defs>
          <clipPath id="dropClip">
            <path d="M20 4 C20 4 9 17 9 25 a11 11 0 0 0 22 0 C31 17 20 4 20 4 z" />
          </clipPath>
        </defs>
        <path d="M20 4 C20 4 9 17 9 25 a11 11 0 0 0 22 0 C31 17 20 4 20 4 z" fill="#E4EEF9" />
        <g clipPath="url(#dropClip)">
          <rect x="0" y={fillY} width="40" height="40" fill="#4A8FD9" className="transition-all duration-700" />
          <path
            d={`M0 ${fillY} q5 -2 10 0 t10 0 t10 0 t10 0 v4 h-40 z`}
            fill="#7DB1E8"
            className="wx-wave"
          />
        </g>
        <path
          d="M20 4 C20 4 9 17 9 25 a11 11 0 0 0 22 0 C31 17 20 4 20 4 z"
          fill="none"
          stroke="#4A8FD9"
          strokeWidth="1.5"
        />
      </svg>
    </Tile>
  );
}

/** Kompas z animowaną strzałką kierunku wiatru */
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
    <Tile label="Wiatr" value={`${speed} km/h`} sub={`${shortDir} · porywy ${gusts}`}>
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <circle cx="20" cy="20" r="16" fill="#F3F6FA" stroke="#D5DDE8" strokeWidth="1.5" />
        {['N', 'E', 'S', 'W'].map((d, i) => {
          const pos = [
            [20, 8.5],
            [32, 21.5],
            [20, 34.5],
            [8, 21.5],
          ][i];
          return (
            <text
              key={d}
              x={pos[0]}
              y={pos[1]}
              textAnchor="middle"
              fontSize="5"
              fontWeight="700"
              fill="#8A93A3"
            >
              {['Pn', 'W', 'Pd', 'Z'][i]}
            </text>
          );
        })}
        {/* Strzałka wskazuje, DOKĄD wieje wiatr (kierunek meteorologiczny + 180°) */}
        <g
          style={{ transform: `rotate(${direction + 180}deg)`, transformOrigin: '20px 20px' }}
          className="transition-transform duration-700"
        >
          <path d="M20 9 L24 21 L20 18.5 L16 21 Z" fill="#E7735C" />
          <line x1="20" y1="18.5" x2="20" y2="29" stroke="#1F1D2B" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <circle cx="20" cy="20" r="1.8" fill="#1F1D2B" />
      </svg>
    </Tile>
  );
}

/** Półokrągły wskaźnik UV z gradientem i igłą */
export function UvTile({ uv, label }: { uv: number; label: string }) {
  const clamped = Math.min(11, Math.max(0, uv));
  const angle = -90 + (clamped / 11) * 180;
  return (
    <Tile label="Indeks UV" value={`${uv}`} sub={label}>
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <defs>
          <linearGradient id="uvGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#5BBE7A" />
            <stop offset="35%" stopColor="#F2D04B" />
            <stop offset="60%" stopColor="#F29D38" />
            <stop offset="80%" stopColor="#E7735C" />
            <stop offset="100%" stopColor="#9B5DE5" />
          </linearGradient>
        </defs>
        <path d="M6 28 A14 14 0 0 1 34 28" fill="none" stroke="url(#uvGrad)" strokeWidth="5" strokeLinecap="round" />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '20px 28px' }} className="transition-transform duration-700">
          <line x1="20" y1="28" x2="20" y2="16" stroke="#1F1D2B" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx="20" cy="28" r="2.5" fill="#1F1D2B" />
      </svg>
    </Tile>
  );
}

/** Łuk słońca z aktualną pozycją, wschodem i zachodem */
export function SunTile({ sunrise, sunset, dayLength }: { sunrise: string; sunset: string; dayLength: string }) {
  const now = new Date();
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const span = Math.max(1, toMin(sunset) - toMin(sunrise));
  const t = Math.min(1, Math.max(0, (nowMin - toMin(sunrise)) / span));
  const isUp = nowMin >= toMin(sunrise) && nowMin <= toMin(sunset);
  // punkt na łuku kwadratowym (4,30) -> ctrl (24,-2) -> (44,30)
  const x = (1 - t) ** 2 * 4 + 2 * (1 - t) * t * 24 + t ** 2 * 44;
  const y = (1 - t) ** 2 * 30 + 2 * (1 - t) * t * -2 + t ** 2 * 30;
  const minsToSunset = toMin(sunset) - nowMin;
  const sub = isUp
    ? minsToSunset < 120
      ? `Zachód za ${Math.floor(minsToSunset / 60)}h ${minsToSunset % 60}m`
      : `Dzień: ${dayLength}`
    : `Wschód ${sunrise}`;

  return (
    <Tile label="Słońce" value={`${sunrise} – ${sunset}`} sub={sub}>
      <svg viewBox="0 0 48 36" className="h-10 w-12">
        <path d="M4 30 Q24 -2 44 30" fill="none" stroke="#C9B48A" strokeWidth="1.3" strokeDasharray="2.5 2.5" />
        {isUp && (
          <path
            d={`M4 30 Q24 -2 44 30`}
            fill="none"
            stroke="#F2B544"
            strokeWidth="2"
            strokeDasharray={`${t * 56} 100`}
            strokeLinecap="round"
          />
        )}
        <line x1="1" y1="30" x2="47" y2="30" stroke="#D5DDE8" strokeWidth="1.2" />
        <circle cx={x} cy={y} r="4" fill={isUp ? '#F7C15A' : '#B7C9E3'} stroke="#fff" strokeWidth="1.5" />
      </svg>
    </Tile>
  );
}

/** Skala jakości powietrza (PM2.5) z markerem */
export function AirTile({ pm25, pm10, label }: { pm25: number; pm10: number; label: string }) {
  // skala 0–110 µg/m³ (indeks GIOŚ dla PM2.5)
  const pos = Math.min(100, (pm25 / 110) * 100);
  return (
    <Tile label="Powietrze" value={label} sub={`PM2.5 ${pm25} · PM10 ${pm10}`}>
      <div className="w-12">
        <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 via-60% to-coral">
          <span
            className="absolute -top-1 h-4 w-1.5 -translate-x-1/2 rounded-full bg-ink ring-2 ring-white transition-all duration-700"
            style={{ left: `${pos}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[7.5px] font-bold text-ink-400">
          <span>0</span>
          <span>55</span>
          <span>110</span>
        </div>
      </div>
    </Tile>
  );
}

/** Zestaw 6 kluczowych infografik dla bieżącej pogody */
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
