import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly authEndpoint = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'jadventure_token';
  private readonly USER_KEY = 'jadventure_user';

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private readonly usernameSignal = signal<string | null>(localStorage.getItem(this.USER_KEY));
  private readonly loadingSignal = signal<boolean>(false);

  readonly isAuthenticated: Signal<boolean> = computed(() => !!this.tokenSignal());
  readonly currentUsername: Signal<string | null> = this.usernameSignal.asReadonly();
  readonly isLoading: Signal<boolean> = this.loadingSignal.asReadonly();

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.authenticate(`${this.authEndpoint}/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.authenticate(`${this.authEndpoint}/register`, request);
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

  private authenticate(url: string, body: LoginRequest | RegisterRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<AuthResponse>(url, body).pipe(
      tap((response) => this.persistSession(response)),
      finalize(() => this.loadingSignal.set(false))
    );
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
