import { Component, OnDestroy, effect, input, output, signal } from '@angular/core';
import { GameItem } from '../../../../core/models';

type PickupPhase = 'enter' | 'hold' | 'leave';

@Component({
  selector: 'app-game-item-pickup',
  standalone: true,
  templateUrl: './game-item-pickup.component.html',
  styleUrl: './game-item-pickup.component.css'
})
export class GameItemPickupComponent implements OnDestroy {
  item = input<GameItem | null>(null);

  arrived = output<void>();
  done = output<void>();

  readonly shown = signal<GameItem | null>(null);
  readonly phase = signal<PickupPhase>('enter');
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    effect(() => {
      const item = this.item();
      this.clearTimers();
      this.shown.set(item);
      if (!item) {
        return;
      }
      this.phase.set('enter');
      this.timers.push(setTimeout(() => this.phase.set('hold'), 30));
      this.timers.push(setTimeout(() => this.phase.set('leave'), 2000));
      this.timers.push(setTimeout(() => {
        this.arrived.emit();
        this.done.emit();
      }, 2800));
    });
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
  }
}
