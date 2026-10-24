import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { avatarUrl, type Tone, type User } from '../data/mockData';

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

export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 px-5 pb-4 pt-[max(env(safe-area-inset-top),20px)]">
      <div>
        <h1 className="font-display text-[32px] font-semibold leading-none tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-[13px] font-medium text-ink-500">{subtitle}</p>}
      </div>
      {right}
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
    <header className="z-20 shrink-0 border-b border-mist-300 bg-white pt-[max(env(safe-area-inset-top),12px)]">
      <div className="flex h-14 items-center gap-1 px-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={`Wróć do: ${backLabel}`}
          className="flex h-11 min-w-11 shrink-0 items-center gap-0.5 rounded-full pl-1 pr-3 text-[15px] font-semibold text-ink transition-colors active:bg-mist"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
          <span className="max-w-[88px] truncate">{backLabel}</span>
        </button>
        <h1 className="min-w-0 flex-1 truncate px-1 text-center font-display text-[16px] font-bold text-ink">{title}</h1>
        <div className="flex shrink-0 items-center gap-1">{right}</div>
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
      aria-label={`Profil: ${user.name} (${user.verified ? 'Zweryfikowany' : `Konto tymczasowe – zostało ${user.trialDaysLeft} dni`})`}
      title="Twój profil mieszkańca"
      className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white p-0.5 shadow-card transition-transform active:scale-95"
    >
      <img
        src={avatarUrl(user.seed)}
        alt={user.name}
        className="h-full w-full rounded-full bg-sand-100 object-cover"
      />
      {user.verified ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-white ring-2 ring-white"
          aria-hidden
        >
          <ShieldCheck className="h-2.5 w-2.5" />
        </span>
      ) : (
        <span
          className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-white"
          title={`Konto tymczasowe – zostało ${user.trialDaysLeft} dni`}
          aria-hidden
        />
      )}
    </button>
  );
}
