import { Car, House, Megaphone, MessagesSquare, UtensilsCrossed } from 'lucide-react';
import { cn } from './ui';

export type TabId = 'home' | 'kitchen' | 'ads' | 'rides' | 'talks';

const items: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Start', icon: House },
  { id: 'kitchen', label: 'Kuchnia', icon: UtensilsCrossed },
  { id: 'ads', label: 'Ogłoszenia', icon: Megaphone },
  { id: 'rides', label: 'Przejazdy', icon: Car },
  { id: 'talks', label: 'Rozmowy', icon: MessagesSquare },
];

export function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav aria-label="Nawigacja główna" className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),16px)] z-40 mx-auto max-w-md pointer-events-none">
      <ul className="pointer-events-auto flex items-center justify-between rounded-full bg-ink p-1.5 shadow-float">
        {items.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-12 items-center justify-center gap-1.5 rounded-full transition-all duration-300 ease-out',
                  active ? 'bg-coral px-4 text-ink' : 'w-12 text-white/55 hover:text-white',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} aria-hidden />
                {active && <span className="text-[13px] font-bold">{label}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
