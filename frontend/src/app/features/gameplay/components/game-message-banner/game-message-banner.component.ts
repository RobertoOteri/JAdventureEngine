import { Component, OnDestroy, effect, input, signal, untracked } from '@angular/core';

export type BannerMessageType = 'info' | 'success' | 'error';

const FADE_OUT_MS = 350;

@Component({
  selector: 'app-game-message-banner',
  standalone: true,
  templateUrl: './game-message-banner.component.html',
  styleUrl: './game-message-banner.component.css'
})
export class GameMessageBannerComponent implements OnDestroy {
  readonly message = input<string | null>(null);
  readonly type = input<BannerMessageType>('info');
  readonly duration = input<number>(4000);

  readonly raised = input<boolean>(false);

  readonly visible = signal<boolean>(false);
  readonly currentText = signal<string>('');
  readonly isFadingOut = signal<boolean>(false);

  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(
      () => {
        const msg = this.message();

        untracked(() => {
          if (msg && msg.trim().length > 0) {
            this.displayMessage(msg.trim());
          } else {
            this.clearTimers();
            this.visible.set(false);
          }
        });
      },
      { allowSignalWrites: true }
    );
  }

  private displayMessage(text: string): void {
    this.clearTimers();
    this.currentText.set(text);
    this.isFadingOut.set(false);
    this.visible.set(true);

    this.hideTimeout = setTimeout(() => {
      this.isFadingOut.set(true);
      this.fadeTimeout = setTimeout(() => {
        this.visible.set(false);
        this.isFadingOut.set(false);
      }, FADE_OUT_MS);
    }, this.duration());
  }

  private clearTimers(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}
