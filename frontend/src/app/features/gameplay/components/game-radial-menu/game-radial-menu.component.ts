import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item, ActionType, Action } from '../../../../core/models';

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

  getActionIcon(type: ActionType): string {
    switch (type) {
      case 'LOOK_AT': return 'bi-eye';
      case 'PICK_UP': return 'bi-hand-index-thumb';
      case 'USE': return 'bi-gear';
      case 'OPEN': return 'bi-unlock';
      case 'TALK_TO': return 'bi-chat-dots';
      case 'MOVE': return 'bi-arrows-move';
      default: return 'bi-cursor';
    }
  }

  getActionLabel(type: ActionType): string {
    switch (type) {
      case 'LOOK_AT': return 'Guarda';
      case 'PICK_UP': return 'Prendi';
      case 'USE': return 'Usa';
      case 'OPEN': return 'Apri';
      case 'TALK_TO': return 'Parla';
      case 'MOVE': return 'Muovi';
      default: return type;
    }
  }

  onSelectAction(action: Action, event: MouseEvent): void {
    event.stopPropagation();
    const currentItem = this.item();

    // Fallback prioritario: usa action.code se valorizzato, altrimenti l'item.code (target) o l'id numerico
    const targetCode = action.code || currentItem?.code || (action.id ? String(action.id) : '');

    if (targetCode) {
      this.actionSelected.emit({
        actionCode: targetCode,
        actionType: action.type
      });
    } else {
      console.warn('Impossibile determinare il target per l\'azione selezionata:', action);
    }
    this.close.emit();
  }

  getSlotStyle(index: number, total: number): { top: string; left: string } {
    const angleStep = 360 / Math.max(total, 1);
    const angleDeg = -90 + (index * angleStep);
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = 64;

    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`
    };
  }
}
