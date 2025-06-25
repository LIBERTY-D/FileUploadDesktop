import { Injectable, OnInit } from '@angular/core';
import { FileData } from '../types/filedata.type';
import { BehaviorSubject, map } from 'rxjs';
import { FileService } from './file.service';
import { SuccessErrorMessageService } from './success-error-message.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UpdateDataService {
  userfilesDataArray: FileData[] = [];

  private fileArraySubject = new BehaviorSubject<FileData[]>([]);

  readonly fileArrayObserver = this.fileArraySubject.asObservable();

  constructor(
    private fileService: FileService,
    private successErrorMessageService: SuccessErrorMessageService
  ) {}

  updateDataInArray(fileData: FileData): void {
    this.userfilesDataArray.unshift(fileData);
    this.fileArraySubject.next([...this.userfilesDataArray]);
  }

  updateAllDataInArray(filesData: FileData[]): void {
    this.userfilesDataArray = filesData;
    this.fileArraySubject.next([...this.userfilesDataArray]);
  }

  removeFileById(fileId: string): void {
    this.userfilesDataArray = this.userfilesDataArray.filter(
      (file) => file.fileId !== fileId
    );
    this.fileArraySubject.next([...this.userfilesDataArray]);
    this.fileService.markFileTOBeFlaggedForDelete(fileId).subscribe({
      next: (response) => {
        this.successErrorMessageService.updateMessage({
          message: response.message,
          type: 'success',
          show: true,
        });
      },
      error: (err) => {
        this.successErrorMessageService.updateMessage({
          message: err.message,
          type: 'error',
          show: true,
        });
      },
    });
  }

  filterFiles(searchText: string) {
    this.userfilesDataArray = this.userfilesDataArray.filter((file) =>
      file.fileName.toLowerCase().startsWith(searchText.trim().toLowerCase())
    );
    this.fileArraySubject.next([...this.userfilesDataArray]);
  }

  clearFiles(): void {
    this.emptyTheArrayAndSendEmpty();
    this.fileService.deleteAllFileNotMarkedForDelete().subscribe({
      next: (response) => {
        this.successErrorMessageService.updateMessage({
          message: response.message,
          type: 'success',
          show: true,
        });
      },
      error: (err) => {
        this.successErrorMessageService.updateMessage({
          message: err.message,
          type: 'error',
          show: true,
        });
      },
    });
  }

  init(): void {
    this.fileService
      .getFilesNotMarkedForDelete()
      .pipe(
        map((val) => {
          this.successErrorMessageService.updateMessage({
            message: val.message,
            type: 'success',
            show: true,
          });
          return val.data.results.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        })
      )
      .subscribe({
        next: (results) => {
          this.userfilesDataArray = results;
          this.fileArraySubject.next([...this.userfilesDataArray]);
        },
        error: (err: HttpErrorResponse) => {
          this.successErrorMessageService.updateMessage({
            message: err.message,
            type: 'error',
            show: true,
          });
        },
      });
  }

  emptyTheArrayAndSendEmpty() {
    this.userfilesDataArray = [];
    this.fileArraySubject.next([]);
  }
}
