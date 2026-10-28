import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scene, Item, ActionType } from '../../../../core/models';
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
  isDragging = input<boolean>(false);

  itemClicked = output<{ item: Item; mouseX: number; mouseY: number }>();
  touchActionTriggered = output<{ actionCode: string; actionType: ActionType }>();
  canvasClicked = output<void>();
  hotspotHover = output<{ name: string; code: string } | null>();
  hotspotDrop = output<string>();

  isItemVisible(item: Item): boolean {
    const visibleCodes = this.visibleItemCodes();
    if (visibleCodes && visibleCodes.length > 0) {
      return visibleCodes.includes(item.code);
    }
    return item.hotspot?.initiallyVisible ?? true;
  }

  onHotspotMouseDown(event: MouseEvent, item: Item): void {
    event.preventDefault();
    event.stopPropagation();

    const touchAction = item.actions?.find((a) => a.type === 'TOUCH');

    if (touchAction && touchAction.code) {
      this.touchActionTriggered.emit({
        actionCode: touchAction.code,
        actionType: 'TOUCH'
      });
    } else {
      this.itemClicked.emit({
        item,
        mouseX: event.clientX,
        mouseY: event.clientY
      });
    }
  }

  onHotspotEnter(item: Item): void {
    if (this.isDragging()) {
      this.hotspotHover.emit({ name: item.name, code: item.code });
    }
  }

  onHotspotLeave(): void {
    if (this.isDragging()) {
      this.hotspotHover.emit(null);
    }
  }

  onHotspotMouseUp(item: Item): void {
    if (this.isDragging()) {
      this.hotspotDrop.emit(item.code);
    }
  }

  getHotspotPosX(item: Item): number {
    return item.hotspot?.posX ?? 0;
  }

  getHotspotPosY(item: Item): number {
    return item.hotspot?.posY ?? 0;
  }

  getHotspotWidth(item: Item): number {
    const w = item.hotspot?.width;
    return w && w > 0 ? w : 120;
  }

  getHotspotHeight(item: Item): number {
    const h = item.hotspot?.height;
    return h && h > 0 ? h : 120;
  }
}
