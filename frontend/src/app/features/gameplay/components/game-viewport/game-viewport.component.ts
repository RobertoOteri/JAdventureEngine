import {Component, computed, input, output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scene, Item } from '../../../../core/models';
import { GameTimerComponent } from '../game-timer/game-timer.component';

@Component({
  selector: 'app-game-viewport',
  standalone: true,
  imports: [CommonModule, GameTimerComponent],
  templateUrl: './game-viewport.component.html',
  styleUrl: './game-viewport.component.css'
})
export class GameViewportComponent {
  scene = input<Scene | null>(null);
  backgroundUrl = input<string>('');
  visibleItemCodes = input<string[]>([]);
  feedbackMessage = input<string | null>(null);
  playTimeSeconds = input<number>(0);

  itemClicked = output<{ item: Item; mouseX: number; mouseY: number }>();
  canvasClicked = output<void>();

  isItemVisible(item: Item): boolean {
    const visibleCodes = this.visibleItemCodes();
    if (visibleCodes && visibleCodes.length > 0) {
      return visibleCodes.includes(item.code);
    }
    return item.initiallyVisible ?? true;
  }

  onHotspotMouseDown(event: MouseEvent, item: Item): void {
    event.preventDefault();
    event.stopPropagation();
    this.itemClicked.emit({
      item,
      mouseX: event.clientX,
      mouseY: event.clientY
    });
  }
}
