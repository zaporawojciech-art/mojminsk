import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';

export function navigateTo(
  to: string,
  options?: { replace?: boolean; state?: Record<string, unknown> },
) {
  if (typeof window === 'undefined') return;
  const currentUrl = window.location.pathname + window.location.search;
  if (currentUrl === to && !options?.state) return;

  if (options?.replace) {
    window.history.replaceState(options.state ?? {}, '', to);
  } else {
    window.history.pushState(options?.state ?? {}, '', to);
  }
  window.dispatchEvent(new PopStateEvent('popstate', { state: options?.state ?? null }));
}

export interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  replace?: boolean;
  state?: Record<string, unknown>;
  onPrefetch?: () => void;
}

/**
 * Semantyczny komponent linku <a href="..."> z obsługą:
 * - natywnego crawlowania przez Googlebota (atrybut href),
 * - otwierania w nowej karcie (Ctrl/Cmd + Click, środkowy przycisk myszy),
 * - płynnej nawigacji SPA przez History API bez przeładowania strony.
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { to, replace = false, state, onPrefetch, onClick, onPointerEnter, onTouchStart, children, ...rest },
  ref,
) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      rest.target === '_blank'
    ) {
      return;
    }
    e.preventDefault();
    navigateTo(to, { replace, state });
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLAnchorElement>) => {
    onPrefetch?.();
    onPointerEnter?.(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
    onPrefetch?.();
    onTouchStart?.(e);
  };

  return (
    <a
      ref={ref}
      href={to}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onTouchStart={handleTouchStart}
      {...rest}
    >
      {children}
    </a>
  );
});
