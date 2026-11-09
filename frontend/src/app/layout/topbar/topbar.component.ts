import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { UserAvatarComponent } from '../../shared/ui/user-avatar/user-avatar.component';
import { LanguageSwitchComponent } from '../../shared/ui/language-switch/language-switch.component';
import { BrandLogoComponent } from '../../shared/ui/brand-logo/brand-logo.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    UserAvatarComponent,
    LanguageSwitchComponent,
    BrandLogoComponent
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly scrolled = input<boolean>(false);

  readonly user = this.userService.currentUser;
  readonly username = computed(() => this.user()?.username ?? this.authService.currentUsername());

  constructor() {
    this.userService.loadCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
