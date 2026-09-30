import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { AuthRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly authEndpoint = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'jadventure_token';
  private readonly USER_KEY = 'jadventure_user';

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private readonly usernameSignal = signal<string | null>(localStorage.getItem(this.USER_KEY));
  private readonly loadingSignal = signal<boolean>(false);

  readonly isAuthenticated: Signal<boolean> = computed(() => !!this.tokenSignal());
  readonly currentUsername: Signal<string | null> = this.usernameSignal.asReadonly();
  readonly isLoading: Signal<boolean> = this.loadingSignal.asReadonly();

  login(credentials: AuthRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.authEndpoint}/login`, credentials).pipe(
      tap((response) => this.persistSession(response)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  register(credentials: AuthRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.authEndpoint}/register`, credentials).pipe(
      tap((response) => this.persistSession(response)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.usernameSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private persistSession(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, response.username);
      this.tokenSignal.set(response.token);
      this.usernameSignal.set(response.username);
    }
  }
}
