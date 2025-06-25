import { Injectable, NgZone } from '@angular/core';
import { ApiResponse } from '../types/filedata.type';
import { FileService } from './file.service';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { saveAs } from 'file-saver';
import { FileStatusType } from '../types/filestatus.type';
import { UpdateDataService } from './update-data.service';
import { SuccessErrorMessageService } from './success-error-message.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadDowloadService {
  private fileStatus: FileStatusType = {
    status: 'done',
    requestType: '',
    percent: 0,
    show: false,
  };

  private subject = new BehaviorSubject<FileStatusType>({ ...this.fileStatus });
  public observer: Observable<FileStatusType> = this.subject.asObservable();

  constructor(
    private fileService: FileService,
    private updateDataService: UpdateDataService,
    private successErrorMessageService: SuccessErrorMessageService,
    private ngZone: NgZone
  ) {}

  onUploadFiles(files: File[]): void {
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file, file.name);
    }

    this.fileService.upload(formData).subscribe({
      next: (event) => this.reportProgress(event),
      error: (err: HttpErrorResponse) => {
        this.successErrorMessageService.updateMessage({
          message: err.error.message,
          show: true,
          type: 'error',
        });
        this.resetProgress();
      },
    });
  }

  onDownloadFiles(fileId: string): void {
    this.fileService.download(fileId).subscribe({
      next: (event) => this.reportProgress(event),
      error: (err: HttpErrorResponse) => {
        this.successErrorMessageService.updateMessage({
          message: err.statusText,
          show: true,
          type: 'error',
        });
        this.resetProgress();
      },
    });
  }

  private reportProgress(httpEvent: HttpEvent<ApiResponse | Blob>) {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateProgress(httpEvent.loaded, httpEvent.total!, 'Uploading');
        break;

      case HttpEventType.DownloadProgress:
        this.updateProgress(httpEvent.loaded, httpEvent.total!, 'Downloading');
        break;

      case HttpEventType.Response:
        if (httpEvent.body instanceof Blob) {
          const fileName = httpEvent.headers.get('File-Name')!;
          const contentType = httpEvent.headers.get('Content-Type') || '';
          const file = new File([httpEvent.body], fileName, {
            type: `${contentType};charset=utf-8`,
          });
          saveAs(file);
        } else if (typeof httpEvent.body === 'object') {
          const filesRes = (httpEvent.body as ApiResponse).data.results;
          for (let file of filesRes) {
            this.updateDataService.updateDataInArray(file);
          }
        }

        setTimeout(() => this.resetProgress(), 500);
        break;
    }
  }

  private updateProgress(loaded: number, total: number, requestType: string) {
    const percent = Math.round((loaded / total) * 100);
    this.emitProgress({
      status: 'progress',
      requestType,
      percent,
      show: true,
    });
  }

  private resetProgress() {
    this.ngZone.run(() => {
      this.emitProgress({
        status: 'done',
        requestType: '',
        percent: 0,
        show: false,
      });
    });
  }

  private emitProgress(status: FileStatusType) {
    this.subject.next({ ...status });
  }
}
