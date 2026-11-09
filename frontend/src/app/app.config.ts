import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([languageInterceptor, jwtInterceptor])
    )
  ]
};
