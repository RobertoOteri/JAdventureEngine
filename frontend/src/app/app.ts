import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/ui/toast-container/toast-container.component';
import { ConfirmHostComponent } from './shared/ui/confirm-host/confirm-host.component';

@Component({
  imports: [RouterOutlet, ToastContainerComponent, ConfirmHostComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}
