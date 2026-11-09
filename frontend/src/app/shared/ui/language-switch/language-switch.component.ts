import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Language } from '../../../core/i18n/i18n.types';

interface LanguageOption {
  code: Language;
  short: string;
  name: string;
}

/** Nomi scritti nella lingua stessa (endonimi): non si traducono, così ognuno riconosce la propria. */
const LANGUAGE_OPTIONS: Record<Language, LanguageOption> = {
  it: { code: 'it', short: 'IT', name: 'Italiano' },
  en: { code: 'en', short: 'EN', name: 'English' }
};

@Component({
  selector: 'app-language-switch',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './language-switch.component.html',
  styleUrl: './language-switch.component.css'
})
export class LanguageSwitchComponent {
  private readonly i18n = inject(TranslationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** compact: globo + codice (sidebar). full: globo + nome completo (pagina di login). */
  readonly variant = input<'compact' | 'full'>('compact');
  /** Da che parte si apre il menu rispetto al pulsante. */
  readonly placement = input<'top' | 'bottom'>('bottom');
  /** A quale bordo del pulsante si allinea il menu. */
  readonly align = input<'start' | 'end'>('start');

  readonly isOpen = signal(false);
  readonly options = this.i18n.availableLanguages.map((code) => LANGUAGE_OPTIONS[code]);
  readonly current = computed(() => LANGUAGE_OPTIONS[this.i18n.lang()]);

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  select(lang: Language): void {
    this.i18n.setLanguage(lang);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }
}
