import { Component, HostListener, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionType, Item } from '../../../../core/models';

@Component({
  selector: 'app-game-radial-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-radial-menu.component.html',
  styleUrl: './game-radial-menu.component.css'
})
export class GameRadialMenuComponent {
  x = input<number>(0);
  y = input<number>(0);
  item = input<Item | null>(null);

  actionSelected = output<{ actionCode: string; actionType: ActionType }>();
  close = output<void>();

  hoveredAction = signal<ActionType | null>(null);
  needleAngle = signal<number>(0);

  actionSentence = computed(() => {
    const act = this.hoveredAction();
    const itemName = this.item()?.name || '';
    if (!act) return '';

    switch (act) {
      case 'LOOK_AT': return `Guarda ${itemName}`;
      case 'PICK_UP': return `Raccogli ${itemName}`;
      case 'USE': return `Usa ${itemName}`;
      case 'OPEN': return `Apri ${itemName}`;
      case 'TALK_TO': return `Parla con ${itemName}`;
      case 'MOVE': return `Muovi ${itemName}`;
      default: return `Interagisci con ${itemName}`;
    }
  });

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
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

    if (dist < 26 || dist > 130) {
      this.hoveredAction.set(null);
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    const type = this.hoveredAction();
    const action = this.item()?.actions?.find((a) => a.type === type);

    if (action?.code) {
      this.actionSelected.emit({ actionCode: action.code, actionType: action.type });
    } else if (type) {
      console.warn('Azione senza codice, impossibile eseguirla:', type);
    }
    this.close.emit();
  }

  getSlotStyle(index: number, total: number): { top: string; left: string; angle: number } {
    const angleStep = 360 / Math.max(total, 1);
    const angleDeg = -90 + index * angleStep;
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = 68;

    return {
      left: `calc(50% + ${Math.cos(angleRad) * radius}px)`,
      top: `calc(50% + ${Math.sin(angleRad) * radius}px)`,
      angle: angleDeg + 90
    };
  }
}
