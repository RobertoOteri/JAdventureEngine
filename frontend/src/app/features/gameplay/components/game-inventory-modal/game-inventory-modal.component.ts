import { Component, HostListener, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../../core/models';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

const MIN_SLOTS = 8;
const DRAG_THRESHOLD_PX = 6;

@Component({
  selector: 'app-game-inventory-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game-inventory-modal.component.html',
  styleUrl: './game-inventory-modal.component.css'
})
export class GameInventoryModalComponent {
  open = input<boolean>(true);
  items = input<Item[]>([]);
  isDragging = input<boolean>(false);
  draggedItemCode = input<string | null>(null);

  close = output<void>();
  itemDragStart = output<{ item: Item; x: number; y: number }>();
  slotHover = output<{ name: string; code: string } | null>();
  slotDrop = output<string>();

  readonly hasOpened = signal<boolean>(false);

  readonly isPeekingExpanded = signal<boolean>(false);
  readonly selectedCode = signal<string | null>(null);
  readonly hoveredCode = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.hasOpened.set(true);
      }
    });
  }

  private pendingDrag: { item: Item; x: number; y: number } | null = null;
  private dragStarted = false;

  readonly slots = computed<(Item | null)[]>(() => {
    const items = this.items();
    const empty = Math.max(0, MIN_SLOTS - items.length);
    return [...items, ...Array.from({ length: empty }, () => null)];
  });

  readonly selectedItem = computed(
    () => this.items().find((i) => i.code === this.selectedCode()) ?? null
  );

  readonly hoveredItem = computed(
    () => this.items().find((i) => i.code === this.hoveredCode()) ?? null
  );

  readonly focusedItem = computed(() => this.hoveredItem() ?? this.selectedItem());

  toggleSelect(item: Item): void {
    if (this.isDragging() || this.dragStarted) return;
    this.selectedCode.update((code) => (code === item.code ? null : item.code));
  }

  onSlotMouseDown(event: MouseEvent, item: Item): void {
    if (event.button !== 0) return;
    this.dragStarted = false;
    this.isPeekingExpanded.set(false);
    this.pendingDrag = { item, x: event.clientX, y: event.clientY };
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    const pending = this.pendingDrag;
    if (!pending || this.isDragging()) return;

    const moved = Math.hypot(event.clientX - pending.x, event.clientY - pending.y);
    if (moved > DRAG_THRESHOLD_PX) {
      this.pendingDrag = null;
      this.dragStarted = true;
      this.itemDragStart.emit({ item: pending.item, x: event.clientX, y: event.clientY });
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    this.pendingDrag = null;
  }

  onSlotMouseEnter(item: Item): void {
    this.hoveredCode.set(item.code);
    if (this.isDragging() && item.code !== this.draggedItemCode()) {
      this.slotHover.emit({ name: item.name, code: item.code });
    }
  }

  onSlotMouseLeave(): void {
    this.hoveredCode.set(null);
    if (this.isDragging()) {
      this.slotHover.emit(null);
    }
  }

  onSlotMouseUp(item: Item): void {
    if (this.isDragging() && item.code !== this.draggedItemCode()) {
      this.isPeekingExpanded.set(false);
      this.slotDrop.emit(item.code);
    }
  }

  onMiniBarEnter(): void {
    if (this.isDragging()) {
      this.isPeekingExpanded.set(true);
    }
  }

  onFrameMouseLeave(): void {
    if (this.isDragging()) {
      this.isPeekingExpanded.set(false);
      this.slotHover.emit(null);
    }
  }
}
