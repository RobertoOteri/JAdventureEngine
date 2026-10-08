import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameSaveDto } from '../../../../core/models';

@Component({
  selector: 'app-game-pause-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-pause-modal.component.html',
  styleUrl: './game-pause-modal.component.css'
})
export class GamePauseModalComponent {
  saves = input<GameSaveDto[]>([]);

  resume = output<void>();
  save = output<string>();
  load = output<string>();
  exit = output<void>();

  mode = signal<'MENU' | 'SAVE_FORM' | 'LOAD_LIST'>('MENU');
  saveSlotName = signal<string>('');

  setMode(newMode: 'MENU' | 'SAVE_FORM' | 'LOAD_LIST'): void {
    this.mode.set(newMode);
  }

  onConfirmSave(): void {
    this.save.emit(this.saveSlotName().trim());
    this.saveSlotName.set('');
    this.mode.set('MENU');
  }

  onSelectSaveToLoad(code: string): void {
    this.load.emit(code);
  }
}
