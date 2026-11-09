import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, UserAvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

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
