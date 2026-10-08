import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {
  title = input<string>('Sei sicuro?');
  message = input<string>('Questa operazione non può essere annullata.');
  confirmText = input<string>('Conferma');
  cancelText = input<string>('Annulla');
  isDestructive = input<boolean>(true);

  confirm = output<void>();
  cancel = output<void>();
}
