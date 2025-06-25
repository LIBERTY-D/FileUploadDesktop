import {
  HttpClient,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, FileData } from '../types/filedata.type';
import { ResponseTypeForDelete } from '../types/deletefile.type';
import { GetenvService } from './getenv.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Angular service to handle file upload, download, preview, and retrieval operations.
 * Communicates with the backend API for file-related tasks.
 */
export class FileService {
  constructor(private http: HttpClient, private getenvService: GetenvService) {}

  /**
   * Uploads a file to the server.
   *
   * @param {FormData} formData - The form data containing the file to be uploaded.
   * @returns {Observable<HttpEvent<ApiResponse>>} An observable emitting HTTP events for the upload request.
   */
  upload(formData: FormData): Observable<HttpEvent<ApiResponse>> {
    return this.http.post<ApiResponse>(
      `${this.getenvService.getFileBaseUrl()}/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  /**
   * Downloads a file from the server using its ID.
   *
   * @param {string} fileId - The unique identifier of the file to download.
   * @returns {Observable<HttpEvent<Blob>>} An observable emitting HTTP events for the download request.
   */
  download(fileId: string): Observable<HttpEvent<Blob>> {
    return this.http.get(
      `${this.getenvService.getFileBaseUrl()}/download/${fileId}`,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }

  /**
   * Fetches a preview of the file from the server.
   *
   * @param {string} fileId - The ID of the file to preview.
   * @returns {Observable<HttpResponse<Blob>>} An observable with the full HTTP response containing the file blob.
   */
  previewFile(fileId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.getenvService.getFileBaseUrl()}/preview/${fileId}`,
      {
        responseType: 'blob',
        observe: 'response',
      }
    );
  }

  /**
   * Retrieves all user files from the server.
   *
   * @returns {Observable<ApiResponse>} An observable containing the server's API response with all user files.
   */
  getFiles(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.getenvService.getFileBaseUrl()}`);
  }

  /**
   * Retrieves all user files from the server.
   * The files which are not deleted
   * @returns {Observable<ApiResponse>} An observable containing the server's API response with all user files.
   */
  getFilesNotMarkedForDelete(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.getenvService.getFileBaseUrl()}/all`
    );
  }
  /**
   * Retrieves all user files from the server.
   * The files which are  deleted
   * @returns {Observable<ApiResponse>} An observable containing the server's API response with all user files.
   */
  getFilesMarkedForDelete(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.getenvService.getFileBaseUrl()}/trash`
    );
  }

  /**
   * responsible for flagging the file to be marked for delete.
   * @param {string} filedId the ID of the file.
   * @returns  {Observable<ApiResponse>} - returns the file API response of the file to be deleted
   */
  markFileTOBeFlaggedForDelete(filedId: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.getenvService.getFileBaseUrl()}/${filedId}`,
      {},
      {
        responseType: 'json',
      }
    );
  }
  /**
   * Sends a PATCH request to restore a file from trash.
   *
   * @param {string} fileId - The ID of the file to restore.
   * @returns {Observable<ApiResponse>} Observable of the API response.
   */

  restoreFileFromTrash(fileId: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.getenvService.getFileBaseUrl()}/restore/${fileId}`,
      {},
      {
        responseType: 'json',
      }
    );
  }
  /**
   * delete files recently deleted or in the trash.
   * @returns {Observable<ResponseTypeForDelete>}
   */
  deleteAllFileMarkedForDelete(): Observable<ResponseTypeForDelete> {
    return this.http.delete<ResponseTypeForDelete>(
      `${this.getenvService.getFileBaseUrl()}/trash`,
      {
        responseType: 'json',
      }
    );
  }

  /**
   * Deletes a file permanently by its ID from the server.
   *
   * @param {string} fileId - The ID of the file to delete.
   * @returns {Observable<ResponseTypeForDelete>} An observable of the HTTP response.
   */
  deleteFileById(fileId: string): Observable<ResponseTypeForDelete> {
    return this.http.delete<ResponseTypeForDelete>(
      `${this.getenvService.getFileBaseUrl()}/${fileId}`,
      { responseType: 'json' }
    );
  }

  deleteAllFileNotMarkedForDelete(): Observable<ResponseTypeForDelete> {
    return this.http.delete<ResponseTypeForDelete>(
      `${this.getenvService.getFileBaseUrl()}/all`,
      {
        responseType: 'json',
      }
    );
  }

  /**
   * Retrieves a single user file by its ID.
   *
   * @param {string} fileId - The ID of the file to retrieve.
   * @returns {Observable<ApiResponse>} An observable containing the API response for the specific file.
   */
  getFileById(fileId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.getenvService.getFileBaseUrl()}/${fileId}`
    );
  }
}
