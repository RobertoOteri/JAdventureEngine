import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { GraphicAdventureDto, UserProfile } from '../../../../core/models';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { UserAvatarComponent } from '../../../../shared/ui/user-avatar/user-avatar.component';
import { AdventureCardComponent } from '../../../../shared/ui/adventure-card/adventure-card.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, TranslatePipe, UserAvatarComponent, AdventureCardComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  readonly favoriteService = inject(FavoriteService);

  readonly user = signal<UserProfile | null>(null);
  readonly adventures = signal<GraphicAdventureDto[]>([]);
  readonly loading = signal<boolean>(true);

  readonly isMe = computed(() => this.user()?.username === this.authService.currentUsername());

  readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });

  constructor() {
    this.favoriteService.load();
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.load(params.get('username') ?? ''));
  }

  openAdventure(adventure: GraphicAdventureDto): void {
    void this.router.navigate(['/adventures', adventure.id]);
  }

  playAdventure(adventure: GraphicAdventureDto): void {
    void this.router.navigate(['/adventures', adventure.id, 'play']);
  }

  private load(username: string): void {
    if (!username) {
      void this.router.navigate(['/adventures']);
      return;
    }

    this.loading.set(true);
    forkJoin({
      user: this.userService.getProfile(username),
      adventures: this.userService.getPublishedAdventures(username)
    }).subscribe({
      next: ({ user, adventures }) => {
        this.user.set(user);
        this.adventures.set(adventures);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notifications.httpError(err);
        void this.router.navigate(['/adventures']);
      }
    });
  }
}
