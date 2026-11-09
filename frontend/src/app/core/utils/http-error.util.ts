import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response.model';
import { TranslationService } from '../i18n/translation.service';

export function httpErrorMessage(err: HttpErrorResponse, i18n: TranslationService): string {
  if (err.status === 0) {
    return i18n.t('errors.serverUnreachable');
  }
  const apiError = err.error as ErrorResponse | null;
  return apiError?.message || i18n.t('errors.generic');
}
