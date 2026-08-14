import { useLocation } from "react-router";
import { DEFAULT_LANG, langFromPath, withLang, type Lang } from "./config";
import { en } from "./en";
import { ru, type Strings } from "./ru";

export {
  DEFAULT_LANG,
  LANGS,
  LOCALES,
  OG_LOCALES,
  langFromPath,
  pick,
  pickText,
  stripLang,
  withLang,
} from "./config";
export type { Lang } from "./config";
export type { Strings } from "./ru";

const DICTIONARY: Record<Lang, Strings> = { ru, en };

export function strings(lang: Lang): Strings {
  return DICTIONARY[lang] ?? DICTIONARY[DEFAULT_LANG];
}

/** Язык текущей страницы. Он определяется адресом, а не настройкой браузера. */
export function useLang(): Lang {
  return langFromPath(useLocation().pathname);
}

/** Строки текущего языка. */
export function useT(): Strings {
  return strings(useLang());
}

/**
 * Внутренняя ссылка на текущем языке: в английской версии все переходы
 * должны оставаться в /en, иначе посетитель незаметно выпадает на русский.
 */
export function useLocalPath(): (path: string) => string {
  const lang = useLang();
  return (path: string) => withLang(path, lang);
}

/** То же самое вне компонента — в загрузчиках и meta. */
export function localPath(path: string, lang: Lang): string {
  return withLang(path, lang);
}
