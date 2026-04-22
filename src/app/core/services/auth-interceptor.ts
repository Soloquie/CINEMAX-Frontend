import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthSessionService } from '../services/auth-session.service';
import { AuthApiService } from '../services/auth-api.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private session: AuthSessionService,
    private authApi: AuthApiService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // no interceptar login/refresh para evitar bucles
    if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh')) {
      return next.handle(req);
    }

    const token = this.session.getToken();

    const authReq = (!token || token === 'undefined' || token === 'null')
      ? req
      : req.clone({
          setHeaders: {
            Authorization: `${this.session.getTokenType()} ${token}`,
          },
        });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) {
          return throwError(() => error);
        }

        const refreshToken = this.session.getRefreshToken();
        if (!refreshToken) {
          this.session.clear();
          return throwError(() => error);
        }

        return this.authApi.refresh({ refreshToken }).pipe(
          switchMap((auth) => {
            this.session.saveAuth(auth);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `${auth.tokenType} ${auth.accessToken}`,
              },
            });

            return next.handle(retryReq);
          }),
          catchError((refreshError) => {
            this.session.clear();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }
}