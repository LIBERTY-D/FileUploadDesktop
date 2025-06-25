import { Injectable } from '@angular/core';
import { FileData } from '../types/filedata.type';
import { BehaviorSubject, map } from 'rxjs';
import { FileService } from './file.service';
import { UpdateDataService } from './update-data.service';
import { SuccessErrorMessageService } from './success-error-message.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateTrashDataService {
  userFilesTrashArray: FileData[] = [];

  private fileArraySubject = new BehaviorSubject<FileData[]>([]);

  readonly fileArrayObserver = this.fileArraySubject.asObservable();

  constructor(
    private fileService: FileService,
    private updateDataService: UpdateDataService,
    private successErrorMessageService: SuccessErrorMessageService
  ) {}

  updateDataInArray(fileData: FileData): void {
    this.userFilesTrashArray.unshift(fileData);
    this.fileArraySubject.next([...this.userFilesTrashArray]);
  }

  removeFileById(fileId: string): void {
    this.userFilesTrashArray = this.userFilesTrashArray.filter(
      (file) => file.fileId !== fileId
    );
    this.fileArraySubject.next([...this.userFilesTrashArray]);
    this.fileService.deleteFileById(fileId).subscribe({
      next: (response) => {
        this.successErrorMessageService.updateMessage({
          message: response.message,
          type: 'success',
          show: true,
        });
      },
      error: (err) => {
        console.log(err);
        this.successErrorMessageService.updateMessage({
          message: err.message,
          type: 'error',
          show: true,
        });
      },
    });
  }

  filterFiles(searchText: string) {
    this.userFilesTrashArray = this.userFilesTrashArray.filter((file) =>
      file.fileName.toLowerCase().startsWith(searchText.trim().toLowerCase())
    );
    this.fileArraySubject.next([...this.userFilesTrashArray]);
  }
  updateAllDataInArray(filesData: FileData[]): void {
    this.userFilesTrashArray = filesData;
    this.fileArraySubject.next([...this.userFilesTrashArray]);
  }
  clearFiles(): void {
    this.userFilesTrashArray = [];
    this.fileArraySubject.next([]);
    this.fileService.deleteAllFileMarkedForDelete().subscribe({
      next: (response) => {
        console.log(response);
        this.successErrorMessageService.updateMessage({
          message: response.message,
          type: 'success',
          show: true,
        });
      },
      error: (err) => {
        console.log(err);
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
      .getFilesMarkedForDelete()
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
          this.userFilesTrashArray = results;
          this.fileArraySubject.next([...this.userFilesTrashArray]);
        },
        error: (err) => {
          this.successErrorMessageService.updateMessage({
            message: err.message,
            type: 'error',
            show: true,
          });
          console.error(err);
        },
      });
  }

  restoreFileFromTrash(fileId: string) {
    this.fileService.restoreFileFromTrash(fileId).subscribe({
      next: (response) => {
        let fileData: FileData = response.data.results[0];
        this.userFilesTrashArray = this.userFilesTrashArray.filter(
          (file) => file.fileId !== fileData.fileId
        );
        this.fileArraySubject.next([...this.userFilesTrashArray]);
        this.updateDataService.updateDataInArray(fileData);

        this.successErrorMessageService.updateMessage({
          message: response.message,
          type: 'success',
          show: true,
        });
      },
      error: (err) => {
        console.log(err);
        this.successErrorMessageService.updateMessage({
          message: err.message,
          type: 'error',
          show: true,
        });
      },
    });
  }
}
