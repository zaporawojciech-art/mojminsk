import { ArrowUpRight, Coffee, Heart } from 'lucide-react';
import { cn } from './ui';

interface BuyCoffeeButtonProps {
  variant?: 'pill' | 'desktop-nav' | 'top-banner' | 'card';
  className?: string;
}

export const BUYCOFFEE_URL = 'https://buycoffee.to/mojminsk';

export function BuyCoffeeButton({ variant = 'pill', className }: BuyCoffeeButtonProps) {
  // 1. Wariant do mobilnego paska górnego (TopBar)
  if (variant === 'pill') {
    return (
      <a
        href={BUYCOFFEE_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Postaw wirtualną kawę i wesprzyj rozwój mójMińsk na buycoffee.to"
        className={cn(
          'group flex h-8 items-center gap-1.5 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-50 to-orange-50/80 px-2.5 text-[11.5px] font-bold text-amber-950 shadow-2xs hover:from-amber-100 hover:to-orange-100 active:scale-95 transition-all shrink-0 cursor-pointer',
          className,
        )}
      >
        <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-amber-200/80 text-amber-800 group-hover:rotate-12 transition-transform">
          <Coffee className="h-2.5 w-2.5" />
        </span>
        <span>Postaw kawę</span>
      </a>
    );
  }

  // 2. Wariant do paska nawigacyjnego na Desktopie (DesktopTopNavbar)
  if (variant === 'desktop-nav') {
    return (
      <a
        href={BUYCOFFEE_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Wesprzyj niezależną platformę mieszkańców Mińska Mazowieckiego"
        className={cn(
          'group flex h-9 items-center gap-1.5 rounded-lg border border-amber-200/90 bg-amber-50/80 px-3 text-[12px] font-bold text-amber-950 shadow-2xs hover:bg-amber-100 hover:border-amber-300 active:scale-95 transition-all shrink-0 cursor-pointer',
          className,
        )}
      >
        <Coffee className="h-3.5 w-3.5 text-amber-700 group-hover:rotate-12 transition-transform" />
        <span>Postaw kawę</span>
        <ArrowUpRight className="h-3 w-3 text-amber-600/70 -ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    );
  }

  // 3. Wariant baneru górnego na pulpicie Start (np. pod powitaniem lub nad pogodą)
  if (variant === 'top-banner') {
    return (
      <div
        className={cn(
          'rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 p-3 md:p-3.5 shadow-card flex items-center justify-between gap-3',
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200/80 text-amber-900 shadow-2xs">
            <Coffee className="h-5 w-5 text-amber-800" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-extrabold text-ink">Wspieraj rozwój mójMińsk</span>
              <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-200/70 px-1.5 py-0.2 text-[9.5px] font-extrabold text-amber-900 uppercase tracking-wider">
                <Heart className="h-2.5 w-2.5 fill-amber-700 text-amber-700" />
                Społeczność
              </span>
            </div>
            <p className="text-[11.5px] text-ink-500 truncate">
              Niezależna platforma mieszkańców Mińska Mazowieckiego bez spamu i hejtu
            </p>
          </div>
        </div>

        <a
          href={BUYCOFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-[12px] font-bold text-white shadow-xs hover:bg-ink-700 active:scale-95 transition-all cursor-pointer"
        >
          <span>Postaw kawę</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-amber-300" />
        </a>
      </div>
    );
  }

  // 4. Pełna karta wsparcia (np. sekcja w Start)
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3.5 rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-orange-50/50 p-4 shadow-card',
        className,
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs">
          <Coffee className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-ink">Postaw kawę twórcom mójMińsk</p>
          <p className="text-[12px] text-ink-500">Niezależna aplikacja dla mieszkańców · szybki BLIK</p>
        </div>
      </div>

      <a
        href={BUYCOFFEE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-95 transition-all shrink-0 cursor-pointer"
      >
        <span>BLIK</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-amber-300" />
      </a>
    </div>
  );
}
