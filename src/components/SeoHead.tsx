import { useEffect } from 'react';

const SITE_ORIGIN = 'https://mojminsk.app';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/icons/icon-512.png`;

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SeoHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}: SeoHeadProps) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const search = typeof window !== 'undefined' ? window.location.search : '';

  const searchParams = new URLSearchParams(search);
  const hasFilterParams = ['q', 'sort', 'min', 'max', 'darmo', 'filtr'].some((p) =>
    searchParams.has(p),
  );
  const pageParam = searchParams.get('strona');

  const shouldNoIndex = noindex || hasFilterParams;
  const robotsContent = shouldNoIndex ? 'noindex, follow' : 'index, follow';

  const cleanPath = (canonicalPath ?? pathname).replace(/\/+$/, '') || '/';
  const canonicalUrl =
    pageParam && Number(pageParam) > 1
      ? `${SITE_ORIGIN}${cleanPath}?strona=${Number(pageParam)}`
      : `${SITE_ORIGIN}${cleanPath}`;

  const fullTitle = title.includes('mójMińsk') ? title : `${title} | mójMińsk.app`;

  useEffect(() => {
    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robotsContent });
    upsertLink('canonical', canonicalUrl);

    // Open Graph
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'pl_PL' });
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: 'mójMińsk.app',
    });

    // Twitter Cards
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });
  }, [fullTitle, description, robotsContent, canonicalUrl, ogType, ogImage]);

  return jsonLd ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  ) : null;
}
