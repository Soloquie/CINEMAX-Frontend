import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AuthSessionService } from '../../../../core/services/auth-session.service'; 

type UserMeDTO = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles?: string[];
};

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
  standalone: false,
})
export class AdminLayoutComponent implements OnInit {

  me: UserMeDTO | null = null;
  meError = '';
  initials = 'AD';
  isAdmin = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private session: AuthSessionService
  ) {}

  ngOnInit(): void {
    const token = this.session.getToken();
    if (!token) {
        this.session.clear();
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadMe();
  }

  goHome(): void {
  this.router.navigate(['/peliculas']);
}

  loadMe(): void {
    this.meError = '';

    this.http.get<UserMeDTO>(`${environment.apiBaseUrl}/api/users/me`)
      .subscribe({
        next: (data) => {
          this.me = data;

          const n = (data?.nombre || '').trim();
          const a = (data?.apellido || '').trim();
          this.initials = ((n[0] || 'A') + (a[0] || 'D')).toUpperCase();

          const roles = data?.roles || [];
          this.isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
        },
    error: (err) => {
      this.me = null;
      this.initials = 'AD';
      this.isAdmin = false;

      if (err?.status === 401 || err?.status === 403) {
        this.session.clear();
        this.router.navigate(['/auth/login']);
        return;
      }

      this.meError = 'No se pudo validar el rol del usuario.';
      this.router.navigate(['/peliculas']);
    }
      });
  }

  logout(): void {
    this.session.clear();
    this.router.navigate(['/auth/login']);
  }
}