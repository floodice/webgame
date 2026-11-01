import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
  gameSchema?: GameSchema | null;
}

interface GameSchema {
  name: string;
  description: string;
  genre: string;
  url: string;
}

const SITE_NAME = 'GameHub';
const BASE_URL = 'https://game.getflovia.com';

const HREFLANG_MAP: Record<string, string> = {
  en: 'en',
  zh: 'zh-CN',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar',
  hi: 'hi',
};

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function setHreflang(path: string) {
  document.querySelectorAll('link[hreflang]').forEach(el => el.remove());

  const url = `${BASE_URL}${path}`;
  for (const [, hreflang] of Object.entries(HREFLANG_MAP)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
  const xDefault = document.createElement('link');
  xDefault.setAttribute('rel', 'alternate');
  xDefault.setAttribute('hreflang', 'x-default');
  xDefault.setAttribute('href', url);
  document.head.appendChild(xDefault);
}

function setJsonLd(id: string, data: object) {
  let el = document.querySelector(`script[data-seo-id="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-id', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.querySelector(`script[data-seo-id="${id}"]`)?.remove();
}

function setBreadcrumb(path: string, pageTitle: string) {
  const items: { name: string; url: string }[] = [
    { name: 'GameHub', url: BASE_URL },
  ];

  if (path !== '/') {
    items.push({ name: pageTitle, url: `${BASE_URL}${path}` });
  }

  setJsonLd('breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

const CATEGORY_MAP: Record<string, string> = {
  puzzle: 'Puzzle',
  arcade: 'Arcade',
  strategy: 'Strategy',
  casual: 'Casual',
};

export function useSEO({ title, description, path, gameSchema }: SEOOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description);
    }

    setMeta('og:title', fullTitle, 'property');
    setMeta('twitter:title', fullTitle);

    if (path) {
      const url = `${BASE_URL}${path}`;
      setMeta('og:url', url, 'property');
      setCanonical(url);
      setHreflang(path);
      setBreadcrumb(path, title);
    }

    if (gameSchema) {
      setJsonLd('game', {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: gameSchema.name,
        description: gameSchema.description,
        genre: gameSchema.genre,
        url: gameSchema.url,
        playMode: 'SinglePlayer',
        applicationCategory: 'Game',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Organization',
          name: 'GameHub',
          url: BASE_URL,
        },
      });
    }

    return () => {
      removeJsonLd('game');
    };
  }, [title, description, path, gameSchema]);
}

export { BASE_URL, SITE_NAME, CATEGORY_MAP };
