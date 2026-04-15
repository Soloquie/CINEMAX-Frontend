import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.html',
  standalone: false,
  styleUrls: ['./verify-account.scss'],
})
export class VerifyAccountComponent implements OnInit {
  token: string | null = null;
  email = '';

  loading = false;
  ok = false;
  serverMessage = '';

  title = 'Verifica tu cuenta';
  description = 'Abre el enlace de verificación desde tu correo para activar tu cuenta.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authApi: AuthApiService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    if (this.token) {
      this.title = '¡Cuenta creada!';
      this.description = 'Haz clic en el botón para verificar tu correo y activar tu cuenta.';
    } else {
      this.title = 'Revisa tu correo';
      this.description = 'Te enviamos un correo de verificación. Si no te llegó, puedes reenviarlo abajo.';
    }
  }

  onVerify(): void {
    if (!this.token) return;

    this.loading = true;
    this.serverMessage = '';

    this.authApi.verifyEmail(this.token).subscribe({
      next: (res) => {
        this.ok = true;
        this.serverMessage = res.message || 'Correo verificado correctamente.';
        this.loading = false;

        setTimeout(() => this.router.navigate(['/auth/login']), 1200);
      },
      error: (err) => {
        this.ok = false;
        this.serverMessage =
          err?.error?.message || 'No se pudo verificar el correo. El token puede ser inválido o haber expirado.';
        this.loading = false;
      },
    });
  }

  onResend(): void {
    if (!this.email) {
      this.serverMessage = 'Ingresa o confirma el correo para reenviar la verificación.';
      this.ok = false;
      return;
    }

    this.loading = true;
    this.serverMessage = '';

    this.authApi.resendVerification(this.email).subscribe({
      next: (res) => {
        this.ok = true;
        this.serverMessage = res.message || 'Correo de verificación reenviado.';
        this.loading = false;
      },
      error: (err) => {
        this.ok = false;
        this.serverMessage =
          err?.error?.message || 'No se pudo reenviar el correo de verificación.';
        this.loading = false;
      },
    });
  }
}