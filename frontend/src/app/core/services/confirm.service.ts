import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _pending = signal<PendingConfirm | null>(null);
  readonly pending = this._pending.asReadonly();

  ask(options: ConfirmOptions): Promise<boolean> {
    this._pending()?.resolve(false);
    return new Promise<boolean>((resolve) => this._pending.set({ ...options, resolve }));
  }

  settle(confirmed: boolean): void {
    const pending = this._pending();
    if (!pending) {
      return;
    }
    this._pending.set(null);
    pending.resolve(confirmed);
  }
}
