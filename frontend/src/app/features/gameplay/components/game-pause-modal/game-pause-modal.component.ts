import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameSaveDto } from '../../../../core/models';

@Component({
  selector: 'app-game-pause-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './game-pause-modal.component.html',
  styleUrl: './game-pause-modal.component.css'
})
export class GamePauseModalComponent {
  saves = input<GameSaveDto[]>([]);

  resume = output<void>();
  save = output<string>();
  load = output<string>();
  exit = output<void>();

  readonly mode = signal<'MENU' | 'SAVE_FORM' | 'LOAD_LIST'>('MENU');
  saveSlotName = '';

  autoSave = computed(() =>
    this.saves().find(s => s.autoSave || s.name === 'Salvataggio automatico' || s.name === 'Inizio Avventura')
  );

  manualSaves = computed(() =>
    this.saves().filter(s => s !== this.autoSave())
  );

  setMode(newMode: 'MENU' | 'SAVE_FORM' | 'LOAD_LIST'): void {
    this.mode.set(newMode);
    if (newMode === 'SAVE_FORM') {
      this.saveSlotName = '';
    }
  }

  onConfirmSave(): void {
    const trimmed = this.saveSlotName.trim();
    this.save.emit(trimmed || 'Salvataggio rapido');
    this.setMode('MENU');
  }

  onSelectSaveToLoad(saveCode: string): void {
    if (saveCode) {
      this.load.emit(saveCode);
      this.resume.emit();
    }
  }
}
