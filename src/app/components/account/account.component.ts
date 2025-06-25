import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../services/token.service';
import { UserSerice } from '../../services/user.service';
import { User } from '../../types/user.type';
import { CheckRolesDirective } from '../../directives/check-roles.directive';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Type } from '../../types/enums.type';
import { LoggedInUserService } from '../../services/logged-in-user.service';
import { RouterModule } from '@angular/router';
import { JwtService } from '../../services/jwt.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CheckRolesDirective,
    ToastMessageComponent,
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  isShowPassword: boolean = false;
  user: User | null | undefined = undefined;
  editMode = false;
  profileChange: { isChoosingProfile: boolean; file: File | null } = {
    isChoosingProfile: false,
    file: null,
  };
  errOrSuccces: { show: boolean; message: string; type: Type } = {
    show: false,
    message: '',
    type: 'error',
  };
  resetPasswordData = {
    currentPassword: '',
    newPassword: '',
  };
  resetPasswordDataError = {
    show: false,
    currentPassword: '',
    newPassword: '',
    type: 'none',
  };

  constructor(

    private userSerice: UserSerice,
    private loggedInUserService: LoggedInUserService,
    private jwtService:JwtService
  ) {}
  ngOnInit(): void {
 
    let token = this.jwtService.decodeToken();
    if (token) {
      this.userSerice.getUserAccount(token.id).subscribe({
        next: (userData) => {
          this.loggedInUserService.updateUser(userData.data.results[0]);
          if (this.user && this.user.profilePicture) this.getProfilePicture();
        },
        error: (err: HttpErrorResponse) => {
          this.setErrOrSuccess(err.error.message, 'error');
        },
      });
    }
    this.loggedInUserService.user$.subscribe({
      next: (user) => {
        this.user = user;
      },
    });
  }

  toggleEdit() {
    this.editMode = true;
  }

  getProfilePicture() {
    this.userSerice.getProfilePicture().subscribe({
      next: (res) => {
        if (this.user) {
          this.loggedInUserService.updateUser({
            ...this.user,
            profilePicture: this.imageUrl(res),
          });
        }
      },
      error: (err) => {
        this.setErrOrSuccess(err.error.message, 'error');
      },
    });
  }

  onProfilePicChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.profileChange = {
        file,
        isChoosingProfile: true,
      };
    }
  }
  saveChanges() {
    this.editMode = false;
    this.userSerice
      .updateUserAccount({
        firstName: this.user!.firstName,
        lastName: this.user!.lastName,
      })
      .subscribe({
        next: (res) => {
          this.user = {
            ...res.data.results[0],
            profilePicture: '',
          };

          this.setErrOrSuccess(res.message, 'success');
        },
        error: (err: HttpErrorResponse) => {
          if (err.error) {
            this.setErrOrSuccess(err.error.message, 'error');
          } else {
            this.setErrOrSuccess(
              err.status == 403 ? 'forbidden' : 'something went wrong',
              'error'
            );
          }
        },
      });
    // SEND PROFILE
    if (this.profileChange.isChoosingProfile && this.profileChange.file) {
      this.userSerice.updateProfilePicture(this.profileChange.file).subscribe({
        next: (res) => {
          this.user!.profilePicture = this.imageUrl(res);
          this.profileChange = {
            file: null,
            isChoosingProfile: false,
          };
        },
        error: (err: HttpErrorResponse) => {
          this.setErrOrSuccess(err.error.message, 'error');
        },
      });
    }
  }

  private imageUrl(blob: Blob) {
    return URL.createObjectURL(blob);
  }

  cancelEdit() {
    this.editMode = false;
  }

  showPassWord() {
    this.isShowPassword = !this.isShowPassword;
  }

  logout() {
    this.loggedInUserService.clearUser();
  }

  private setErrOrSuccess(message: string, type: Type, time = 5000) {
    this.errOrSuccces = {
      show: true,
      message: message,
      type: type,
    };

    setTimeout(() => {
      this.clearErrOrSuccess();
      this.clearPasswordErrors();
    }, time);
  }
  private clearErrOrSuccess() {
    this.errOrSuccces = {
      show: false,
      message: '',
      type: 'error',
    };
  }

  onDeleteUserAccount() {
     let token = this.jwtService.decodeToken();
      if(token){
        this.userSerice.deleteUserAccount(token.id).subscribe({
         next: (res) => {
        if (
          res.status == 'OK' &&
          res.statusCode === 200 &&
          res.message === 'deleted user'
        ) {
          this.loggedInUserService.clearUser();
          this.setErrOrSuccess('account deleted', 'success');
        }
      },
      error: (err) => {
        if (
          err.error &&
          err.error.message.startsWith('You do not have the permission') &&
          err.error.statusCode === 403
        ) {
          this.setErrOrSuccess(
            'You likely a demo user. Create account to be able to do what you wish.',
            'error'
          );
        } else {
          this.setErrOrSuccess(
            'the was an error deleteing account. Please try again',
            'error'
          );
        }
      },
    });
      }
  }

  updatePasswordForm() {
    this.userSerice.updateUserPassword(this.resetPasswordData).subscribe({
      next: (res) => {
      
        this.setErrOrSuccess('updated password', 'success');
      },
      error: (err) => {
        let error = err.error;
        if (error && error.data) {
          let errData = error.data;
          this.setPasswordErr(
            {
              newPassword: errData.newPassword || '',
              currentPassword: errData.currentPassword || '',
            },
            'error'
          );
        } else if (
          error &&
          error.message === 'Current password does match one you provided'
        ) {
          this.setErrOrSuccess(error.message, 'error');
        } else if (
          error &&
          error.message ===
            'You do not have the permission to do what you are requesting'
        ) {
          this.setErrOrSuccess(error.message, 'error');
        }
      },
    });
  }

  private setPasswordErr(
    {
      newPassword,
      currentPassword,
    }: { newPassword: string; currentPassword: string },
    type: Type,
    time = 5000
  ) {
    this.resetPasswordDataError = {
      show: true,
      newPassword,
      currentPassword,
      type: type,
    };
    setTimeout(() => {
      this.clearPasswordErrors();
    }, time);
  }

  private clearPasswordErrors() {
    this.resetPasswordDataError = {
      show: false,
      newPassword: '',
      currentPassword: '',
      type: 'none',
    };
  }

  // disableAccount() {
  //   console.log('Account disabled');
  // }

  // resetAccount() {
  //   console.log('Account reset');
  // }

  deleteAccount() {
    if (
      confirm(
        'Are you sure you want to permanently delete your account? This cannot be undone.'
      )
    ) {
      this.onDeleteUserAccount();
    }
  }
}
