import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService, RegisterRequestDTO } from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  model: RegisterRequestDTO = {
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    password: '',
  };

  loading = false;
  errorMsg = '';

  constructor(private authApi: AuthApiService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMsg = '';

    this.authApi.register(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/verify-account']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Could not register. Please check your data.';
      },
    });
  }
}