import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {
  title = input<string>('');
  message = input<string>('');
  confirmText = input<string>('');
  cancelText = input<string>('');
  isDestructive = input<boolean>(true);

  confirm = output<void>();
  cancel = output<void>();
}
