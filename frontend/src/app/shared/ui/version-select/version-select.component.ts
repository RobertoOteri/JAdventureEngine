import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GraphicAdventureDto } from '../../../core/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-version-select',
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  templateUrl: './version-select.component.html',
  styleUrl: './version-select.component.css'
})
export class VersionSelectComponent {
  readonly versions = input<GraphicAdventureDto[]>([]);
  readonly selectedId = input<number | null>(null);
  readonly label = input<string>('Versione');

  readonly selectedChange = output<number>();

  readonly latestPublishedId = computed(
    () => this.versions().find((v) => v.status === 'PUBLISHED')?.id ?? null
  );

  onChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!isNaN(value)) {
      this.selectedChange.emit(value);
    }
  }
}
