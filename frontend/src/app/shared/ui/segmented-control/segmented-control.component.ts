import { Component, input, model } from '@angular/core';
import { FilterOption } from '../filter-select/filter-select.component';

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.css'
})
export class SegmentedControlComponent<T extends string = string> {
  readonly options = input<FilterOption<T>[]>([]);
  readonly value = model.required<T>();
  readonly ariaLabel = input<string>('');
  readonly fullWidth = input<boolean>(false);
  readonly compact = input<boolean>(false);

  select(value: T): void {
    this.value.set(value);
  }
}
