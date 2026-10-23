import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../../../core/models';

const ORB_OFFSET_X = 32;

@Component({
  selector: 'app-game-drag-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-drag-cursor.component.html',
  styleUrl: './game-drag-cursor.component.css'
})
export class GameDragCursorComponent {
  x = input.required<number>();
  y = input.required<number>();
  item = input<InventoryItem | null>(null);
  targetName = input<string | null>(null);

  readonly sentence = computed(() => {
    const name = this.item()?.name ?? '';
    const target = this.targetName();
    return target ? `Usa ${name} su ${target}` : `Usa ${name} con…`;
  });

  readonly plaqueShift = computed(() => {
    const half = 170;
    const orbCenter = this.x() - ORB_OFFSET_X;
    const clamped = Math.min(Math.max(orbCenter, half), window.innerWidth - half);
    return clamped - orbCenter;
  });

  readonly plaqueAbove = computed(() => this.y() > window.innerHeight - 160);
}
