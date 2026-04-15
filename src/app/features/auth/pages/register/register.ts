import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService, RegisterRequestDTO } from '../../../../core/services/auth-api.service';

type FieldErrors = Record<string, string>;

type RegisterFormModel = RegisterRequestDTO & {
  confirmPassword: string;
};

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  model: RegisterFormModel = {
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  };

  loading = false;
  errorMsg = '';
  fieldErrors: FieldErrors = {};

  passwordVisible = false;
  confirmPasswordVisible = false;

  todayString = new Date().toISOString().split('T')[0];

  constructor(
    private authApi: AuthApiService,
    private router: Router
  ) {}

  get passwordInputType(): 'text' | 'password' {
    return this.passwordVisible ? 'text' : 'password';
  }

  get confirmPasswordInputType(): 'text' | 'password' {
    return this.confirmPasswordVisible ? 'text' : 'password';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  hasFieldError(name: string): boolean {
    return !!this.fieldErrors?.[name];
  }

  fieldError(name: string): string {
    return this.fieldErrors?.[name] || '';
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMsg = '';
    this.fieldErrors = {};

    const ok = this.validateClient();
    if (!ok) {
      this.loading = false;
      this.errorMsg = 'Revisa los campos marcados e intenta nuevamente.';
      return;
    }

    const payload: RegisterRequestDTO = {
      nombre: this.model.nombre.trim(),
      apellido: this.model.apellido.trim(),
      fechaNacimiento: this.model.fechaNacimiento,
      email: this.model.email.trim(),
      telefono: this.model.telefono?.trim(),
      password: this.model.password,
    };

    this.authApi.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/verify-account'], {
          queryParams: { email: payload.email },
        });
      },
      error: (err) => {
        this.loading = false;

        const api = err?.error;
        this.errorMsg = api?.message || 'No se pudo registrar. Verifica los datos.';
        this.fieldErrors = api?.fields || {};

        if (!this.errorMsg && typeof api === 'string') {
          this.errorMsg = api;
        }
      },
    });
  }

  private validateClient(): boolean {
    const errors: FieldErrors = {};

    const nombre = (this.model.nombre || '').trim();
    const apellido = (this.model.apellido || '').trim();
    const email = (this.model.email || '').trim();
    const tel = (this.model.telefono || '').trim();
    const dob = (this.model.fechaNacimiento || '').trim();
    const pass = this.model.password || '';
    const confirmPass = this.model.confirmPassword || '';

    if (nombre.length < 2) {
      errors['nombre'] = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (apellido.length < 2) {
      errors['apellido'] = 'El apellido debe tener al menos 2 caracteres.';
    }

    if (!dob) {
      errors['fechaNacimiento'] = 'La fecha de nacimiento es obligatoria.';
    } else {
      const selected = new Date(`${dob}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selected.getTime())) {
        errors['fechaNacimiento'] = 'La fecha de nacimiento no es válida.';
      } else if (selected > today) {
        errors['fechaNacimiento'] = 'La fecha de nacimiento no puede ser futura.';
      }
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      errors['email'] = 'Ingresa un correo válido.';
    }

    const telDigits = tel.replace(/\D/g, '');
    if (telDigits.length < 7 || telDigits.length > 15) {
      errors['telefono'] = 'El teléfono debe tener entre 7 y 15 dígitos.';
    }

    const passErrors = this.passwordStrengthErrors(pass);
    if (passErrors.length) {
      errors['password'] = passErrors.join(' ');
    }

    if (!confirmPass) {
      errors['confirmPassword'] = 'Debes confirmar la contraseña.';
    } else if (pass !== confirmPass) {
      errors['confirmPassword'] = 'Las contraseñas no coinciden.';
    }

    this.fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  passwordStrengthErrors(pass: string): string[] {
    const errs: string[] = [];
    if (!pass || pass.length < 8) errs.push('Mínimo 8 caracteres.');
    if (!/[a-z]/.test(pass)) errs.push('Incluye 1 minúscula.');
    if (!/[A-Z]/.test(pass)) errs.push('Incluye 1 mayúscula.');
    if (!/[0-9]/.test(pass)) errs.push('Incluye 1 número.');
    if (!/[^\w\s]/.test(pass)) errs.push('Incluye 1 símbolo.');
    return errs;
  }
}