import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private session: AuthSessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.session.getToken();
  if (!token || token === 'undefined' || token === 'null') {
    return next.handle(req);
  }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `${this.session.getTokenType()} ${token}`,
      },
    });
    return next.handle(authReq);
  }
}