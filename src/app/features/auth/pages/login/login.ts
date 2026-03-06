import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService, LoginRequestDTO } from '../../../../core/services/auth-api.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false,
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  model: LoginRequestDTO = { email: '', password: '' };

  loading = false;
  errorMsg = '';

  constructor(
    private authApi: AuthApiService,
    private session: AuthSessionService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMsg = '';

    this.authApi.login(this.model).subscribe({
      next: (res) => {
        this.session.saveAuth(res);
        this.loading = false;
        this.router.navigate(['/peliculas']); // ✅ login OK
      },
      error: (err) => {
      this.loading = false;
      const msg = err?.error?.message || 'No se pudo iniciar sesión.';

      if (msg.toLowerCase().includes('bloquead')) {
      this.router.navigate(['/auth/account-locked'], { queryParams: { minutes: 15 } });
    return;
  }

  this.errorMsg = msg;
},
    });
  }
}