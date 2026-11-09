import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-game-topbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game-topbar.component.html',
  styleUrl: './game-topbar.component.css'
})
export class GameTopbarComponent {
  adventureTitle = input<string>('');
  sceneName = input<string>('');
  inventoryCount = input<number>(0);

  openInventory = output<void>();
  openPauseMenu = output<void>();
  goBack = output<void>();
}
