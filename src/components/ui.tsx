import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { avatarUrl, gminaCities, type Tone, type User } from '../data/mockData';

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export const zl = (n: number) => `${n.toFixed(2).replace('.', ',')} zł`;

export const toneBg: Record<Tone, string> = { coral: 'bg-coral-100', sky: 'bg-sky-100', sand: 'bg-sand-100' };
export const toneSolid: Record<Tone, string> = { coral: 'bg-coral', sky: 'bg-sky', sand: 'bg-sand' };

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-end justify-between px-5">
      <h2 className="font-display text-[20px] font-semibold tracking-tight text-ink">{title}</h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-0.5 text-[13px] font-semibold text-ink-500 active:opacity-60">
          {action}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-3xl bg-white shadow-card', className)}>{children}</div>;
}

export function StreetPill({ street, className }: { street: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-ink-500', className)}>
      <MapPin className="h-3 w-3" aria-hidden />
      {street}
    </span>
  );
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors duration-200',
        active ? 'bg-ink text-white' : 'bg-white text-ink-700 shadow-card hover:bg-mist-200',
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; badge?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" className="grid gap-1 rounded-full bg-white p-1 shadow-card" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'flex h-10 items-center justify-center gap-1.5 rounded-full text-[14px] font-bold transition-all duration-200',
              active ? 'bg-ink text-white' : 'text-ink-500 hover:text-ink',
            )}
          >
            {o.label}
            {o.badge !== undefined && (
              <span className={cn('rounded-full px-1.5 text-[11px]', active ? 'bg-coral text-ink' : 'bg-mist text-ink-500')}>{o.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StandardTopBar({
  title,
  subtitle,
  user,
  onProfile,
  action,
  citySelector,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  user?: User | null;
  onProfile?: () => void;
  action?: ReactNode;
  citySelector?: {
    city: string;
    onCityChange: (c: string) => void;
  };
  className?: string;
}) {
  return (
    <header className={cn('px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2 select-none md:hidden', className)}>
      <div className="flex h-12 items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          {typeof title === 'string' ? (
            <h1 className="truncate font-display text-[23px] font-bold tracking-tight text-ink leading-tight">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {citySelector && (
            <CityDropdown
              value={citySelector.city}
              onChange={citySelector.onCityChange}
            />
          )}
          {action}
          {user && onProfile ? (
            <ProfileAvatarButton user={user} onClick={onProfile} />
          ) : onProfile ? (
            <button
              type="button"
              onClick={onProfile}
              className="flex h-8 items-center gap-1 rounded-full bg-ink px-3 text-[11.5px] font-bold text-white shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              Zaloguj
            </button>
          ) : null}
        </div>
      </div>

      {subtitle && (
        <div className="mt-1 text-[12.5px] font-medium text-ink-500">
          {subtitle}
        </div>
      )}
    </header>
  );
}

export function CityDropdown({
  value,
  onChange,
  variant = 'compact',
  className,
  triggerClassName,
}: {
  value: string;
  onChange: (city: string) => void;
  variant?: 'compact' | 'full';
  className?: string;
  triggerClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredCities = search.trim()
    ? gminaCities.filter((c) => c.toLowerCase().includes(search.toLowerCase().trim()))
    : gminaCities;

  return (
    <div ref={dropdownRef} className={cn('relative', variant === 'full' ? 'w-full' : 'inline-block', className)}>
      {/* Przycisk wyzwalający Trigger */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          setSearch('');
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center justify-between transition-all select-none',
          variant === 'compact'
            ? 'h-9 gap-1.5 rounded-full bg-white pl-2.5 pr-2 text-[12px] font-bold text-ink shadow-card border border-mist-300 hover:border-ink-400 active:scale-95'
            : 'h-12 w-full gap-2 rounded-2xl bg-mist/50 px-3.5 text-[14.5px] font-bold text-ink border-2 border-mist-300 hover:border-ink/40 active:scale-[0.99] focus:border-ink focus:bg-white',
          triggerClassName,
          isOpen && 'border-ink ring-2 ring-ink/20 shadow-md',
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          <MapPin className={cn('shrink-0 text-coral', variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          <span className={cn('truncate', variant === 'compact' && 'max-w-[105px]')}>{value || 'Wybierz miejscowość'}</span>
        </span>
        <ChevronDown
          className={cn(
            'shrink-0 text-ink-500 transition-transform duration-200',
            variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4',
            isOpen && 'rotate-180 text-ink',
          )}
        />
      </button>

      {/* Ostylowane Menu Rozwijane */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute z-[100] mt-1.5 rounded-3xl bg-white p-2 shadow-2xl border border-mist-300 animate-in fade-in zoom-in-95 duration-150',
            variant === 'compact'
              ? 'right-0 w-64 origin-top-right'
              : 'left-0 right-0 w-full origin-top',
          )}
        >
          {/* Szybka wyszukiwarka wewnątrz dropdowna */}
          <div className="relative mb-1.5 px-1 pt-0.5">
            <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj wsi lub miasta..."
              autoFocus
              className="h-9 w-full rounded-xl bg-mist/60 pl-8 pr-3 text-[12.5px] font-semibold text-ink outline-none placeholder:text-ink-400 focus:bg-mist focus:ring-1 focus:ring-ink"
            />
          </div>

          {/* Przewijana lista z miejscowościami */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain pr-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((cityName) => {
                const isSelected = value === cityName;
                return (
                  <button
                    key={cityName}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(cityName);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition-all active:scale-[0.98]',
                      isSelected
                        ? 'bg-ink text-white font-bold shadow-xs'
                        : 'text-ink hover:bg-mist/80',
                    )}
                  >
                    <span>{cityName}</span>
                    {isSelected && <Check className="h-4 w-4 text-coral shrink-0" />}
                  </button>
                );
              })
            ) : (
              <p className="py-4 text-center text-[12px] text-ink-400">
                Brak pasującej miejscowości
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h1 className="font-display text-[28px] font-semibold leading-none tracking-tight text-ink">{title}</h1>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
      {subtitle && <p className="mt-1.5 text-[13px] font-medium text-ink-500">{subtitle}</p>}
    </header>
  );
}

export function BackHeader({ title, onBack, right, dark }: { title?: string; onBack: () => void; right?: ReactNode; dark?: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 pb-2 pt-[max(env(safe-area-inset-top),16px)]">
      <button
        onClick={onBack}
        aria-label="Wróć"
        className={cn('grid h-11 w-11 place-items-center rounded-full shadow-card active:scale-95', dark ? 'bg-white/10 text-white' : 'bg-white text-ink')}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      {title && <p className={cn('text-[15px] font-bold', dark ? 'text-white' : 'text-ink')}>{title}</p>}
      <div className="w-11">{right}</div>
    </header>
  );
}

/** Icon-only button: 44x44 touch target and a mandatory accessible name. */
export function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mist text-ink transition-colors active:bg-mist-300', className)}
    >
      {children}
    </button>
  );
}

/**
 * Header for full-screen (pushed) views.
 * The safe-area inset is padding of the container; the 56px row below it is fixed,
 * so the controls never slide under the camera cut-out or the status bar.
 * Layout: [ back (label) ] [ centered title ] [ right actions ]
 */
export function NativeHeader({
  title,
  backLabel = 'Wróć',
  onBack,
  right,
}: {
  title?: string;
  backLabel?: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="z-20 shrink-0 border-b border-mist-300 bg-white pt-[max(env(safe-area-inset-top),12px)] md:pt-0">
      <div className="relative flex h-14 items-center justify-between px-2 md:px-8 lg:px-12">
        {/* Lewa strona: Przycisk powrotu */}
        <div className="z-10 flex min-w-11 items-center justify-start gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={`Wróć do: ${backLabel}`}
            className="flex h-11 md:h-9 items-center gap-1 rounded-full md:rounded-lg pl-1 md:px-3 pr-3 text-[15px] md:text-[13px] font-semibold md:font-bold text-ink md:bg-mist/70 md:hover:bg-mist transition-colors active:bg-mist"
          >
            <ChevronLeft className="h-6 w-6 md:h-4 md:w-4 shrink-0" aria-hidden />
            <span className="max-w-[88px] md:max-w-none truncate">{backLabel}</span>
          </button>
          {title && (
            <h1 className="hidden md:block truncate font-display text-[18px] font-extrabold text-ink">
              {title}
            </h1>
          )}
        </div>

        {/* Centrum: Tytuł matematycznie wycentrowany względem całej szerokości ekranu (Mobile) */}
        <div className="pointer-events-none absolute inset-y-0 left-24 right-14 flex items-center justify-center md:hidden">
          <h1 className="truncate font-display text-[16px] font-bold text-ink text-center">
            {title}
          </h1>
        </div>

        {/* Prawa strona: Akcje lub pusty bufor */}
        <div className="z-10 flex min-w-11 items-center justify-end gap-1.5">
          {right}
        </div>
      </div>
    </header>
  );
}

export function SearchField({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <label className="flex h-12 items-center gap-2.5 rounded-full bg-white pl-4 pr-2 shadow-card focus-within:ring-2 focus-within:ring-ink">
      <Search className="h-[18px] w-[18px] text-ink-400" aria-hidden />
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-400"
      />
      <span className="grid h-8 w-8 place-items-center rounded-full bg-mist" aria-hidden>
        <SlidersHorizontal className="h-4 w-4 text-ink-700" />
      </span>
    </label>
  );
}

export function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={cn('bg-mist-200 object-cover', className)} />;
}

export function ProfileAvatarButton({ user, onClick }: { user: User; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Profil: ${user.name}`}
      title="Twój profil mieszkańca"
      className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white p-0.5 shadow-card transition-transform active:scale-95"
    >
      <img
        src={avatarUrl(user.seed)}
        alt={user.name}
        className="h-full w-full rounded-full bg-sand-100 object-cover"
      />
    </button>
  );
}
