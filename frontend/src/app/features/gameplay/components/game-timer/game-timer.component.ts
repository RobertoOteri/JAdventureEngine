import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatPlayTime } from '../../../../core/utils/time.util';

@Component({
  selector: 'app-game-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-timer.component.html',
  styleUrl: './game-timer.component.css'
})
export class GameTimerComponent {
  playTimeSeconds = input<number>(0);

  formattedTime = computed(() => formatPlayTime(this.playTimeSeconds()));
}
