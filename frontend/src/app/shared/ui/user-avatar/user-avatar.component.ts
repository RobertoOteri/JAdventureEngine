import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.css'
})
export class UserAvatarComponent {
  readonly src = input<string | null | undefined>(null);
  readonly name = input<string | null | undefined>('');
  readonly size = input<number>(32);

  readonly initial = computed(() => (this.name() || '?').charAt(0).toUpperCase());
}
