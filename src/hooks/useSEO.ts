import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
}

const SITE_NAME = 'GameHub';
const BASE_URL = 'https://game.getflovia.com';

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

export function useSEO({ title, description, path }: SEOOptions) {
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
    }
  }, [title, description, path]);
}
