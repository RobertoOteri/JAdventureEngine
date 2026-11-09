import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scene, Item, ActionType } from '../../../../core/models';
import { GameTimerComponent } from '../game-timer/game-timer.component';
import { GameInputOverlayComponent } from '../game-input-overlay/game-input-overlay.component';
import { InputOverlayState } from '../../store/gameplay.store';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-game-viewport',
  standalone: true,
  imports: [CommonModule, GameTimerComponent, GameInputOverlayComponent, TranslatePipe],
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
  inputOverlay = input<InputOverlayState | null>(null);

  itemClicked = output<{ item: Item; mouseX: number; mouseY: number }>();
  singleActionTriggered = output<{ actionCode: string; actionType: ActionType }>();
  canvasClicked = output<void>();
  hotspotHover = output<{ name: string; code: string } | null>();
  hotspotDrop = output<string>();
  inputValueChange = output<string>();
  inputSubmitted = output<void>();
  inputDismissed = output<void>();

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

    const actions = item.actions ?? [];

    if (actions.length === 1 && actions[0].type !== 'USE_WITH' && actions[0].code) {
      this.singleActionTriggered.emit({
        actionCode: actions[0].code,
        actionType: actions[0].type
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
