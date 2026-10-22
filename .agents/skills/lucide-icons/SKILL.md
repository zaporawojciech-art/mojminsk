---
name: lucide-icons
description: "Icon system standards, visual consistency, SVG stroke width, accessibility, and Lucide React implementation patterns."
---

# Lucide Icons System Skill

Specjalistyczny skill do zarządzania systemem ikonografii wektorowej w projekcie mójMińsk.app.

## 1. Wytyczne Spójności Ikon
Zgodnie z `UI.md` ikony muszą posiadać spójne parametry geometryczne:
- **Grubość linii (strokeWidth):** `2px` dla stanu spoczynku, `2.5px` dla stanu aktywnego/podświetlonego.
- **Wymiary domyślne:**
  - `w-5 h-5` (20px) dla ikon w dolnej kapsule nawigacyjnej i Top Barze.
  - `w-4 h-4` (16px) dla metadanych (zegarek czasu dostawy, gwiazdka oceny, ulica).
  - `w-6 h-6` (24px) dla głównych przycisków akcji.
- **Dostępność (A11y):** Ikony dekoracyjne muszą posiadać `aria-hidden="true"`. Przyciski zawierające tylko ikonę muszą posiadać `aria-label` (np. `aria-label="Powiadomienia"`).

## 2. Mapa Ikon dla mójMińsk.app
```tsx
import {
  Home,
  ShoppingBag,
  Package,
  MessageSquare,
  User,
  Search,
  Bell,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Bus,
  Clock,
  Sparkles,
  Heart,
  ChevronRight,
  ArrowRight,
  Plus
} from 'lucide-react';

// Ikony Dolnej Pływającej Kapsuły
export const NavIcons = {
  Home,
  Kitchen: ShoppingBag,
  Classifieds: Package,
  Conversations: MessageSquare,
  Profile: User
};
```
