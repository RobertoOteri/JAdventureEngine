import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-game-ending-modal',
  standalone: true,
  templateUrl: './game-ending-modal.component.html',
  styleUrl: './game-ending-modal.component.css'
})
export class GameEndingModalComponent {
  adventureTitle = input<string>('Avventura');
  message = input<string | null>(null);

  continueGame = output<void>();
  exit = output<void>();
}
