import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { UserSerice } from '../services/user.service';
import { catchError, map, Observable, of } from 'rxjs';
import { JwtService } from '../services/jwt.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private jwtService: JwtService,
    private userSerice: UserSerice
  ) {}

  canActivate(): Observable<boolean> {
    const token = this.jwtService.decodeToken();

    if (!token) {
      return of(true);
    }
    return this.userSerice.getUserAccount(token.id).pipe(
      map((userResponse) => {
        const user = userResponse?.data?.results?.[0];
        if (user) {
          this.router.navigate(['/']);
          return false;
        } else {
          return true;
        }
      }),
      catchError((_) => {
        return of(true);
      })
    );
  }
}
