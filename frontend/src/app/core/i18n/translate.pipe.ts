import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';
import { TranslationKey, TranslationParams } from './i18n.types';

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}
