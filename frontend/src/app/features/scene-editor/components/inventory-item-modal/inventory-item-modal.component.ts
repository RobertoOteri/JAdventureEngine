import { Component, OnInit, OnDestroy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

export interface InventoryItemData {
  id?: number | null;
  code: string;
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
export class InventoryItemModalComponent implements OnInit, OnDestroy {
  readonly isStandalone = input<boolean>(false);
  readonly itemId = input<number | null>(null);
  readonly itemCode = input<string>('');
  readonly initialName = input<string>('');
  readonly initialDescription = input<string>('');
  readonly initialUseSceneImage = input<boolean>(true);
  readonly scenePreviewUrl = input<string | null>(null);
  readonly initialCustomFile = input<File | null>(null);
  readonly initialCustomPreviewUrl = input<string | null>(null);

  readonly confirmRequested = output<InventoryItemData>();
  readonly cancelRequested = output<void>();

  name = '';
  code = '';
  description = '';
  useSceneImage = true;
  customFile: File | null = null;
  readonly customPreviewUrl = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  private activeBlobUrl: string | null = null;

  ngOnInit(): void {
    this.name = this.initialName();
    this.code = this.itemCode();
    this.description = this.initialDescription();
    this.useSceneImage = this.isStandalone() ? false : this.initialUseSceneImage();
    this.customFile = this.initialCustomFile();

    if (this.customFile) {
      this.activeBlobUrl = URL.createObjectURL(this.customFile);
      this.customPreviewUrl.set(this.activeBlobUrl);
    } else if (this.initialCustomPreviewUrl()) {
      this.customPreviewUrl.set(this.resolveImageUrl(this.initialCustomPreviewUrl()));
    }
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

  onNameInput(val: string): void {
    this.name = val;
    if (this.isStandalone() && !this.itemId()) {
      this.code = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_');
    }
  }

  onCustomFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files[0]) {
      this.customFile = inputEl.files[0];
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

    const finalCode = (this.isStandalone() ? this.code : this.itemCode()).trim();
    if (!finalCode) {
      this.errorMessage.set("Il codice univoco dell'oggetto inventario è obbligatorio.");
      return;
    }

    this.confirmRequested.emit({
      id: this.itemId(),
      code: finalCode,
      name: this.name.trim(),
      description: this.description.trim(),
      useSceneImage: this.isStandalone() ? false : this.useSceneImage,
      customFile: this.isStandalone() || !this.useSceneImage ? this.customFile : null
    });
  }

  onCancel(): void {
    this.cancelRequested.emit();
  }
}
