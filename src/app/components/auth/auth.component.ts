import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { passwordMatchValidator } from '../../validators/passwordMatch.validator';
import {
  CreatedAccountResponseType,
  LoginResponseErrorType,
  UserSerice,
} from '../../services/user.service';
import { Token_Res_Type, TokenService } from '../../services/token.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Type } from '../../types/enums.type';
import { LoggedInUserService } from '../../services/logged-in-user.service';
import { StatusObjectType } from '../../types/statusobject.type';
import { JwtService } from '../../services/jwt.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastMessageComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  myForm!: FormGroup;
  isLoginMode = true;

  errOrSuccces: StatusObjectType = {
    show: false,
    message: '',
    type: 'error',
  };

  constructor(
    private userSerice: UserSerice,
    private jwtService: JwtService,
    private tokenService:TokenService,
    private router: Router,
    private loggedInUserService: LoggedInUserService
  ) {}

  ngOnInit(): void {
    this.myForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.email, Validators.required]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: passwordMatchValidator() }
    );
  }
  submitFormData() {
    const getVal = (field: string) => this.getField(field)?.value;
    const email = getVal('email');
    const password = getVal('password');

    if (this.isLoginMode) {
      this.userSerice.login({ email, password }).subscribe({
        next: (res: Token_Res_Type) => {
          this.tokenService.setToken(res);
          if (res.statusCode == 200 && res.status === 'OK') {
            Promise.resolve().then(() => {
              let token = this.jwtService.decodeToken();
              if (token) {
                this.fetchUserAccount(token.id, res);
              }
            });
          }
        },
        error: (err: LoginResponseErrorType) => {
          if (err.error) {
            this.setErrOrSuccess(err.error.message, 'error');
          }
        },
      });
    } else {
      const name = getVal('name');
      const surname = getVal('surname');
      this.userSerice
        .createAccount({ email, password, firstName: name, lastName: surname })
        .subscribe({
          next: (res: CreatedAccountResponseType) => {
            if (res.statusCode == 201 && res.status === 'CREATED')
              this.setErrOrSuccess(
                'account created. Please verify in your email',
                'success',
                5000,
                true
              );
          },
          error: (err: HttpErrorResponse) => {
            if (err.error) {
              if (
                err.error.statusCode == 400 &&
                err.error.status === 'BAD_REQUEST' &&
                err.error.message === 'CREATING ACCOUNT ERROR' &&
                err.error.data.error
              )
                this.setErrOrSuccess(err.error.data.message, 'error');
            } else {
              this.setErrOrSuccess('Failed to Create Account', 'error');
            }
          },
        });
    }
  }
  loginDemoAccountUser() {
    this.userSerice
      .login({ email: 'john.doe@example.com', password: 'password123' })
      .subscribe({
        next: (res: Token_Res_Type) => {
          if (res.statusCode == 200 && res.status === 'OK')
            this.tokenService.setToken(res)
            Promise.resolve().then(() => {
              let token = this.jwtService.decodeToken();
              if (token) {
                this.fetchUserAccount(token.id, res);
              }
            });
        },
        error: (err: LoginResponseErrorType) => {
          if (err.error) {
            this.setErrOrSuccess(err.error.message, 'error');
          }
        },
      });
  }
  private setErrOrSuccess(
    message: string,
    type: Type,
    time = 5000,
    creatingAccount = false
  ) {
    this.errOrSuccces = {
      show: true,
      message: message,
      type: type,
    };

    setTimeout(() => {
      if (creatingAccount) {
        window.location.reload();
      }
      this.clearErrOrSuccess();
    }, time);
  }
  private clearErrOrSuccess() {
    this.errOrSuccces = {
      show: false,
      message: '',
      type: 'error',
    };
  }

  isFormValid(): boolean {
    const email = this.getField('email');
    const password = this.getField('password');

    if (this.isLoginMode) {
      return (email?.valid && password?.valid)!;
    }

    const name = this.getField('name');
    const surname = this.getField('surname');
    const confirmPassword = this.getField('confirmPassword');

    return (name?.valid &&
      surname?.valid &&
      email?.valid &&
      password?.valid &&
      confirmPassword?.valid &&
      !this.myForm.errors?.['passwordMismatch'])!;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
  validateField(field: string): boolean {
    const control = this.getField(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
  isNotEmail(field: string): boolean {
    const control = this.getField(field)!;
    return !!control.errors?.['email'];
  }

  private getField(field: string) {
    return this.myForm.get(field);
  }

  hasError(field: string, errorType?: string): boolean {
    const control = this.getField(field);
    if (!control) return false;

    if (!(control.touched || control.dirty)) return false;

    if (errorType) {
      return !!control.errors?.[errorType];
    } else {
      return control.invalid;
    }
  }
  private fetchUserAccount(userId: string, token: Token_Res_Type) {
    this.tokenService.setToken(token);

    this.userSerice.getUserAccount(userId).subscribe({
      next: (res) => {
        this.setErrOrSuccess(res.message, 'success');

        this.loggedInUserService.updateUser(res.data.results[0]);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.setErrOrSuccess(err.error.message, 'error');
      },
    });
  }
}
