---
name: leaflet-maps-ui
description: "Lightweight, touch-friendly interactive map integration for mobile web and PWA using Leaflet, OpenStreetMap, custom HTML markers, and geo-filtering."
---

# Leaflet Maps UI Mobile Skill

Specjalistyczny skill do tworzenia lekkich, nieobciążających baterii smartfona map mobilnych dla Mińska Mazowieckiego.

## 1. Wytyczne Techniczne
- **Współrzędne Mińska Mazowieckiego:** `lat: 52.1793, lng: 21.5658`.
- **Kafelki:** Darmowe, estetyczne kafelki CartoDB Positron lub OpenStreetMap:
  `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- **Dotyk i gesty:** Obsługa pinch-to-zoom i dotykowego przesuwania bez blokowania przewijania pionowego całej strony (`touchZoom: true`, `scrollWheelZoom: false`).

## 2. Niestandardowe Pinezki (Pills & Markers)
Pinezki na mapie powinny odpowiadać stylowi z `UI.md`:
- **Przystanki ZDiTM (M2, M3, M4):** Zaokrąglone kolorowe pigułki z numerem linii.
- **Sklepy Motelek Market:** Szmaragdowe pigułki z ikoną koszyka.
- **Wydarzenia w Parku Dernałowiczów:** Pastelowe zielone znaczniki.

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Niestandardowy marker ZDiTM jako HTML DivIcon
const busStopIcon = L.divIcon({
  className: 'custom-bus-stop',
  html: `<div class="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1">🚌 M2</div>`,
  iconSize: [40, 24],
  iconAnchor: [20, 24]
});

export function MinskMap() {
  return (
    <div className="w-full h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      <MapContainer
        center={[52.1793, 21.5658]}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[52.1755, 21.5630]} icon={busStopIcon}>
          <Popup>Plac Dworcowy - Najbliższy odjazd M2 za 4 min</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
```
