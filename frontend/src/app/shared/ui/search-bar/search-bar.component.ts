import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  readonly value = model<string>('');
  readonly placeholder = input<string>('Cerca…');

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  clear(): void {
    this.value.set('');
  }
}
