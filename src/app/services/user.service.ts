import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_AUTH, Token_Res_Type } from './token.service';
import { UserResponse } from '../types/user.type';
import { GetenvService } from './getenv.service';

export type CreatedAccountResponseType = {
  statusCode: number;
  status: string;
};

export type CreatedAccountRequestType = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export type UpdatePasswordDtoType = {
  currentPassword: string;
  newPassword?: string;
};
export type LoginResponseErrorType = {
  error: {
    message: string;
    status: string;
    statusCode: number;
    timeStamp: string;
  };
};
export type CreateAccountResponseErrorType = {
  error: {
    message: string;
    status: string;
    statusCode: number;
    timeStamp: string;
  };
};

export type DeleteApiResponseType = {
  timeStamp: string;
  statusCode: number;
  status: string;
  message: string;
};
@Injectable({
  providedIn: 'root',
})
export class UserSerice {
  constructor(private http: HttpClient, private getenvService: GetenvService) {}

  createAccount(
    data: CreatedAccountRequestType
  ): Observable<CreatedAccountResponseType> {
    return this.http.post<CreatedAccountResponseType>(
      `${this.getenvService.getUserBaseUrl()}`,
      data,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }

  login(data: CreatedAccountRequestType): Observable<Token_Res_Type> {
    const body = new HttpParams()
      .set('username', data.email!)
      .set('password', data.password!);

    const context = new HttpContext().set(SKIP_AUTH, true);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<Token_Res_Type>(
      `${this.getenvService.getUserBaseUrl()}/login`,
      body.toString(),
      { headers, context }
    );
  }

  getUserAccount(userId: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.getenvService.getUserBaseUrl()}/${userId}`
    );
  }

  deleteUserAccount(userId: string): Observable<DeleteApiResponseType> {
    return this.http.delete<DeleteApiResponseType>(
      `${this.getenvService.getUserBaseUrl()}/${userId}`
    );
  }
  updateProfilePicture(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('profile', file);

    return this.http.patch(
      `${this.getenvService.getUserBaseUrl()}/profile`,
      formData,
      {
        responseType: 'blob',
      }
    );
  }
  getProfilePicture(): Observable<Blob> {
    return this.http.get(`${this.getenvService.getUserBaseUrl()}/profile`, {
      responseType: 'blob',
    });
  }

  updateUserAccount(data: CreatedAccountRequestType): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.getenvService.getUserBaseUrl()}`,
      {
        ...data,
      },
      {
        responseType: 'json',
      }
    );
  }

  updateUserPassword(data: UpdatePasswordDtoType): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.getenvService.getUserBaseUrl()}/password`,
      {
        ...data,
      },
      {
        responseType: 'json',
      }
    );
  }
}
