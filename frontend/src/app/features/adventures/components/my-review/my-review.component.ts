import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ReviewDto } from '../../../../core/models';
import { ReviewService } from '../../../../core/services/review.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslationKey } from '../../../../core/i18n/i18n.types';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { StarRatingComponent } from '../../../../shared/ui/star-rating/star-rating.component';

@Component({
  selector: 'app-my-review',
  standalone: true,
  imports: [DatePipe, TranslatePipe, StarRatingComponent],
  templateUrl: './my-review.component.html',
  styleUrl: './my-review.component.css'
})
export class MyReviewComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);
  private readonly i18n = inject(TranslationService);

  readonly adventureId = input.required<number>();
  readonly isAuthor = input<boolean>(false);
  readonly changed = output<void>();

  readonly maxLength = 2000;

  readonly review = signal<ReviewDto | null>(null);
  readonly canReview = signal<boolean>(false);
  readonly loading = signal<boolean>(true);
  readonly editing = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  readonly draftRating = signal<number>(0);
  readonly draftComment = signal<string>('');

  readonly showForm = computed(() => this.canReview() && (this.editing() || !this.review()));

  readonly ratingLabel = computed(() => {
    const rating = this.draftRating();
    return rating > 0 ? this.i18n.t(`reviews.ratingLabels.r${rating}` as TranslationKey) : '';
  });

  constructor() {
    effect(() => {
      const adventureId = this.adventureId();
      untracked(() => this.load(adventureId));
    });
  }

  startEdit(): void {
    const review = this.review();
    if (!review) {
      return;
    }
    this.draftRating.set(review.rating);
    this.draftComment.set(review.comment ?? '');
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  onRatingChange(rating: number | null): void {
    this.draftRating.set(rating ?? 0);
  }

  onCommentInput(event: Event): void {
    this.draftComment.set((event.target as HTMLTextAreaElement).value);
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.draftRating() < 1 || this.saving()) {
      return;
    }

    const isUpdate = !!this.review();
    this.saving.set(true);
    this.reviewService
      .saveMyReview(this.adventureId(), {
        rating: this.draftRating(),
        comment: this.draftComment().trim() || null
      })
      .subscribe({
        next: (saved) => {
          this.review.set(saved);
          this.editing.set(false);
          this.saving.set(false);
          this.notifications.success(this.i18n.t(isUpdate ? 'reviews.updated' : 'reviews.published'));
          this.changed.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.notifications.httpError(err, 'reviews.saveError');
        }
      });
  }

  async remove(): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: this.i18n.t('reviews.deleteTitle'),
      message: this.i18n.t('reviews.deleteMessage'),
      confirmText: this.i18n.t('common.delete')
    });
    if (!confirmed) {
      return;
    }

    this.reviewService.deleteMyReview(this.adventureId()).subscribe({
      next: () => {
        this.review.set(null);
        this.resetDraft();
        this.notifications.success(this.i18n.t('reviews.deleted'));
        this.changed.emit();
      },
      error: (err) => this.notifications.httpError(err, 'reviews.deleteError')
    });
  }

  private load(adventureId: number): void {
    this.loading.set(true);
    this.editing.set(false);
    this.resetDraft();

    forkJoin({
      review: this.reviewService.getMyReview(adventureId),
      canReview: this.reviewService.canReview(adventureId)
    }).subscribe({
      next: ({ review, canReview }) => {
        this.review.set(review);
        this.canReview.set(canReview);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notifications.httpError(err, 'reviews.loadError');
      }
    });
  }

  private resetDraft(): void {
    this.draftRating.set(0);
    this.draftComment.set('');
  }
}
