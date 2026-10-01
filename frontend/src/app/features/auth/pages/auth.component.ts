import {Component, computed, inject, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { AuthRequest } from '../../../core/models/auth.model';
import { ErrorResponse } from '../../../core/models/error-response.model';

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

  private readonly allowedCharRegex = /^[a-zA-Z0-9_.-]$/;

  readonly usernameLen = computed(() => this.username().length);

  readonly invalidChars = computed(() => {
    const val = this.username();
    const badChars = new Set<string>();
    for (const char of val) {
      if (!this.allowedCharRegex.test(char)) {
        badChars.add(char == ' ' ? 'Spazio' : char);
      }
    }
    return Array.from(badChars);
  })

  readonly usernameError = computed(() => {
    const len = this.usernameLen();
    if (len === 0) {
      return null;
    }

    if (this.invalidChars().length > 0) {
      return `Caratteri non validi: ${this.invalidChars().join(', ')}`;
    }

    if (len < 3) {
      return `Minimo 3 caratteri (mancano ${3 - len})`;
    }

    if (len > 50) {
      return `Massimo 50 caratteri (in eccesso: ${len - 50})`;
    }

    return null;
  });

  readonly passwordLen = computed(() => this.password().length);

  readonly passwordError = computed(() => {
    const len = this.passwordLen();
    if (len === 0) {
      return null;
    }
    if (len < 4) {
      return `Minimo 4 caratteri (mancano ${4 - len})`;
    }

    return null;
  });

  readonly isFormInvalid = computed(() => {
    return (
      this.usernameLen() < 3 ||
      this.usernameLen() > 50 ||
      this.invalidChars().length > 0 ||
      this.passwordLen() < 4
    );
  });

  toggleMode(): void {
    this.isLoginMode.update(mode => !mode);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const user = this.username();
    const pass = this.password();

    if (this.isFormInvalid()) {
      this.errorMessage.set(this.usernameError() || this.passwordError() || 'Compila correttamente tutti i campi.');
      return;
    }

    const payload: AuthRequest = {username: user, password: pass};

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
          this.password.set('');
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
    return apiError.message || apiError.error || 'Si è verificato un errore.';
  }
}
