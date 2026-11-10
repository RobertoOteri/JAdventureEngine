import { Component, computed, input } from '@angular/core';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

const ICONS: Record<AlertType, string> = {
  error: 'bi-exclamation-octagon-fill',
  success: 'bi-check-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill'
};

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  type = input<AlertType>('error');
  compact = input<boolean>(false);

  readonly icon = computed(() => ICONS[this.type()]);
}
