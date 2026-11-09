import { Component, input, output, signal, effect, viewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslatePipe],
  templateUrl: './file-dropzone.component.html',
  styleUrl: './file-dropzone.component.css'
})
export class FileDropzoneComponent {

  private readonly i18n = inject(TranslationService);

  readonly label = input<string | undefined>(undefined);
  readonly dropTitle = input<string | undefined>(undefined);
  readonly dropSubtitle = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);

  readonly accept = input<string>('image/*');
  readonly maxSizeBytes = input<number>(5 * 1024 * 1024);

  readonly initialUrl = input<string | null>(null);

  readonly fileChange = output<File | null>();

  readonly isDragging = signal<boolean>(false);
  readonly previewUrl = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  private readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

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
      this.error.set(this.i18n.t('fileDropzone.invalidFormat'));
      return;
    }

    if (file.size > this.maxSizeBytes()) {
      this.error.set(this.i18n.t('fileDropzone.tooLarge'));
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
    const inputEl = this.fileInputRef()?.nativeElement;
    if (inputEl) {
      inputEl.value = '';
    }
    this.fileChange.emit(null);
  }
}
