import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as mammoth from 'mammoth';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class FilePreviewComponent implements OnChanges {
  @Input() showModal = false;
  @Input() fileBlob?: Blob;
  @Input() fileName?: string;
  @Input() fileMimeType?: string;
  @Output() closed = new EventEmitter<void>();

  fileType = '';
  fileUrl?: SafeResourceUrl;
  objectUrl?: string;
  textContent?: string;
  docxHtml?: string;

  constructor(private sanitizer: DomSanitizer) {}

  async ngOnChanges(changes: SimpleChanges) {
    const opened = changes['showModal']?.currentValue;
    if (opened && this.fileBlob && this.fileName && this.fileMimeType) {
      await this.previewFile(this.fileBlob, this.fileName, this.fileMimeType);
    }
  }

  async previewFile(blob: Blob, name: string, type: string) {
    this.resetPreviews();
    this.fileType = type;
    if (
      type.startsWith('video/') ||
      type.startsWith('image/') ||
      type === 'application/pdf' ||
      type.startsWith('audio/')
    ) {
      const objectUrl = URL.createObjectURL(blob);
      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      this.objectUrl = objectUrl;
    } else if (
      name.endsWith('.json') ||
      name.endsWith('.xml') ||
      name.endsWith('.csv') ||
      type.startsWith('text/')
    ) {
      const text = await blob.text();
      this.textContent = text;
    } else if (name.endsWith('.docx')) {
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      this.docxHtml = result.value;
    } else {
      this.textContent = 'Unsupported file type.';
    }
  }

  closeModal() {
    this.showModal = false;
    this.resetPreviews();
    this.closed.emit();
  }

  private resetPreviews() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
    this.fileUrl = undefined;
    this.textContent = undefined;
    this.docxHtml = undefined;
    this.fileType = '';
  }
}
