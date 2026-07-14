"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Locale } from "./config";
import { localeDirections } from "./config";
import type ar from "./dictionaries/ar.json";

export type Dictionary = typeof ar;

interface I18nContextValue {
  lang: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  lang,
  dictionary,
  children,
}: {
  lang: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider
      value={{ lang, dir: localeDirections[lang], t: dictionary }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { fmt } from "./fmt";
