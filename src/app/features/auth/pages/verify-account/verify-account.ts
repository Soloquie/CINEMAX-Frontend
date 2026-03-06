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

  title = 'Verify your account';
  description = 'Open the verification link from your email to activate your account.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authApi: AuthApiService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      this.title = 'Account Created!';
      this.description = 'Click the button below to verify your email and activate your account.';
    } else {
      this.title = 'Check your email';
      this.description = 'We sent you a verification email. If you did not receive it, you can resend it below.';
    }
  }

  onVerify(): void {
    if (!this.token) return;

    this.loading = true;
    this.serverMessage = '';

    this.authApi.verifyEmail(this.token).subscribe({
      next: (res) => {
        this.ok = true;
        this.serverMessage = res.message || 'Email verified successfully.';
        this.loading = false;

        // opcional: redirigir al login luego de verificar
        setTimeout(() => this.router.navigate(['/auth/login']), 1200);
      },
      error: (err) => {
        this.ok = false;
        this.serverMessage =
          err?.error?.message || 'Verification failed. The token may be invalid or expired.';
        this.loading = false;
      },
    });
  }

  onResend(): void {
    if (!this.email) return;

    this.loading = true;
    this.serverMessage = '';

    this.authApi.resendVerification(this.email).subscribe({
      next: (res) => {
        this.ok = true;
        this.serverMessage = res.message || 'Verification email sent.';
        this.loading = false;
      },
      error: (err) => {
        this.ok = false;
        this.serverMessage =
          err?.error?.message || 'Could not resend verification email.';
        this.loading = false;
      },
    });
  }
}