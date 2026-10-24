import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
const NAV_DURATION = '320ms';

export function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  // Optimistic local tab state so the capsule animation starts on the very first frame
  // on the GPU compositor thread before the parent screen transition begins.
  const [visualTab, setVisualTab] = useState<TabId>(tab);
  const listRef = useRef<HTMLUListElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafSwitchRef = useRef<number | null>(null);

  const [metrics, setMetrics] = useState<{
    innerWidth: number;
    labelWidths: number[];
    ready: boolean;
  }>({
    innerWidth: 340,
    labelWidths: [34, 54, 72, 64, 60],
    ready: false,
  });

  useEffect(() => {
    setVisualTab(tab);
  }, [tab]);

  useEffect(() => {
    return () => {
      if (rafSwitchRef.current !== null) {
        cancelAnimationFrame(rafSwitchRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const ul = listRef.current;
    if (!ul) return;

    const measure = () => {
      const innerWidth = Math.max(0, ul.clientWidth - 12); // 6px padding left & right
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
    // 1. Update local capsule state immediately so the GPU transition starts on frame 0
    setVisualTab(id);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // ignore
      }
    }

    // 2. Schedule the screen switch on the next animation frame so the pill glide
    // is already committed to the compositor thread with zero main-thread contention.
    if (rafSwitchRef.current !== null) {
      cancelAnimationFrame(rafSwitchRef.current);
    }
    rafSwitchRef.current = requestAnimationFrame(() => {
      rafSwitchRef.current = null;
      onChange(id);
    });
  };

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === visualTab),
  );

  const activeLabelW = metrics.labelWidths[activeIndex] ?? 48;
  // 32px (16px left + 16px right) + 20px (icon) + 6px (gap) + labelWidth
  const activeButtonW = 32 + 20 + 6 + activeLabelW;
  const inactiveButtonW =
    metrics.innerWidth > 0
      ? Math.min(48, Math.max(40, Math.floor((metrics.innerWidth - activeButtonW) / (items.length - 1))))
      : 46;
  const totalButtonsW = (items.length - 1) * inactiveButtonW + activeButtonW;
  const gap =
    metrics.innerWidth > totalButtonsW ? (metrics.innerWidth - totalButtonsW) / (items.length - 1) : 0;
  const pillX = 6 + activeIndex * (inactiveButtonW + gap);

  const gpuTransition = metrics.ready
    ? `transform ${NAV_DURATION} ${NAV_EASING}, opacity 180ms ease-out, color 180ms ease-out`
    : 'none';

  return (
    <nav
      aria-label="Nawigacja główna"
      className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),16px)] z-40 mx-auto max-w-md pointer-events-none"
    >
      <ul
        ref={listRef}
        className="relative pointer-events-auto h-[60px] w-full rounded-full bg-ink p-1.5 shadow-float transform-gpu overflow-hidden"
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
            contain: 'layout paint style',
          }}
          className="pointer-events-none absolute top-1.5 bottom-1.5 left-0 z-0 rounded-full bg-coral shadow-coral will-change-[transform,width]"
        />

        {items.map(({ id, label, icon: Icon }, idx) => {
          const active = visualTab === id;
          const labelW = metrics.labelWidths[idx] ?? 48;
          const itemActiveW = 32 + 20 + 6 + labelW;

          // Pure X coordinate calculation — buttons never animate width/margin, eliminating layout reflow
          const itemX =
            idx <= activeIndex
              ? 6 + idx * (inactiveButtonW + gap)
              : 6 + (idx - 1) * (inactiveButtonW + gap) + activeButtonW + gap;

          const iconX = active ? 16 : Math.round((inactiveButtonW - 20) / 2);

          return (
            <li
              key={id}
              style={{
                width: `${itemActiveW}px`,
                transform: `translate3d(${itemX}px, 0, 0)`,
                transition: gpuTransition,
                pointerEvents: 'none',
              }}
              className="absolute top-1.5 bottom-1.5 left-0 z-10 will-change-transform"
            >
              <button
                type="button"
                onClick={() => handleSelect(id)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                style={{
                  width: `${active ? itemActiveW : inactiveButtonW}px`,
                  pointerEvents: 'auto',
                }}
                className={cn(
                  'group relative h-12 rounded-full select-none active:scale-[0.94] transition-colors duration-150',
                  active ? 'text-ink' : 'text-white/55 hover:text-white',
                )}
              >
                <span
                  style={{
                    transform: `translate3d(${iconX}px, -50%, 0) scale(${active ? 1 : 0.94})`,
                    transition: gpuTransition,
                  }}
                  className="pointer-events-none absolute left-0 top-1/2 grid h-5 w-5 place-items-center will-change-transform"
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={active ? 2.4 : 2}
                    aria-hidden
                  />
                </span>

                <span
                  ref={(el) => {
                    labelRefs.current[idx] = el;
                  }}
                  style={{
                    transform: active
                      ? 'translate3d(42px, -50%, 0)'
                      : 'translate3d(34px, -50%, 0)',
                    opacity: active ? 1 : 0,
                    transition: gpuTransition,
                  }}
                  className="pointer-events-none absolute left-0 top-1/2 whitespace-nowrap text-[13px] font-bold leading-none will-change-[transform,opacity]"
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
