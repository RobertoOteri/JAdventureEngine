import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-topbar.component.html',
  styleUrl: './game-topbar.component.css'
})
export class GameTopbarComponent {
  adventureTitle = input<string>('Avventura Grafica');
  sceneName = input<string>('Stanza');
  inventoryCount = input<number>(0);

  openInventory = output<void>();
  openPauseMenu = output<void>();
  goBack = output<void>();
}
