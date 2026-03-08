import { Component } from '@angular/core';
import { AuthApiService } from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
  standalone: false,
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;

  okMsg = '';
  errorMsg = '';

  constructor(private authApi: AuthApiService) {}

  onSubmit(): void {
    this.loading = true;
    this.okMsg = '';
    this.errorMsg = '';

    this.authApi.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.okMsg = res?.message || 'Si el correo existe, enviaremos un enlace de recuperación.';
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo procesar la solicitud. Intenta de nuevo.';
        this.loading = false;
      },
    });
  }
}