import { Component, computed, HostListener, inject,  input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionType, GameItem, GameItemAction } from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslationKey } from '../../../../core/i18n/i18n.types';


const ACTION_SENTENCE_KEYS: Partial<Record<ActionType, TranslationKey>> = {
  LOOK_AT: 'gameplay.radial.lookAt',
  PICK_UP: 'gameplay.radial.pickUp',
  USE: 'gameplay.radial.use',
  OPEN: 'gameplay.radial.open',
  TALK_TO: 'gameplay.radial.talkTo',
  MOVE: 'gameplay.radial.move'
};

const ACTION_POSITIONS: Record<string, number> = {
  LOOK_AT: 0,
  PICK_UP: 60,
  USE: 120,
  OPEN: 180,
  TALK_TO: 240,
  MOVE: 300
};

@Component({
  selector: 'app-game-radial-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-radial-menu.component.html',
  styleUrl: './game-radial-menu.component.css'
})
export class GameRadialMenuComponent {

  private readonly i18n = inject(TranslationService);

  x = input<number>(0);
  y = input<number>(0);
  item = input<GameItem | null>(null);

  actionSelected = output<{ itemCode: string; actionType: ActionType }>();
  close = output<void>();

  hoveredAction = signal<ActionType | null>(null);
  needleAngle = signal<number>(0);

  private startDragPos: { x: number; y: number } | null = null;
  private hasMovedSignificantly = false;

  filteredActions = computed(() => {
    const rawActions = this.item()?.actions ?? [];
    return rawActions.filter((a) => a.type !== 'USE_WITH');
  });

  hasOpenAction = computed(() => {
    return this.filteredActions().some((a) => a.type === 'OPEN');
  });

  isNearBottom = computed(() => {
    if (typeof window === 'undefined') return false;
    return this.y() > window.innerHeight - 160;
  });

  actionSentence = computed(() => {
    const act = this.hoveredAction();
    if (!act) return '';
    const key = ACTION_SENTENCE_KEYS[act] ?? 'gameplay.radial.interact';
    return this.i18n.t(key, { item: this.item()?.name || '' });
  });

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (!this.startDragPos) {
      this.startDragPos = { x: event.clientX, y: event.clientY };
    } else {
      const distFromStart = Math.hypot(event.clientX - this.startDragPos.x, event.clientY - this.startDragPos.y);
      if (distFromStart > 10) {
        this.hasMovedSignificantly = true;
      }
    }

    const el = document.elementFromPoint(event.clientX, event.clientY);
    const actionBtn = el?.closest('.btn-radial-action');

    if (actionBtn) {
      this.hoveredAction.set(actionBtn.getAttribute('data-action-type') as ActionType);
      this.needleAngle.set(Number(actionBtn.getAttribute('data-angle') || '0'));
      return;
    }

    const dx = event.clientX - this.x();
    const dy = event.clientY - this.y();
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 26 || dist > 140) {
      this.hoveredAction.set(null);
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    if (this.hasMovedSignificantly && this.hoveredAction()) {
      this.triggerSelectedAction(this.hoveredAction()!);
    }
  }

  onActionClicked(event: MouseEvent, action: GameItemAction): void {
    event.stopPropagation();
    this.triggerSelectedAction(action.type);
  }

  onBackdropClicked(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit();
  }

  private triggerSelectedAction(type: ActionType): void {
    const item = this.item();
    const action = item?.actions?.find((a) => a.type === type);

    if (item && action) {
      this.actionSelected.emit({ itemCode: item.code, actionType: action.type });
    } else if (type) {
      console.warn('Azione senza codice, impossibile eseguirla:', type);
    }
    this.close.emit();
  }

  getSlotStyle(actionType: string): { top: string; left: string; angle: number } {
    const baseAngle = ACTION_POSITIONS[actionType] ?? 0;
    const angleDeg = -90 + baseAngle;
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = 68;

    return {
      left: `calc(50% + ${Math.cos(angleRad) * radius}px)`,
      top: `calc(50% + ${Math.sin(angleRad) * radius}px)`,
      angle: angleDeg + 90
    };
  }
}
