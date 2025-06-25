import { Component, Input, OnInit } from '@angular/core';
import { FilePreviewComponent } from '../file-preview/file-preview.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { UploadDowloadService } from '../../services/upload-dowload.service';
import { CommonModule } from '@angular/common';
import { FileData } from '../../types/filedata.type';
import { UpdateDataService } from '../../services/update-data.service';
import { FileService } from '../../services/file.service';
import { Clicked } from '../../types/enums.type';
import { UpdateTrashDataService } from '../../services/update-trash-data.service';
import { BytesToKiloBytesPipe } from '../../pipes/bytes-to-kilo-bytes.pipe';
import { ModalComponent } from '../modal/modal.component';
import { ModalType } from '../../types/modal.type';
import { DeleteModalService } from '../../services/delete-modal.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { SearchFileService } from '../../services/search-file.service';
import { FileStatusType } from '../../types/filestatus.type';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    FilePreviewComponent,
    ProgressBarComponent,
    ModalComponent,
    BytesToKiloBytesPipe,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  @Input() clickedSiderBarComponent: Clicked = Clicked.HOME;
  searchText: string = '';
  showModal = false;
  selectedFile?: File;
  previewBlob?: Blob;
  previewName?: string;
  previewType?: string;
  fileStatus: FileStatusType | null = null;
  userfilesDataArray: FileData[] = [];
  userTrashFilesDataArray: FileData[] = [];
  userfilesDataArrayWhileSearchTempStorage: FileData[] = [];
  userTrashFilesDataArrayWhileSearchTempStorage: FileData[] = [];
  modalaData: ModalType = {
    headerText: '',
    questionText: '',
    show: false,
    toDelete: '',
  };

  constructor(
    private updateDataService: UpdateDataService,
    private fileService: FileService,
    private updateTrashDataService: UpdateTrashDataService,
    private deleteModalService: DeleteModalService,
    private searchFileService: SearchFileService,
    private uploadDowloadService: UploadDowloadService
  ) {
    this.updateDataService.init();
  }

  ngOnInit(): void {
    this.updateDataService.fileArrayObserver.subscribe({
      next: (response) => {
        this.userfilesDataArray = response;
        if (this.userfilesDataArrayWhileSearchTempStorage.length == 0) {
          this.userfilesDataArrayWhileSearchTempStorage = [...response];
        }
      },
    });

    this.updateTrashDataService.fileArrayObserver.subscribe({
      next: (response) => {
        this.userTrashFilesDataArray = response;
        if (this.userTrashFilesDataArrayWhileSearchTempStorage.length == 0) {
          this.userTrashFilesDataArrayWhileSearchTempStorage = [...response];
        }
      },
    });
    this.deleteModalService.behaviourObserver.subscribe({
      next: (res) => {
        this.modalaData = res;
      },
    });

    this.searchFileService.subjectOnserver
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe({
        next: (searchText) => {
          if (this.clickedSiderBarComponent == Clicked.HOME) {
            if (
              searchText &&
              searchText != '' &&
              searchText.length != 0 &&
              this.userfilesDataArray.length > 0
            ) {
              this.updateDataService.filterFiles(searchText);
            } else if (
              searchText &&
              searchText != '' &&
              searchText.length != 0 &&
              this.userfilesDataArray.length == 0
            ) {
              this.updateDataService.updateAllDataInArray(
                this.userfilesDataArrayWhileSearchTempStorage
              );
              this.updateDataService.filterFiles(searchText);
            } else {
              this.updateDataService.updateAllDataInArray(
                this.userfilesDataArrayWhileSearchTempStorage
              );
            }
          } else if (this.clickedSiderBarComponent == Clicked.TRASH) {
            if (
              searchText &&
              searchText != '' &&
              searchText.length != 0 &&
              this.userTrashFilesDataArray.length > 0
            ) {
              this.updateTrashDataService.filterFiles(searchText);
            } else if (
              searchText &&
              searchText != '' &&
              searchText.length != 0 &&
              this.userTrashFilesDataArray.length == 0
            ) {
              this.updateTrashDataService.updateAllDataInArray(
                this.userTrashFilesDataArrayWhileSearchTempStorage
              );
              this.updateTrashDataService.filterFiles(searchText);
            } else {
              this.updateTrashDataService.updateAllDataInArray(
                this.userTrashFilesDataArrayWhileSearchTempStorage
              );
            }
          }
        },
      });

    this.uploadDowloadService.observer.subscribe({
      next: (fileStatus) => {
        this.fileStatus = fileStatus;
      },
    });
  }
  onDeleteFilesWhenConfirmIsClicked(show: boolean) {
    if (show && this.modalaData.toDelete === 'all') {
      this.deleteAllFiles();
    } else if (show && this.modalaData.toDelete === 'trash') {
      this.deleteAllFilesFromTrash();
    }
    this.deleteModalService.updateModalType({
      ...this.modalaData,
      show: false,
      toDelete: '',
    });
  }
  openModal() {
    this.showModal = true;
  }

  handleModalClose() {
    this.showModal = false;
  }

  onClickPreview(fileId: string) {
    this.fileService.previewFile(fileId).subscribe({
      next: (response) => {
        this.previewBlob = response.body!;
        this.previewName = response.headers.get('File-Name')!;
        this.previewType = response.headers.get('Content-Type')!;
        this.openModal();
      },
      error: (err) => {},
    });
  }

  onClickDownload(fileId: string) {
    this.uploadDowloadService.onDownloadFiles(fileId);
  }

  onClickAndPutInTrash(fileId: string) {
    this.updateDataService.removeFileById(fileId);
  }
  onShowModalBeforeDelete(toDelete: string) {
    this.deleteModalService.updateModalType(
      (this.modalaData = {
        ...this.modalaData,
        show: true,
        toDelete,
      })
    );
  }
  deleteAllFiles() {
    this.updateDataService.clearFiles();
  }

  deleteAllFilesFromTrash() {
    this.updateTrashDataService.clearFiles();
  }
  onClickPermanentlyDeleteFile(fileId: string) {
    this.updateTrashDataService.removeFileById(fileId);
  }
  onClickRestoreFile(fileId: string) {
    this.updateTrashDataService.restoreFileFromTrash(fileId);
  }
}
