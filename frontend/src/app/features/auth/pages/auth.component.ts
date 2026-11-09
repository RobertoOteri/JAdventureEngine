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
import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationKey } from '../../../core/i18n/i18n.types';
import { httpErrorMessage } from '../../../core/utils/http-error.util';
import { SegmentedControlComponent } from '../../../shared/ui/segmented-control/segmented-control.component';
import { FilterOption } from '../../../shared/ui/filter-select/filter-select.component';
import { LanguageSwitchComponent } from '../../../shared/ui/language-switch/language-switch.component';
import { AuthShowcaseComponent } from '../components/auth-showcase/auth-showcase.component';
import { BrandLogoComponent } from '../../../shared/ui/brand-logo/brand-logo.component';

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
  imports: [
    ReactiveFormsModule,
    SegmentedControlComponent,
    AuthShowcaseComponent,
    LanguageSwitchComponent,
    TranslatePipe,
    BrandLogoComponent
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly i18n = inject(TranslationService);

  readonly mode: AuthMode = inject(ActivatedRoute).snapshot.data['mode'] ?? 'login';
  readonly isLogin = this.mode === 'login';

  readonly modeOptions: FilterOption<AuthMode>[] = [
    { value: 'login', labelKey: 'auth.modeLogin' },
    { value: 'register', labelKey: 'auth.modeRegister' }
  ];

  readonly showPassword = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<TranslationKey | null>(null);

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
      this.successMessage.set('auth.registered');
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
      return this.i18n.t('formErrors.required');
    }
    if (errors['email']) {
      return this.i18n.t('formErrors.email');
    }
    if (errors['minlength']) {
      return this.i18n.t('formErrors.minLength', { n: errors['minlength'].requiredLength });
    }
    if (errors['maxlength']) {
      return this.i18n.t('formErrors.maxLength', { n: errors['maxlength'].requiredLength });
    }
    if (errors['pattern']) {
      return this.i18n.t('formErrors.usernamePattern');
    }
    return this.i18n.t('common.invalidValue');
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
        error: (err: HttpErrorResponse) => this.errorMessage.set(httpErrorMessage(err, this.i18n))
      });
      return;
    }

    const payload = this.registerPayload();
    this.authService.register(payload).subscribe({
      next: () =>
        void this.router.navigate(['/login'], { state: { registeredUsername: payload.username } }),
      error: (err: HttpErrorResponse) => this.errorMessage.set(httpErrorMessage(err, this.i18n))
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
}
