import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetenvService } from './getenv.service';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
export type Tokens_Type = {
  access_token: string;
  refresh_token: string;
};
export type Token_Res_Type = {
  data: Tokens_Type;
  message: string;
  status: string;
  statusCode: number;
};
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private http: HttpClient, private getenvService: GetenvService) {}
  setToken(tokens: Token_Res_Type): void {
    localStorage.setItem(
      this.getenvService.getKeyForToken(),
      JSON.stringify(tokens)
    );
  }

  getToken(): Token_Res_Type | null {
    let data = localStorage.getItem(this.getenvService.getKeyForToken());

    return data ? JSON.parse(data) : null;
  }

  removeToken(): void {
    localStorage.removeItem(this.getenvService.getKeyForToken());
  }

  refreshToken(refresh_token: string): Observable<Token_Res_Type> {
    const headers = { Authorization: `Bearer ${refresh_token}` };
    const context = new HttpContext().set(SKIP_AUTH, true);
    return this.http.get<Token_Res_Type>(
      this.getenvService.getUserBaseUrl() + '/refresh/token',
      { headers, context }
    );
  }
}
