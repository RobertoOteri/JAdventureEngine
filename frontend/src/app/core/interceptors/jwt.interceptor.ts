import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { TranslationService } from '../i18n/translation.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);
  const i18n = inject(TranslationService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthUrl = req.url.includes('/api/auth');

      if (!isAuthUrl && error.status === 401 && authService.getToken()) {
        authService.logout();
        notifications.warning(i18n.t('errors.sessionExpired'));

        const returnUrl = router.url;
        void router.navigate(['/login'], {
          queryParams: returnUrl && !returnUrl.startsWith('/login') ? { returnUrl } : {}
        });
      }

      return throwError(() => error);
    })
  );
};
