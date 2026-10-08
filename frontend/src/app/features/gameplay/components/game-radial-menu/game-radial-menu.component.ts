import { Component, input, output, signal, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item, ActionType } from '../../../../core/models';

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

  actionSelected = output<{ itemCode: string; actionType: ActionType }>();
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
      const type = actionBtn.getAttribute('data-action-type') as ActionType;
      const angle = Number(actionBtn.getAttribute('data-angle') || '0');
      this.hoveredAction.set(type);
      this.needleAngle.set(angle);
    } else {
      const dx = event.clientX - this.x();
      const dy = event.clientY - this.y();
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 26 || dist > 130) {
        this.hoveredAction.set(null);
      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onWindowMouseUp(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const active = this.hoveredAction();
    const currentItem = this.item();

    if (active && currentItem) {
      this.actionSelected.emit({
        itemCode: currentItem.code,
        actionType: active
      });
    }
    this.close.emit();
  }

  getSlotStyle(index: number, total: number): { top: string; left: string; angle: number } {
    const angleStep = 360 / Math.max(total, 1);
    const angleDeg = -90 + (index * angleStep);
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = 68;

    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      angle: angleDeg + 90
    };
  }
}
