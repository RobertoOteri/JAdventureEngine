import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Language, TranslationKey, TranslationParams, Translations } from './i18n.types';
import { it } from './translations/it';
import { en } from './translations/en';

const STORAGE_KEY = 'jadventure.lang';
const DEFAULT_LANGUAGE: Language = 'it';
const DICTIONARIES: Record<Language, Translations> = { it, en };

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly document = inject(DOCUMENT);

  readonly availableLanguages: readonly Language[] = ['it', 'en'];

  private readonly _lang = signal<Language>(this.initialLanguage());
  readonly lang = this._lang.asReadonly();

  private readonly dictionary = computed(() => DICTIONARIES[this._lang()]);

  constructor() {
    effect(() => {
      const lang = this._lang();
      this.document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
      }
    });
  }

  setLanguage(lang: Language): void {
    this._lang.set(lang);
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const text =
      this.lookup(this.dictionary(), key) ??
      this.lookup(DICTIONARIES[DEFAULT_LANGUAGE], key) ??
      key;
    return params ? this.interpolate(text, params) : text;
  }

  private lookup(dictionary: Translations, key: string): string | undefined {
    const value = key.split('.').reduce<unknown>(
      (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
      dictionary
    );
    return typeof value === 'string' ? value : undefined;
  }

  private interpolate(text: string, params: TranslationParams): string {
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match
    );
  }

  private initialLanguage(): Language {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'it' || stored === 'en') {
        return stored;
      }
    } catch {
    }
    return navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en';
  }

  tryT(key: string, params?: TranslationParams): string | null {
    const text =
      this.lookup(this.dictionary(), key) ??
      this.lookup(DICTIONARIES[DEFAULT_LANGUAGE], key);
    if (text === undefined) {
      return null;
    }
    return params ? this.interpolate(text, params) : text;
  }
}
