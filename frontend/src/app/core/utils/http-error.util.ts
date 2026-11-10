import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response.model';
import { TranslationService } from '../i18n/translation.service';

export function apiErrorMessage(err: unknown, i18n: TranslationService): string | null {
  if (!(err instanceof HttpErrorResponse)) {
    return null;
  }
  const apiError = err.error as Partial<ErrorResponse> | null;
  if (!apiError?.code) {
    return null;
  }
  const params = Object.fromEntries((apiError.params ?? []).map((value, index) => [String(index), value]));
  return i18n.tryT(`api.${apiError.code}`, params);
}

export function httpErrorMessage(err: HttpErrorResponse, i18n: TranslationService): string {
  if (err.status === 0) {
    return i18n.t('errors.serverUnreachable');
  }
  return apiErrorMessage(err, i18n) ?? i18n.t('errors.generic');
}
