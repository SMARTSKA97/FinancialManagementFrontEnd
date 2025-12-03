import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { Auth } from '../services/auth';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const accessToken = authService.getAccessToken();

  // 1. Add the access token if we have one
  if (accessToken) {
    req = addToken(req, accessToken);
  }

  return next(req).pipe(
    catchError(error => {
      // 2. If we get a 401, try to refresh
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const addToken = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

const handle401Error = (req: HttpRequest<any>, next: HttpHandlerFn, authService: Auth): Observable<HttpEvent<any>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((success: boolean) => {
        isRefreshing = false;
        if (success) {
          const newToken = authService.getAccessToken();
          refreshTokenSubject.next(newToken);
          return next(addToken(req, newToken!));
        } else {
          return throwError(() => new Error('Session expired'));
        }
      }),
      catchError((err) => {
        isRefreshing = false;
        return throwError(() => err);
      })
    );
  } else {
    // If already refreshing, wait for the new token
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next(addToken(req, jwt!));
      })
    );
  }
};