import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../types/user.type'
import { UserSerice } from './user.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { SuccessErrorMessageService } from './success-error-message.service';
import { UpdateDataService } from './update-data.service';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedInUserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(
    private jwtService: JwtService,
    private userSerice: UserSerice,
    private router: Router,
    private successErrorMessageService: SuccessErrorMessageService,
    private updateDataService: UpdateDataService
  ) {
    this.initUser();
  }

  private initUser(): void {
    const token = this.jwtService.decodeToken();
    if (token) {
      this.fetchUserFromApi(token.id);
    }
  }

  updateUser(user: User | null = null): void {
    const token = this.jwtService.decodeToken();
    if (user) {
      this.userSubject.next({ ...user });
    } else if (token) {
      this.fetchUserFromApi(token.id);
    }
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  clearUser(): void {
    this.userSubject.next(null);
    this.jwtService.clearToken();
    this.router.navigate(['/', 'auth']);
    this.updateDataService.emptyTheArrayAndSendEmpty();
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.getValue();
  }

  fetchUserFromApi(userId: string): void {
    this.userSerice.getUserAccount(userId).subscribe({
      next: (userData) => {
        const user = userData.data.results[0];
        if (user) {
          this.userSubject.next({ ...user });
          this.successErrorMessageService.updateMessage({
            message: 'Fetched user successfully',
            type: 'success',
            show: true,
          });
        } else {
          this.userSubject.next(null);
        }
      },
      error: (_) => {
        this.userSubject.next(null);
        this.successErrorMessageService.updateMessage({
          message: 'Error fetching user',
          type: 'error',
          show: true,
        });
      },
    });
  }
}
