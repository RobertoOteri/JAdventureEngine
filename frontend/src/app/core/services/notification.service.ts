import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslationService } from '../i18n/translation.service';
import { TranslationKey } from '../i18n/i18n.types';
import { apiErrorMessage } from '../utils/http-error.util';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  warning: 5000,
  error: 6000
};

const MAX_VISIBLE = 4;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly i18n = inject(TranslationService);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  httpError(err: unknown, fallbackKey: TranslationKey = 'errors.generic'): void {
    const message = err instanceof HttpErrorResponse && err.status === 0
      ? this.i18n.t('errors.serverUnreachable')
      : apiErrorMessage(err, this.i18n) ?? this.i18n.t(fallbackKey);
    this.error(message);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(type: ToastType, message: string): void {
    const duplicate = this._toasts().find((toast) => toast.type === type && toast.message === message);
    if (duplicate) {
      this.dismiss(duplicate.id);
    }

    const toast: Toast = { id: ++this.nextId, type, message, duration: DEFAULT_DURATION[type] };
    const overflow = this._toasts().slice(0, Math.max(0, this._toasts().length - MAX_VISIBLE + 1));
    overflow.forEach((old) => this.dismiss(old.id));

    this._toasts.update((toasts) => [...toasts, toast]);
    this.timers.set(toast.id, setTimeout(() => this.dismiss(toast.id), toast.duration));
  }
}
