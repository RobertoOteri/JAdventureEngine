import { Component, OnDestroy, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

export interface InventoryItemData {
  name: string;
  description: string;
  useSceneImage: boolean;
  customFile: File | null;
}

const BACKEND_BASE_URL = environment.apiUrl.replace(/\/api\/?$/, '');

@Component({
  selector: 'app-inventory-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-item-modal.component.html',
  styleUrl: './inventory-item-modal.component.css'
})
export class InventoryItemModalComponent implements OnDestroy {
  // Input
  readonly initialName = input<string>('');
  readonly initialDescription = input<string>('');
  readonly initialUseSceneImage = input<boolean>(true);
  readonly scenePreviewUrl = input<string | null>(null);
  readonly initialCustomFile = input<File | null>(null);

  // Output
  readonly confirmRequested = output<InventoryItemData>();
  readonly cancelRequested = output<void>();

  // Stato form interno
  name = '';
  description = '';
  useSceneImage = true;
  customFile: File | null = null;
  readonly customPreviewUrl = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  private activeBlobUrl: string | null = null;

  constructor() {
    effect(() => {
      this.name = this.initialName();
      this.description = this.initialDescription();
      this.useSceneImage = this.initialUseSceneImage();
      this.customFile = this.initialCustomFile();
      this.errorMessage.set(null);

      this.revokeCurrentBlob();
      if (this.customFile) {
        this.activeBlobUrl = URL.createObjectURL(this.customFile);
        this.customPreviewUrl.set(this.activeBlobUrl);
      } else {
        this.customPreviewUrl.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.revokeCurrentBlob();
  }

  private revokeCurrentBlob(): void {
    if (this.activeBlobUrl) {
      URL.revokeObjectURL(this.activeBlobUrl);
      this.activeBlobUrl = null;
    }
  }

  onCustomFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.customFile = input.files[0];
      this.revokeCurrentBlob();
      this.activeBlobUrl = URL.createObjectURL(this.customFile);
      this.customPreviewUrl.set(this.activeBlobUrl);
    }
  }

  resolveImageUrl(url?: string | null): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `${BACKEND_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  onConfirm(): void {
    if (!this.name.trim()) {
      this.errorMessage.set("Il nome dell'oggetto nell'inventario è obbligatorio.");
      return;
    }

    this.confirmRequested.emit({
      name: this.name.trim(),
      description: this.description.trim(),
      useSceneImage: this.useSceneImage,
      customFile: this.useSceneImage ? null : this.customFile
    });
  }
}
