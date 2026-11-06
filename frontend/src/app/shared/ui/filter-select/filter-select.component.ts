import { Component, input, model } from '@angular/core';

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-filter-select',
  standalone: true,
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.css'
})
export class FilterSelectComponent<T extends string = string> {
  readonly label = input<string>('');
  readonly icon = input<string>('');
  readonly options = input<FilterOption<T>[]>([]);
  readonly value = model.required<T>();

  onChange(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value as T);
  }
}
