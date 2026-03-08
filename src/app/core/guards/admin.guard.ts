import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private session: AuthSessionService, private router: Router) {}

  canActivate(): boolean {
    const user = this.session.getUser();
    const roles = user?.roles || [];

    const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

    if (!this.session.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (!isAdmin) {
      this.router.navigate(['/peliculas']);
      return false;
    }

    return true;
  }
}