import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserSerice } from '../services/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JwtService } from '../services/jwt.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private jwtService: JwtService,
    private userSerice: UserSerice
  ) {}

  canActivate(): Observable<boolean> {
    const token = this.jwtService.decodeToken();

    if (!token) {
      this.router.navigate(['/auth']);
      return of(false);
    }

    return this.userSerice.getUserAccount(token.id).pipe(
      map((userResponse) => {
        const user = userResponse?.data?.results?.[0];
        if (user) {
          return true;
        } else {
          this.router.navigate(['/auth']);
          return false;
        }
      }),
      catchError((_) => {
        this.router.navigate(['/auth']);
        return of(false);
      })
    );
  }
}
