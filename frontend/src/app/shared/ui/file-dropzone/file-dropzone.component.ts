import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-dropzone.component.html',
  styleUrl: './file-dropzone.component.css'
})
export class FileDropzoneComponent {
  readonly label = input<string>('Immagine');
  readonly dropTitle = input<string>("Trascina un'immagine qui");
  readonly dropSubtitle = input<string>('oppure clicca per sfogliare');
  readonly hint = input<string>('Formati supportati: PNG, JPG, WEBP (Max 5MB)');

  readonly accept = input<string>('image/*');
  readonly maxSizeBytes = input<number>(5 * 1024 * 1024); // 5MB

  readonly initialUrl = input<string | null>(null);

  readonly fileChange = output<File | null>();

  readonly isDragging = signal<boolean>(false);
  readonly previewUrl = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const initial = this.initialUrl();
      if (initial) {
        this.previewUrl.set(initial);
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.processFile(target.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error.set('Seleziona un formato immagine valido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > this.maxSizeBytes()) {
      this.error.set('Il file supera la dimensione massima consentita.');
      return;
    }

    this.error.set(null);
    this.fileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
      this.fileChange.emit(file);
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.previewUrl.set(null);
    this.fileName.set(null);
    this.error.set(null);
    this.fileChange.emit(null);
  }
}
