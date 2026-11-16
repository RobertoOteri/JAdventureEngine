import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-game-topbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game-topbar.component.html',
  styleUrl: './game-topbar.component.css'
})
export class GameTopbarComponent {
  adventureTitle = input<string>('');
  sceneName = input<string>('');
  inventoryCount = input<number>(0);
  bump = input<number>(0);

  openInventory = output<void>();
  openPauseMenu = output<void>();
  goBack = output<void>();

  readonly bagBump = signal(false);
  private bumpTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      if (this.bump() > 0) {
        this.playBagBump();
      }
    });
  }

  private playBagBump(): void {
    if (this.bumpTimer) {
      clearTimeout(this.bumpTimer);
    }
    this.bagBump.set(false);
    requestAnimationFrame(() => {
      this.bagBump.set(true);
      this.bumpTimer = setTimeout(() => {
        this.bagBump.set(false);
        this.bumpTimer = null;
      }, 900);
    });
  }
}
