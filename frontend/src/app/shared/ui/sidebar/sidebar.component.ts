import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = this.authService.currentUsername;
  readonly initial = computed(() => (this.username() ?? '?').charAt(0).toUpperCase());

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
