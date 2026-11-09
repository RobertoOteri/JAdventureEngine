import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';

const ORB_OFFSET_X = 32;

@Component({
  selector: 'app-game-drag-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-drag-cursor.component.html',
  styleUrl: './game-drag-cursor.component.css'
})
export class GameDragCursorComponent {

  private readonly i18n = inject(TranslationService);

  x = input.required<number>();
  y = input.required<number>();
  item = input<Item | null>(null);
  targetName = input<string | null>(null);

  readonly sentence = computed(() => {
    const item = this.item()?.name ?? '';
    const target = this.targetName();
    return target
      ? this.i18n.t('gameplay.drag.useOn', { item, target })
      : this.i18n.t('gameplay.drag.useWith', { item });
  });

  readonly plaqueShift = computed(() => {
    const half = 170;
    const orbCenter = this.x() - ORB_OFFSET_X;
    const clamped = Math.min(Math.max(orbCenter, half), window.innerWidth - half);
    return clamped - orbCenter;
  });

  readonly plaqueAbove = computed(() => this.y() > window.innerHeight - 160);
}
