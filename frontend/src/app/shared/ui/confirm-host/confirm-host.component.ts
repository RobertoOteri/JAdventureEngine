import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [ConfirmationModalComponent],
  template: `
    @if (confirm.pending(); as request) {
      <app-confirmation-modal
        [title]="request.title ?? ''"
        [message]="request.message ?? ''"
        [confirmText]="request.confirmText ?? ''"
        [cancelText]="request.cancelText ?? ''"
        [isDestructive]="request.destructive ?? true"
        (confirm)="confirm.settle(true)"
        (cancel)="confirm.settle(false)"
      />
    }
  `
})
export class ConfirmHostComponent {
  readonly confirm = inject(ConfirmService);
}
