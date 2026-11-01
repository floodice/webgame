import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import en, { type Translations } from './en';
import zh from './zh';
import es from './es';
import fr from './fr';
import ja from './ja';
import pt from './pt';
import de from './de';
import ko from './ko';
import ru from './ru';
import ar from './ar';
import hi from './hi';

export type Lang = 'en' | 'zh' | 'es' | 'fr' | 'ja' | 'pt' | 'de' | 'ko' | 'ru' | 'ar' | 'hi';

export const LANG_LIST: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

const LANGS: Record<Lang, Translations> = { en, zh, es, fr, ja, pt, de, ko, ru, ar, hi };

const ALL_CODES = new Set<string>(LANG_LIST.map(l => l.code));

const STORAGE_KEY = 'gamehub_lang';

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ALL_CODES.has(saved)) return saved as Lang;
  } catch { /* SSR / privacy */ }
  const nav = navigator.language || '';
  const prefix = nav.split('-')[0].toLowerCase();
  if (ALL_CODES.has(prefix)) return prefix as Lang;
  return 'en';
}

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const Ctx = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const detected = detectLang();
    document.documentElement.lang = detected;
    document.documentElement.dir = detected === 'ar' ? 'rtl' : 'ltr';
    return detected;
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* noop */ }
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const t = LANGS[lang];

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

/** Template helper — replaces {key} placeholders */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
