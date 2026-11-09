import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';
import { ErrorResponse } from '../../../core/models/error-response.model';
import { SegmentedControlComponent } from '../../../shared/ui/segmented-control/segmented-control.component';
import { FilterOption } from '../../../shared/ui/filter-select/filter-select.component';
import { AuthShowcaseComponent } from '../components/auth-showcase/auth-showcase.component';

type AuthMode = 'login' | 'register';

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, SegmentedControlComponent, AuthShowcaseComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly mode: AuthMode = inject(ActivatedRoute).snapshot.data['mode'] ?? 'login';
  readonly isLogin = this.mode === 'login';

  readonly modeOptions: FilterOption<AuthMode>[] = [
    { value: 'login', label: 'Accedi' },
    { value: 'register', label: 'Registrati' }
  ];

  readonly showPassword = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly loginForm = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  readonly registerForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(USERNAME_PATTERN)
        ]
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  constructor() {
    const registeredUsername = history.state?.registeredUsername as string | undefined;
    if (this.isLogin && registeredUsername) {
      this.loginForm.controls.identifier.setValue(registeredUsername);
      this.successMessage.set('Account creato. Accedi con la tua password.');
    }
  }

  switchMode(mode: AuthMode): void {
    if (mode !== this.mode) {
      void this.router.navigate(['/', mode]);
    }
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  showError(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  errorFor(control: AbstractControl | null): string {
    const errors = control?.errors;
    if (!errors) {
      return '';
    }
    if (errors['required']) {
      return 'Campo obbligatorio';
    }
    if (errors['email']) {
      return 'Inserisci un indirizzo email valido';
    }
    if (errors['minlength']) {
      return `Almeno ${errors['minlength'].requiredLength} caratteri`;
    }
    if (errors['maxlength']) {
      return `Al massimo ${errors['maxlength'].requiredLength} caratteri`;
    }
    if (errors['pattern']) {
      return 'Solo lettere, numeri e i caratteri _ . -';
    }
    return 'Valore non valido';
  }

  showMismatch(): boolean {
    const confirm = this.registerForm.controls.confirmPassword;
    return this.registerForm.hasError('passwordMismatch') && (confirm.touched || this.submitted());
  }
  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const form = this.isLogin ? this.loginForm : this.registerForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    if (this.isLogin) {
      this.authService.login(this.loginForm.getRawValue()).subscribe({
        next: () => void this.router.navigate(['/adventures']),
        error: (err: HttpErrorResponse) => this.errorMessage.set(this.extractErrorMessage(err))
      });
      return;
    }

    const payload = this.registerPayload();
    this.authService.register(payload).subscribe({
      next: () =>
        void this.router.navigate(['/login'], { state: { registeredUsername: payload.username } }),
      error: (err: HttpErrorResponse) => this.errorMessage.set(this.extractErrorMessage(err))
    });
  }

  private registerPayload(): RegisterRequest {
    const value = this.registerForm.getRawValue();
    return {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      username: value.username.trim(),
      email: value.email.trim(),
      password: value.password
    };
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Impossibile contattare il server. Riprova tra poco.';
    }
    const apiError = err.error as ErrorResponse | null;
    return apiError?.message || 'Si è verificato un errore. Riprova.';
  }
}
