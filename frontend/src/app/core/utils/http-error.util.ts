import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response.model';

export function httpErrorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Impossibile contattare il server. Riprova tra poco.';
  }
  const apiError = err.error as ErrorResponse | null;
  return apiError?.message || 'Si è verificato un errore. Riprova.';
}
