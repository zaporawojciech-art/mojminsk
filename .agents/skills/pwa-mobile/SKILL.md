---
name: pwa-mobile
description: "Guidelines, manifest configurations, Service Worker offline caching strategies, iOS standalone safe area optimizations, and Web Push notifications for Progressive Web Apps (PWA)."
---

# PWA Mobile Architecture Skill

Specjalistyczny skill do tworzenia progresywnych aplikacji internetowych (PWA) zoptymalizowanych pod smartfony (iOS Safari i Android Chrome).

## 1. Web App Manifest (`manifest.json`)
Aplikacja musi posiadać manifest w `public/manifest.json`:
- `display`: `standalone` (brak pasków przeglądarki, wygląd natywnej aplikacji).
- `start_url`: `/`.
- `orientation`: `portrait-primary`.
- `background_color`: `#F7F8FA` (zgodnie z `UI.md`).
- `theme_color`: `#FFFFFF` (dla paska statusu w systemie iOS i Android).
- Ikony: 192x192, 512x512 oraz ikona maskowalna (`purpose: any maskable`).

```json
{
  "name": "mójMińsk - Aplikacja Mieszkańców",
  "short_name": "mójMińsk",
  "description": "Zweryfikowana społeczność, rozkłady ZDiTM, e-zakupy z Motelek Market w Mińsku Mazowieckim",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#F7F8FA",
  "theme_color": "#FFFFFF",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 2. Obsługa Wcięć Ekranu (iOS Dynamic Island & Home Indicator)
W `index.html` meta-tag viewport musi zawierać `viewport-fit=cover`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

W Tailwind CSS definiujemy wsparcie dla wcięć:
- `pt-[env(safe-area-inset-top)]` dla Top Bara.
- `pb-[calc(env(safe-area-inset-bottom)+80px)]` dla głównej treści, by nie kolidowała z pływającą kapsułą nawigacyjną.
- `overscroll-behavior-y: none;` na elemencie `body`, aby zablokować niepożądane przeciąganie strony w dół (rubber-banding) na iOS.

## 3. Strategia Offline (Service Worker)
- **Cache-First (Rozkłady ZDiTM):** Statyczne trasy i rozkłady linii M2, M3, M4 są zapisywane w cache IndexedDB/CacheStorage, aby pasażer stojący na przystanku miał do nich dostęp nawet w trybie offline.
- **Network-First (Strefa Rozmów, Zamówienia):** Posty i zamówienia pobierają dane z sieci z fallbackiem do cache.
