import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GameSaveDto } from '../../../core/models';

@Component({
  selector: 'app-game-saves-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './game-saves-modal.component.html',
  styleUrl: './game-saves-modal.component.css'
})
export class GameSavesModalComponent {
  adventureTitle = input<string>('Avventura Grafica');
  saves = input<GameSaveDto[]>([]);

  selectSave = output<string>();
  close = output<void>();
}
