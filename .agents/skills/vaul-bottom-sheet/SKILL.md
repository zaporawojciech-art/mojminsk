---
name: vaul-bottom-sheet
description: "Implementation guide, gesture handling, animations, and accessibility for Vaul Drawer and modern mobile Bottom Sheets in React & Tailwind."
---

# Vaul Bottom Sheet & Mobile Drawer Skill

Specjalistyczny skill do implementacji wysuwanych od dołu arkuszy (Bottom Sheet) wzorowanych na natywnych aplikacjach iOS, Glovo i UberEats.

## 1. Dlaczego Vaul?
`vaul` to lekka, bezkompromisowa biblioteka typu Drawer dla Reacta i Tailwind CSS stworzona przez Emila Kowalskiego. Zapewnia:
- Płynny gest przeciągnięcia palcem w dół (**swipe-to-dismiss**) ze sprężystością (spring physics).
- Przyciemnienie tła (`Drawer.Overlay`) z efektem rozmycia.
- Zgodność z dostępnością (Focus trap, ARIA dialog, obsługa klawisza Escape).
- Automatyczne skalowanie tła aplikacji w dół (efekt głębi iOS).

## 2. Podstawowy Komponent Karty Dania / Produktu Motelek

```tsx
import { Drawer } from 'vaul';

export function ProductBottomSheet({ isOpen, onOpenChange, product, onAddToCart }) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-[32px] z-50 flex flex-col outline-none">
          {/* Uchwyt do przeciągania */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mt-3 mb-2" />
          
          <div className="p-6 overflow-y-auto">
            {/* Floating Packshot Image */}
            <div className="relative w-48 h-48 mx-auto -mt-4 drop-shadow-xl flex items-center justify-center">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
            </div>

            <Drawer.Title className="text-2xl font-bold text-slate-900 mt-4">
              {product.name}
            </Drawer.Title>
            
            <p className="text-slate-500 text-sm mt-1">
              {product.description}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-extrabold text-slate-900">{product.price} zł</span>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Motelek Market
              </span>
            </div>

            {/* Przycisk CTA */}
            <button
              onClick={onAddToCart}
              className="mt-6 w-full py-4 rounded-full bg-slate-900 text-white font-semibold shadow-lg active:scale-95 transition-transform"
            >
              Dodaj do koszyka
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```
