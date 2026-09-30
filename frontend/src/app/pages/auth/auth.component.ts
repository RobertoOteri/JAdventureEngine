import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AuthRequest } from '../../core/models/auth.model';
import { ErrorResponse } from '../../core/models/error-response.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoginMode = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  username = signal<string>('');
  password = signal<string>('');

  toggleMode(): void {
    this.isLoginMode.update(mode => !mode);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const user = this.username().trim();
    const pass = this.password().trim();

    if (!user || !pass) {
      this.errorMessage.set('Inserisci sia username che password.');
      return;
    }

    const payload: AuthRequest = { username: user, password: pass };

    if (this.isLoginMode()) {
      this.authService.login(payload).subscribe({
        next: (res) => {
          this.successMessage.set(`Bentornato, ${res.username}! Accesso eseguito.`);
          setTimeout(() => {
            this.router.navigate(['/adventures']);
          }, 1000);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(err) || 'Credenziali non valide.');
        }
      });
    } else {
      this.authService.register(payload).subscribe({
        next: () => {
          this.successMessage.set('Account creato con successo! Ora puoi accedere.');
          this.isLoginMode.set(true);
          this.password.set(''); // Svuota la password per sicurezza
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(err) || 'Impossibile completare la registrazione.');
        }
      });
    }
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (!err?.error) return err.statusText || 'Errore di connessione col server.';

    const apiError = err.error as ErrorResponse;
    if (apiError.validationErrors) {
      return Object.values(apiError.validationErrors).join(' - ');
    }
    return apiError.message || apiError.error || 'Si è verificato un errore.';
  }
}
