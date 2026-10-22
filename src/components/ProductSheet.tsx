import { useState } from 'react';
import { Drawer } from 'vaul';
import { Leaf, Minus, Plus, Drumstick } from 'lucide-react';
import type { Product } from '../data/mockData';
import { Img, toneBg, zl } from './ui';

function SheetBody({ product, onAdd, onClose }: { product: Product; onAdd: (p: Product, qty: number) => void; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
      <div className={`relative mt-3 grid h-56 place-items-center overflow-hidden rounded-4xl ${toneBg[product.tone]}`}>
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/40" aria-hidden />
        <Img src={product.image} alt={product.name} className="relative h-44 w-44 rounded-full shadow-float ring-8 ring-white/70" />
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-ink-400">
            {product.vendor}
            {product.unit && ` · ${product.unit}`}
          </p>
          <Drawer.Title className="mt-0.5 font-display text-[26px] font-semibold leading-tight text-ink">{product.name}</Drawer.Title>
        </div>
        {product.diet && (
          <span
            className={`mt-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
              product.diet === 'wege' ? 'bg-sky-100 text-sky-700' : 'bg-coral-100 text-coral-700'
            }`}
          >
            {product.diet === 'wege' ? <Leaf className="h-3.5 w-3.5" aria-hidden /> : <Drumstick className="h-3.5 w-3.5" aria-hidden />}
            {product.diet === 'wege' ? 'Wege' : 'Mięsne'}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-[22px] font-semibold text-ink">{zl(product.price)}</span>
        {product.oldPrice && <span className="text-[13px] text-ink-400 line-through">{zl(product.oldPrice)}</span>}
      </div>

      <Drawer.Description className="mt-2 text-[14px] leading-relaxed text-ink-500">{product.description}</Drawer.Description>

      {product.ingredients && (
        <>
          <p className="mt-5 text-[13px] font-bold text-ink">Składniki</p>
          <div className="-mx-5 mt-2.5 flex gap-3 overflow-x-auto px-5 no-scrollbar">
            {product.ingredients.map((i) => (
              <div key={i.name} className="w-[76px] shrink-0 text-center">
                <Img src={i.image} alt="" className="mx-auto h-16 w-16 rounded-full ring-4 ring-mist" />
                <p className="mt-1.5 text-[11.5px] font-semibold leading-tight text-ink">{i.name}</p>
                {i.amount && <p className="text-[10.5px] text-ink-400">{i.amount}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-mist p-1">
          <button aria-label="Mniej" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-white active:scale-90">
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span className="w-7 text-center text-[15px] font-bold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button aria-label="Więcej" onClick={() => setQty((q) => q + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-white active:scale-90">
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <button
          onClick={() => {
            onAdd(product, qty);
            onClose();
          }}
          className="h-12 flex-1 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-[.98]"
        >
          Dodaj · {zl(product.price * qty)}
        </button>
      </div>
    </div>
  );
}

export function ProductSheet({
  product,
  onClose,
  onAdd,
  container,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product, qty: number) => void;
  container: HTMLElement | null;
}) {
  return (
    <Drawer.Root open={!!product} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal container={container}>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90%] flex-col rounded-t-[36px] bg-white outline-none">
          <div className="mx-auto mb-1 mt-3 h-1.5 w-12 shrink-0 rounded-full bg-mist-300" aria-hidden />
          {product && <SheetBody key={product.id} product={product} onAdd={onAdd} onClose={onClose} />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
