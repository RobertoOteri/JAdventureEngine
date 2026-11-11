import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GraphicAdventureDto } from '../models';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly apiUrl = `${environment.apiUrl}/users/me/favorites`;

  private readonly favoritesSignal = signal<GraphicAdventureDto[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly pendingCodes = new Set<string>();

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly favoriteCodes = computed(() => new Set(this.favoritesSignal().map((a) => a.code)));

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.favoritesSignal.set([]);
      }
    });
  }

  load(): void {
    this.loadingSignal.set(true);
    this.http.get<GraphicAdventureDto[]>(this.apiUrl).subscribe({
      next: (favorites) => {
        this.favoritesSignal.set(favorites);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.notifications.httpError(err, 'favorites.loadError');
        this.loadingSignal.set(false);
      }
    });
  }

  isFavorite(code: string): boolean {
    return this.favoriteCodes().has(code);
  }

  toggle(adventure: GraphicAdventureDto): void {
    const code = adventure.code;
    if (this.pendingCodes.has(code)) {
      return;
    }

    const wasFavorite = this.isFavorite(code);
    if (wasFavorite) {
      this.removeLocally(code);
    } else {
      this.addLocally(adventure);
    }

    this.pendingCodes.add(code);
    const request$: Observable<void> = wasFavorite
      ? this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(code)}`)
      : this.http.put<void>(`${this.apiUrl}/${encodeURIComponent(code)}`, null);

    request$.subscribe({
      next: () => this.pendingCodes.delete(code),
      error: (err) => {
        this.pendingCodes.delete(code);
        if (wasFavorite) {
          this.addLocally(adventure);
        } else {
          this.removeLocally(code);
        }
        this.notifications.httpError(err, 'favorites.toggleError');
      }
    });
  }

  private addLocally(adventure: GraphicAdventureDto): void {
    this.favoritesSignal.update((list) =>
      list.some((a) => a.code === adventure.code) ? list : [...list, adventure]
    );
  }

  private removeLocally(code: string): void {
    this.favoritesSignal.update((list) => list.filter((a) => a.code !== code));
  }
}
