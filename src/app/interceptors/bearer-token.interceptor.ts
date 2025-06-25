import {
  HttpRequest,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { SKIP_AUTH, TokenService } from '../services/token.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const bearerTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Skip token if this request says to skip it
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const token = tokenService.getToken()?.data.access_token;
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(authReq, next, tokenService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  tokenService: TokenService,
  router: Router
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = tokenService.getToken()?.data.refresh_token;
    if (!refreshToken) {
      tokenService.removeToken();
      return throwError(() => new Error('No refresh token'));
    }

    return tokenService.refreshToken(refreshToken).pipe(
      switchMap((res) => {
        tokenService.setToken(res);
        const newToken = res.data.access_token;
        refreshTokenSubject.next(newToken);
        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          })
        );
      }),
      catchError((err) => {
        tokenService.removeToken();
        router.navigate(['/', 'auth']);
        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) =>
        next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          })
        )
      )
    );
  }
}
