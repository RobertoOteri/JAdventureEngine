import { Component, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GraphicAdventureDto } from '../../../core/models';
import { LeaderboardComponent } from '../../../features/leaderboard/leaderboard.component';

@Component({
  selector: 'app-adventure-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, LeaderboardComponent],
  templateUrl: './adventure-detail-modal.component.html',
  styleUrl: './adventure-detail-modal.component.css'
})
export class AdventureDetailModalComponent {
  readonly adventure = input.required<GraphicAdventureDto>();
  readonly close = output<void>();
  readonly play = output<string>();

  readonly isLeaderboardOpen = signal<boolean>(false);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onPlay(): void {
    this.play.emit(this.adventure().code);
  }
}
