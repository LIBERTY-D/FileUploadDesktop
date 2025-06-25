import { Injectable } from '@angular/core';
import * as jwtDecode from 'jwt-decode';
import { TokenService } from './token.service';

export interface DecodedToken {
  sub: string;
  id: string;
  email?: string;
  exp?: number;
  iat?: number;
  roles?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private tokenService: TokenService) {}

  getToken(): string | undefined {
    return this.tokenService.getToken()?.data.access_token;
  }

  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode.jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.sub ?? null;
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded?.exp) return true;

    const now = Date.now() / 1000;
    return decoded.exp < now;
  }

  clearToken(): void {
    this.tokenService.removeToken();
  }
}
