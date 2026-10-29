import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // Będziemy rejestrować ręcznie w kodzie aplikacji za pomocą virtual:pwa-register z auto-reloadem
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        importScripts: ['/push-sw.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/sitemap.*\.xml$/,
          /^\/robots\.txt$/,
        ],
      },
      includeAssets: ['apple-touch-icon.png', 'icons/*.png', 'icons/*.svg', 'push-sw.js'],
      manifest: {
        name: 'mójMińsk - Aplikacja Mieszkańców',
        short_name: 'mójMińsk',
        description: 'Zweryfikowana społeczność, rozkłady ZDiTM, e-zakupy z Motylek Market w Mińsku Mazowieckim',
        theme_color: '#F0EFF4',
        background_color: '#F0EFF4',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone', 'window-controls-overlay'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
