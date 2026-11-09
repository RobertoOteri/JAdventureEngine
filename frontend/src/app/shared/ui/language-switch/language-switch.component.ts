import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Language } from '../../../core/i18n/i18n.types';

@Component({
  selector: 'app-language-switch',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './language-switch.component.html',
  styleUrl: './language-switch.component.css'
})
export class LanguageSwitchComponent {
  private readonly i18n = inject(TranslationService);

  readonly languages = this.i18n.availableLanguages;
  readonly current = this.i18n.lang;

  select(lang: Language): void {
    this.i18n.setLanguage(lang);
  }
}
