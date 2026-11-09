import { Component, ElementRef, computed, inject, input, model, viewChild } from '@angular/core';
import { TextBoxDetail } from '../../../../core/models/textbox-detail.model';
import { TranslationService } from '../../../../core/i18n/translation.service';

export type { TextBoxDetail };

export const DEFAULT_TEXTBOX_DETAIL: TextBoxDetail = {
  posX: 400,
  posY: 460,
  width: 200,
  height: 60,
  fontFamily: 'Arial',
  fontSize: '16px',
  color: '#ffffff'
};

type DragMode = 'move' | 'resize' | 'draw';

const GRID = 1000;
const MIN_W = 60;
const MIN_H = 30;
const DEFAULT_COLOR = '#ffffff';

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

@Component({
  selector: 'app-textbox-placer',
  standalone: true,
  templateUrl: './textbox-placer.component.html',
  styleUrl: './textbox-placer.component.css'
})
export class TextBoxPlacerComponent {
  private readonly i18n = inject(TranslationService);
  readonly backgroundUrl = input.required<string>();
  readonly box = model.required<TextBoxDetail>();
  readonly sampleText = input<string>('');

  readonly isPlaceholder = computed(() => this.sampleText().trim().length === 0);
  readonly displayText = computed(
    () => this.sampleText().trim() || this.i18n.t('sceneEditor.textboxPlaceholder')
  );

  readonly textColor = computed(() => this.box().color || DEFAULT_COLOR);

  readonly isDarkText = computed(() => {
    const hex = this.textColor().replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.35;
  });

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private drag: { mode: DragMode; start: { x: number; y: number }; origin: TextBoxDetail } | null = null;

  readonly fontPx = computed(() => parseInt(this.box().fontSize ?? '16', 10) || 16);

  private toGrid(e: PointerEvent): { x: number; y: number } {
    const rect = this.stage().nativeElement.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * GRID,
      y: ((e.clientY - rect.top) / rect.height) * GRID
    };
  }

  private begin(mode: DragMode, e: PointerEvent): void {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.drag = { mode, start: this.toGrid(e), origin: this.box() };
  }

  beginDraw(e: PointerEvent): void {
    this.begin('draw', e);
  }

  beginMove(e: PointerEvent): void {
    e.stopPropagation();
    this.begin('move', e);
  }

  beginResize(e: PointerEvent): void {
    e.stopPropagation();
    this.begin('resize', e);
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.drag) return;

    const { mode, start, origin } = this.drag;
    const p = this.toGrid(e);
    const dx = p.x - start.x;
    const dy = p.y - start.y;

    if (mode === 'move') {
      this.box.set({
        ...origin,
        posX: Math.round(clamp(origin.posX + dx, 0, GRID - origin.width)),
        posY: Math.round(clamp(origin.posY + dy, 0, GRID - origin.height))
      });
    } else if (mode === 'resize') {
      this.box.set({
        ...origin,
        width: Math.round(clamp(origin.width + dx, MIN_W, GRID - origin.posX)),
        height: Math.round(clamp(origin.height + dy, MIN_H, GRID - origin.posY))
      });
    } else {
      if (Math.hypot(dx, dy) < 15) return;

      const x = clamp(Math.min(start.x, p.x), 0, GRID - MIN_W);
      const y = clamp(Math.min(start.y, p.y), 0, GRID - MIN_H);
      this.box.set({
        ...origin,
        posX: Math.round(x),
        posY: Math.round(y),
        width: Math.round(clamp(Math.abs(dx), MIN_W, GRID - x)),
        height: Math.round(clamp(Math.abs(dy), MIN_H, GRID - y))
      });
    }
  }

  onPointerUp(): void {
    this.drag = null;
  }
}
