import { Component, input } from '@angular/core';

export type BrandLogoSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  templateUrl: './brand-logo.component.html',
  styleUrl: './brand-logo.component.css',
  host: {
    '[class.size-sm]': "size() === 'sm'",
    '[class.size-lg]': "size() === 'lg'"
  }
})
export class BrandLogoComponent {
  readonly size = input<BrandLogoSize>('md');
}
