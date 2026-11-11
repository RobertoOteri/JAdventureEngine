import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GraphicAdventureDto } from '../../../core/models';
import { LeaderboardComponent } from '../../../features/leaderboard/leaderboard.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-adventure-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, LeaderboardComponent, TranslatePipe],
  templateUrl: './adventure-detail-modal.component.html',
  styleUrl: './adventure-detail-modal.component.css'
})
export class AdventureDetailModalComponent {
  readonly adventure = input.required<GraphicAdventureDto>();
  readonly close = output<void>();
  readonly play = output<number>();

  readonly isLeaderboardOpen = signal<boolean>(false);

  readonly isDraft = computed(() => this.adventure().status === 'DRAFT');

  /** La classifica esiste solo per le versioni pubblicate. */
  readonly hasLeaderboard = computed(() => !this.isDraft() && !!this.adventure().id);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onPlay(): void {
    const id = this.adventure().id;
    if (id) {
      this.play.emit(id);
    }
  }
}
