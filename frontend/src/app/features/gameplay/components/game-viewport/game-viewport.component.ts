import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameScene, GameItem, ActionType } from '../../../../core/models';
import { GameTimerComponent } from '../game-timer/game-timer.component';
import { GameInputOverlayComponent } from '../game-input-overlay/game-input-overlay.component';
import { InputOverlayState } from '../../store/gameplay.store';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TEXTBOX_GRID, TextBox } from '../../../../core/models/textbox.model';

/** Display del tastierino: posizione e stile della TextBox, più le cifre composte finora. */
export interface KeypadDisplayState {
  box: TextBox;
  value: string;
}

@Component({
  selector: 'app-game-viewport',
  standalone: true,
  imports: [CommonModule, GameTimerComponent, GameInputOverlayComponent, TranslatePipe],
  templateUrl: './game-viewport.component.html',
  styleUrl: './game-viewport.component.css'
})
export class GameViewportComponent {
  scene = input<GameScene | null>(null);
  backgroundUrl = input<string>('');
  feedbackMessage = input<string | null>(null);
  playTimeSeconds = input<number>(0);
  isDragging = input<boolean>(false);
  inputOverlay = input<InputOverlayState | null>(null);
  keypadDisplay = input<KeypadDisplayState | null>(null);

  itemClicked = output<{ item: GameItem; mouseX: number; mouseY: number }>();
  singleActionTriggered = output<{ itemCode: string; actionType: ActionType }>();
  canvasClicked = output<void>();
  hotspotHover = output<{ name: string; code: string } | null>();
  hotspotDrop = output<string>();
  inputValueChange = output<string>();
  inputSubmitted = output<void>();
  inputDismissed = output<void>();

  keypadFontSize(box: TextBox): string {
    return `${(box.fontSize / TEXTBOX_GRID) * 100}cqw`;
  }

  onHotspotMouseDown(event: MouseEvent, item: GameItem): void {
    event.preventDefault();
    event.stopPropagation();

    const actions = item.actions ?? [];

    if (actions.length === 1 && actions[0].type !== 'USE_WITH') {
      this.singleActionTriggered.emit({
        itemCode: item.code,
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

  onHotspotEnter(item: GameItem): void {
    if (this.isDragging()) {
      this.hotspotHover.emit({ name: item.name, code: item.code });
    }
  }

  onHotspotLeave(): void {
    if (this.isDragging()) {
      this.hotspotHover.emit(null);
    }
  }

  onHotspotMouseUp(item: GameItem): void {
    if (this.isDragging()) {
      this.hotspotDrop.emit(item.code);
    }
  }

  getHotspotPosX(item: GameItem): number {
    return item.hotspot?.posX ?? 0;
  }

  getHotspotPosY(item: GameItem): number {
    return item.hotspot?.posY ?? 0;
  }

  getHotspotWidth(item: GameItem): number {
    const w = item.hotspot?.width;
    return w && w > 0 ? w : 120;
  }

  getHotspotHeight(item: GameItem): number {
    const h = item.hotspot?.height;
    return h && h > 0 ? h : 120;
  }
}
