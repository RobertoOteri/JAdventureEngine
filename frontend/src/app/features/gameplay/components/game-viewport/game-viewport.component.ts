import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scene, Item } from '../../../../core/models';

@Component({
  selector: 'app-game-viewport',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-viewport.component.html',
  styleUrl: './game-viewport.component.css'
})
export class GameViewportComponent {

  scene = input<Scene | null>(null);
  backgroundUrl = input<string>('');
  visibleItemCodes = input<string[]>([]);
  feedbackMessage = input<string | null>(null);

  itemClicked = output<{ item: Item; mouseX: number; mouseY: number }>();
  canvasClicked = output<void>();

  isItemVisible(item: Item): boolean {
    const visibleCodes = this.visibleItemCodes();
    if (visibleCodes && visibleCodes.length > 0) {
      return visibleCodes.includes(item.code);
    }
    return item.initiallyVisible;
  }

  onHotspotMouseDown(event: MouseEvent, item: Item): void {
    event.preventDefault();
    event.stopPropagation();
    this.itemClicked.emit({
      item,
      mouseX: event.clientX,
      mouseY: event.clientY
    });
  }
}
