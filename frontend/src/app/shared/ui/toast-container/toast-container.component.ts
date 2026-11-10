import { Component, inject } from '@angular/core';
import { NotificationService, ToastType } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

const ICONS: Record<ToastType, string> = {
  success: 'bi-check-circle-fill',
  info: 'bi-info-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  error: 'bi-x-octagon-fill'
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  readonly notifications = inject(NotificationService);

  iconFor(type: ToastType): string {
    return ICONS[type];
  }
}
