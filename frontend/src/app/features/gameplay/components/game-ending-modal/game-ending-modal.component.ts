import {Component, computed, input, output} from '@angular/core';

@Component({
  selector: 'app-game-ending-modal',
  standalone: true,
  templateUrl: './game-ending-modal.component.html',
  styleUrl: './game-ending-modal.component.css'
})
export class GameEndingModalComponent {
  adventureTitle = input<string>('Avventura');
  message = input<string | null>(null);

  playTimeSeconds = input<number>(0);

  continueGame = output<void>();
  exit = output<void>();

  formattedFinalTime = computed(() => {
    const total = this.playTimeSeconds();
    const mins = Math.floor(total / 60).toString().padStart(2, '0');
    const secs = (total % 60).toString().padStart(2, '0');
    const hours = Math.floor(total / 3600);
    return hours > 0 ? `${hours} ore e ${mins} min` : `${mins} minuti e ${secs} secondi`;
  });
}
