import { useState } from 'react';
import { Drawer } from 'vaul';
import { CheckCircle2, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { groceries, type Product } from '../data/mockData';
import { Img, zl } from './ui';

export interface CartLine {
  product: Product;
  qty: number;
}

const FREE_FROM = 120;

export function CartPill({ count, total, onOpen }: { count: number; total: number; onOpen: () => void }) {
  const missing = Math.max(0, FREE_FROM - total);
  const progress = Math.min(100, (total / FREE_FROM) * 100);
  return (
    <button
      onClick={onOpen}
      className="fixed inset-x-4 bottom-[calc(max(env(safe-area-inset-bottom),16px)+72px)] z-40 overflow-hidden rounded-3xl bg-white p-3 text-left shadow-float active:scale-[.99]"
    >
      <div className="flex items-center gap-3">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-coral text-ink">
          <ShoppingBag className="h-5 w-5" aria-hidden />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{count}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-ink">{zl(total)}</p>
          <p className="truncate text-[11.5px] text-ink-500">{missing > 0 ? `Jeszcze ${zl(missing)} do darmowej dostawy` : 'Darmowa dostawa odblokowana'}</p>
        </div>
        <span className="rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-white">Koszyk</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-coral transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}

export function CartSheet({
  open,
  onOpenChange,
  lines,
  setQty,
  onPaid,
  onProceedToCheckout,
  container,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  lines: CartLine[];
  setQty: (id: string, qty: number) => void;
  onPaid: () => void;
  onProceedToCheckout?: () => void;
  container: HTMLElement | null;
}) {
  const [paid, setPaid] = useState(false);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const delivery = subtotal >= FREE_FROM || subtotal === 0 ? 0 : 6.99;
  const service = subtotal > 0 ? 1.99 : 0;
  const missing = Math.max(0, FREE_FROM - subtotal);
  const upsell = groceries.find((g) => !lines.some((l) => l.product.id === g.id)) ?? groceries[0];

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o && paid) {
      setPaid(false);
      onPaid();
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={close}>
      <Drawer.Portal container={container}>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92%] flex-col rounded-t-[36px] bg-mist outline-none">
          <div className="mx-auto mb-1 mt-3 h-1.5 w-12 shrink-0 rounded-full bg-mist-300" aria-hidden />
          {paid ? (
            <div className="px-6 pb-10 pt-6 text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sky">
                <CheckCircle2 className="h-10 w-10 text-ink" aria-hidden />
              </span>
              <Drawer.Title className="mt-5 font-display text-[28px] font-semibold text-ink">Zamówienie przyjęte!</Drawer.Title>
              <Drawer.Description className="mx-auto mt-2 max-w-[260px] text-[14px] text-ink-500">
                Kurier mójMińsk odbierze je za chwilę. Status śledzisz w zakładce Kuchnia.
              </Drawer.Description>
              <button onClick={() => close(false)} className="mt-6 h-12 w-full rounded-full bg-ink text-[15px] font-bold text-white">
                Świetnie
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
              <Drawer.Title className="mt-2 font-display text-[28px] font-semibold text-ink">Twój koszyk</Drawer.Title>
              <Drawer.Description className="text-[13px] text-ink-500">Dostawa na ul. Spacerową · ok. 35 min</Drawer.Description>

              <div className="mt-4 space-y-2.5">
                {lines.length === 0 && <p className="rounded-3xl bg-white p-6 text-center text-[14px] text-ink-500">Koszyk jest pusty</p>}
                {lines.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-3xl bg-white p-2.5 shadow-card">
                    <Img src={product.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink">{product.name}</p>
                      <p className="text-[11.5px] text-ink-400">{product.vendor}</p>
                      <p className="mt-0.5 text-[14px] font-bold text-ink">{zl(product.price * qty)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-full bg-mist p-1">
                      <button aria-label="Więcej" onClick={() => setQty(product.id, qty + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-white">
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <span className="text-[13px] font-bold tabular-nums">{qty}</span>
                      <button aria-label="Mniej" onClick={() => setQty(product.id, qty - 1)} className="grid h-8 w-8 place-items-center rounded-full bg-white">
                        <Minus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {missing > 0 && lines.length > 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-3xl bg-ink p-4 text-white">
                  <Sparkles className="h-5 w-5 shrink-0 text-sand" aria-hidden />
                  <p className="flex-1 text-[12.5px] leading-snug text-white/85">
                    Brakuje Ci <b className="text-white">{zl(missing)}</b> do darmowej dostawy. Może {upsell.name.toLowerCase()}?
                  </p>
                  <button onClick={() => setQty(upsell.id, 1)} className="shrink-0 rounded-full bg-sand px-3 py-2 text-[12px] font-bold text-ink">
                    + {zl(upsell.price)}
                  </button>
                </div>
              )}

              <dl className="mt-4 space-y-2 rounded-3xl bg-white p-4 text-[13.5px] shadow-card">
                <div className="flex justify-between text-ink-500"><dt>Produkty</dt><dd>{zl(subtotal)}</dd></div>
                <div className="flex justify-between text-ink-500"><dt>Dostawa kurierem mójMińsk</dt><dd>{delivery === 0 ? 'Gratis' : zl(delivery)}</dd></div>
                <div className="flex justify-between text-ink-500"><dt>Opłata serwisowa</dt><dd>{zl(service)}</dd></div>
                <div className="flex justify-between border-t border-mist pt-2 text-[16px] font-bold text-ink"><dt>Razem</dt><dd>{zl(subtotal + delivery + service)}</dd></div>
              </dl>

              <button
                disabled={lines.length === 0}
                onClick={() => {
                  if (onProceedToCheckout) {
                    onOpenChange(false);
                    onProceedToCheckout();
                  } else {
                    setPaid(true);
                  }
                }}
                className="mt-4 h-14 w-full rounded-full bg-coral text-[16px] font-bold text-ink shadow-coral transition-transform active:scale-[.98] disabled:opacity-40"
              >
                Przejdź do kasy & BLIK · {zl(subtotal + delivery + service)}
              </button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
