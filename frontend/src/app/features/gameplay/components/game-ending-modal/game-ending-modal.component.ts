import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LeaderboardComponent } from '../../../../features/leaderboard/leaderboard.component';
import {TranslatePipe} from '../../../../core/i18n/translate.pipe';
import { formatPlayTime } from '../../../../core/utils/time.util';
import { ReviewService } from '../../../../core/services/review.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StarRatingComponent } from '../../../../shared/ui/star-rating/star-rating.component';

type ReviewPromptState = 'hidden' | 'ask' | 'done';

interface ConfettiPiece {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  color: string;
}

const CONFETTI_COLORS = ['#d9b26a', '#e3c27f', '#f3dca6', '#b8914f', '#efe6d2', '#8fb8c9'];

@Component({
  selector: 'app-game-ending-modal',
  standalone: true,
  imports: [LeaderboardComponent, TranslatePipe, StarRatingComponent],
  templateUrl: './game-ending-modal.component.html',
  styleUrl: './game-ending-modal.component.css'
})
export class GameEndingModalComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly notifications = inject(NotificationService);

  adventureTitle = input<string>('');
  adventureId = input.required<number>();
  message = input<string | null>(null);
  playTimeSeconds = input<number>(0);

  exit = output<void>();
  openReviews = output<void>();

  readonly reviewMaxLength = 2000;
  readonly reviewState = signal<ReviewPromptState>('hidden');
  readonly reviewRating = signal<number>(0);
  readonly reviewComment = signal<string>('');
  readonly reviewSaving = signal<boolean>(false);

  readonly isLeaderboardOpen = signal<boolean>(false);

  readonly formattedFinalTime = computed(() => formatPlayTime(this.playTimeSeconds()));

  constructor() {
    effect(() => {
      const adventureId = this.adventureId();
      untracked(() => this.checkReviewPrompt(adventureId));
    });
  }

  onReviewRatingChange(rating: number | null): void {
    this.reviewRating.set(rating ?? 0);
  }

  onReviewCommentInput(event: Event): void {
    this.reviewComment.set((event.target as HTMLTextAreaElement).value);
  }

  sendReview(): void {
    if (this.reviewRating() < 1 || this.reviewSaving()) {
      return;
    }
    this.reviewSaving.set(true);
    this.reviewService
      .saveMyReview(this.adventureId(), {
        rating: this.reviewRating(),
        comment: this.reviewComment().trim() || null
      })
      .subscribe({
        next: () => {
          this.reviewSaving.set(false);
          this.reviewState.set('done');
        },
        error: (err) => {
          this.reviewSaving.set(false);
          this.notifications.httpError(err, 'reviews.saveError');
        }
      });
  }

  private checkReviewPrompt(adventureId: number): void {
    this.reviewState.set('hidden');
    if (!adventureId) {
      return;
    }
    forkJoin({
      review: this.reviewService.getMyReview(adventureId),
      canReview: this.reviewService.canReview(adventureId)
    }).subscribe({
      next: ({ review, canReview }) => this.reviewState.set(canReview && !review ? 'ask' : 'hidden'),
      error: () => this.reviewState.set('hidden')
    });
  }

  readonly confetti: ConfettiPiece[] = Array.from({ length: 28 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 5 + Math.random() * 5,
    drift: -40 + Math.random() * 80,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
  }));
}
