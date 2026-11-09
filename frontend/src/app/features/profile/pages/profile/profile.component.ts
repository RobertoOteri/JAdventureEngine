import { Component, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../../core/services/user.service';
import { httpErrorMessage } from '../../../../core/utils/http-error.util';
import { UserAvatarComponent } from '../../../../shared/ui/user-avatar/user-avatar.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, UserAvatarComponent, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder).nonNullable;

  private readonly i18n = inject(TranslationService);

  readonly user = this.userService.currentUser;

  readonly avatarError = signal<string | null>(null);
  readonly profileError = signal<string | null>(null);

  readonly avatarSaving = signal(false);
  readonly profileSaving = signal(false);

  readonly profileForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    bio: ['', Validators.maxLength(500)]
  });

  constructor() {
    this.userService.loadCurrentUser();

    effect(() => {
      const user = this.user();
      if (user && this.profileForm.pristine) {
        this.profileForm.setValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          bio: user.bio ?? ''
        });
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    if (!AVATAR_TYPES.includes(file.type)) {
      this.avatarError.set(this.i18n.t('profile.avatarInvalidType'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      this.avatarError.set(this.i18n.t('profile.avatarTooLarge'));
      return;
    }

    this.avatarSaving.set(true);
    this.avatarError.set(null);
    this.userService.uploadAvatar(file).subscribe({
      next: () => this.avatarSaving.set(false),
      error: (err: HttpErrorResponse) => {
        this.avatarSaving.set(false);
        this.avatarError.set(httpErrorMessage(err, this.i18n));
      }
    });
  }

  removeAvatar(): void {
    this.avatarSaving.set(true);
    this.avatarError.set(null);
    this.userService.removeAvatar().subscribe({
      next: () => this.avatarSaving.set(false),
      error: (err: HttpErrorResponse) => {
        this.avatarSaving.set(false);
        this.avatarError.set(httpErrorMessage(err, this.i18n));
      }
    });
  }

  saveProfile(): void {
    this.profileError.set(null);
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    this.profileSaving.set(true);
    this.userService
      .updateProfile({
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.trim(),
        bio: value.bio.trim()
      })
      .subscribe({
        next: () => {
          this.profileSaving.set(false);
          this.profileForm.markAsPristine();
        },
        error: (err: HttpErrorResponse) => {
          this.profileSaving.set(false);
          this.profileError.set(httpErrorMessage(err, this.i18n));
        }
      });
  }

  resetForm(): void {
    const user = this.user();
    if (!user) {
      return;
    }
    this.profileError.set(null);
    this.profileForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio ?? ''
    });
  }

  showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  errorFor(control: AbstractControl): string {
    const errors = control.errors;
    if (!errors) {
      return '';
    }
    if (errors['required']) {
      return this.i18n.t('formErrors.required');
    }
    if (errors['email']) {
      return this.i18n.t('formErrors.email');
    }
    if (errors['maxlength']) {
      return this.i18n.t('formErrors.maxLength', { n: errors['maxlength'].requiredLength });
    }
    return this.i18n.t('common.invalidValue');
  }
}
