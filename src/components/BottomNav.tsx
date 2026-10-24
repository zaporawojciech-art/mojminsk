import { startTransition, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

const NAV_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const NAV_DURATION = '360ms';

export function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  // Optimistic local tab state so the capsule animation starts on the very first frame
  // without waiting for heavy screen components to mount.
  const [visualTab, setVisualTab] = useState<TabId>(tab);
  const listRef = useRef<HTMLUListElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [metrics, setMetrics] = useState<{
    innerWidth: number;
    labelWidths: number[];
    ready: boolean;
  }>({
    innerWidth: 0,
    labelWidths: [34, 54, 72, 64, 60],
    ready: false,
  });

  useEffect(() => {
    setVisualTab(tab);
  }, [tab]);

  useLayoutEffect(() => {
    const ul = listRef.current;
    if (!ul) return;

    const measure = () => {
      const innerWidth = Math.max(0, ul.clientWidth - 12); // p-1.5 = 6px * 2
      const labelWidths = items.map((_, i) => {
        const el = labelRefs.current[i];
        return el ? Math.ceil(el.scrollWidth) : 48;
      });
      setMetrics((prev) => ({
        innerWidth,
        labelWidths,
        ready: prev.ready,
      }));
    };

    measure();
    // Enable smooth CSS transitions after initial geometry is committed
    const raf = requestAnimationFrame(() => {
      setMetrics((prev) => (prev.ready ? prev : { ...prev, ready: true }));
    });

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(ul);
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, []);

  const handleSelect = (id: TabId) => {
    if (id === visualTab && id === tab) return;
    setVisualTab(id);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
    startTransition(() => {
      onChange(id);
    });
  };

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === visualTab),
  );

  const activeLabelW = metrics.labelWidths[activeIndex] ?? 48;
  // 32px (px-4) + 20px (icon) + 6px (gap) + labelWidth
  const activeButtonW = 32 + 20 + 6 + activeLabelW;
  const inactiveButtonW =
    metrics.innerWidth > 0
      ? Math.min(48, Math.max(40, Math.floor((metrics.innerWidth - activeButtonW) / (items.length - 1))))
      : 48;
  const totalButtonsW = (items.length - 1) * inactiveButtonW + activeButtonW;
  const gap =
    metrics.innerWidth > totalButtonsW ? (metrics.innerWidth - totalButtonsW) / (items.length - 1) : 0;
  const pillX = 6 + activeIndex * (inactiveButtonW + gap);

  const transitionStyle = metrics.ready
    ? `transform ${NAV_DURATION} ${NAV_EASING}, width ${NAV_DURATION} ${NAV_EASING}, margin ${NAV_DURATION} ${NAV_EASING}, opacity 220ms ease-out, color 220ms ease-out`
    : 'none';

  return (
    <nav
      aria-label="Nawigacja główna"
      className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),16px)] z-40 mx-auto max-w-md pointer-events-none"
    >
      <ul
        ref={listRef}
        className="relative pointer-events-auto flex items-center justify-between rounded-full bg-ink p-1.5 shadow-float transform-gpu"
      >
        {/* Sliding Coral Capsule Indicator */}
        <span
          aria-hidden
          style={{
            width: `${activeButtonW}px`,
            transform: `translate3d(${pillX}px, 0, 0)`,
            transition: metrics.ready
              ? `transform ${NAV_DURATION} ${NAV_EASING}, width ${NAV_DURATION} ${NAV_EASING}`
              : 'none',
          }}
          className="pointer-events-none absolute top-1.5 bottom-1.5 left-0 z-0 rounded-full bg-coral shadow-coral will-change-[transform,width]"
        />

        {items.map(({ id, label, icon: Icon }, idx) => {
          const active = visualTab === id;
          const labelW = metrics.labelWidths[idx] ?? 48;
          const buttonW = active ? 32 + 20 + 6 + labelW : inactiveButtonW;

          return (
            <li key={id} className="relative z-10">
              <button
                type="button"
                onClick={() => handleSelect(id)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                style={{
                  width: `${buttonW}px`,
                  transition: transitionStyle,
                }}
                className={cn(
                  'group flex h-12 items-center justify-center rounded-full select-none active:scale-[0.94] will-change-[width]',
                  active ? 'text-ink' : 'text-white/55 hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-300 ease-out',
                    active ? 'scale-100' : 'scale-95 group-hover:scale-100',
                  )}
                  strokeWidth={active ? 2.4 : 2}
                  aria-hidden
                />
                <span
                  style={{
                    width: active ? `${labelW}px` : '0px',
                    marginLeft: active ? '6px' : '0px',
                    opacity: active ? 1 : 0,
                    transform: active ? 'translate3d(0, 0, 0)' : 'translate3d(-4px, 0, 0)',
                    transition: transitionStyle,
                  }}
                  className="overflow-hidden whitespace-nowrap text-left"
                >
                  <span
                    ref={(el) => {
                      labelRefs.current[idx] = el;
                    }}
                    className="inline-block text-[13px] font-bold leading-none"
                  >
                    {label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
