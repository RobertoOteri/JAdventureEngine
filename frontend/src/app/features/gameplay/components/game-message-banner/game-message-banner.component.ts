import { Component, input, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BannerMessageType = 'info' | 'success' | 'error';

@Component({
  selector: 'app-game-message-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-message-banner.component.html',
  styleUrl: './game-message-banner.component.css'
})
export class GameMessageBannerComponent implements OnDestroy {
  message = input<string | null>(null);
  type = input<BannerMessageType>('info');
  duration = input<number>(4000);

  visible = signal<boolean>(false);
  currentText = signal<string>('');
  isFadingOut = signal<boolean>(false);

  private hideTimeout: any = null;
  private fadeTimeout: any = null;

  constructor() {
    effect(() => {
      const msg = this.message();
      if (msg && msg.trim().length > 0) {
        this.displayMessage(msg.trim());
      } else {
        this.clearTimers();
        this.visible.set(false);
      }
    });
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
      }, 350);
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
