import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslationService } from '../i18n/translation.service';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = inject(TranslationService).lang();
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
