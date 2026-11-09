import { it } from './translations/it';

export type Language = 'it' | 'en';

export type Translations = typeof it;

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Translations>;

export type TranslationParams = Record<string, string | number>;
