import { Component, input, output, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GameSaveDto } from '../../../core/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-game-saves-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslatePipe],
  templateUrl: './game-saves-modal.component.html',
  styleUrl: './game-saves-modal.component.css'
})
export class GameSavesModalComponent {
  adventureTitle = input<string>('');
  saves = input<GameSaveDto[]>([]);

  selectSave = output<string>();
  close = output<void>();

  autoSave = computed(() =>
    this.saves().find(s => s.autoSave || s.name === 'Salvataggio automatico' || s.name === 'Inizio Avventura')
  );

  manualSaves = computed(() =>
    this.saves().filter(s => s !== this.autoSave())
  );
}
