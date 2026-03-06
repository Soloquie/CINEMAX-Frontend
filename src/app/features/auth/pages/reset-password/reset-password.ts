import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
  standalone: false
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  okMsg = '';
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authApi: AuthApiService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMsg = 'Token no encontrado. Abre el enlace desde tu correo.';
    }
  }

  onSubmit(): void {
    this.okMsg = '';
    this.errorMsg = '';

    if (!this.token) {
      this.errorMsg = 'Token no encontrado.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMsg = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.authApi.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: (res) => {
        this.okMsg = res?.message || 'Contraseña actualizada correctamente.';
        this.loading = false;

        // opcional: volver al login
        setTimeout(() => this.router.navigate(['/auth/login']), 1200);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la contraseña.';
        this.loading = false;
      },
    });
  }
}