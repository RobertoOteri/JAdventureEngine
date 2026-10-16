import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../../../core/models';

@Component({
  selector: 'app-game-inventory-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-inventory-modal.component.html',
  styleUrl: './game-inventory-modal.component.css'
})
export class GameInventoryModalComponent {
  items = input<InventoryItem[]>([]);
  close = output<void>();

  selectedItem: InventoryItem | null = null;

  selectItem(item: InventoryItem): void {
    this.selectedItem = item;
  }
}
