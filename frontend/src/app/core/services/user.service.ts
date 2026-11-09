import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateProfileRequest, UserProfile } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users/me`;

  private readonly userSignal = signal<UserProfile | null>(null);
  readonly currentUser = this.userSignal.asReadonly();

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.userSignal.set(null);
      }
    });
  }

  loadCurrentUser(): void {
    if (this.userSignal() || !this.authService.isAuthenticated()) {
      return;
    }
    this.http.get<UserProfile>(this.apiUrl).subscribe({
      next: (user) => this.userSignal.set(user),
      error: (err) => console.error('Errore caricamento profilo:', err)
    });
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, request).pipe(
      tap((user) => this.userSignal.set(user))
    );
  }

  uploadAvatar(file: File): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<UserProfile>(`${this.apiUrl}/avatar`, formData).pipe(
      tap((user) => this.userSignal.set(user))
    );
  }

  removeAvatar(): Observable<UserProfile> {
    return this.http.delete<UserProfile>(`${this.apiUrl}/avatar`).pipe(
      tap((user) => this.userSignal.set(user))
    );
  }
}
