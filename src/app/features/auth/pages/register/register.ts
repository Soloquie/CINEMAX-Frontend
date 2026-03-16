import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService, RegisterRequestDTO } from '../../../../core/services/auth-api.service';

type FieldErrors = Record<string, string>;

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

  fieldErrors: FieldErrors = {};


  passwordVisible = false;

  constructor(private authApi: AuthApiService, private router: Router) {}

  // ---- UI helpers ----
  get passwordInputType(): 'text' | 'password' {
    return this.passwordVisible ? 'text' : 'password';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  hasFieldError(name: string): boolean {
    return !!this.fieldErrors?.[name];
  }

  fieldError(name: string): string {
    return this.fieldErrors?.[name] || '';
  }

  // ---- Submit ----
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

    this.authApi.register(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/verify-account']);
      },
      error: (err) => {
        this.loading = false;

        const api = err?.error;

        // mensaje general
        this.errorMsg = api?.message || 'Could not register. Please check your data.';

        this.fieldErrors = api?.fields || {};

        if (!this.errorMsg && typeof api === 'string') this.errorMsg = api;
      },
    });
  }

  // ---- Validaciones fuertes ----
  private validateClient(): boolean {
    const errors: FieldErrors = {};

    const nombre = (this.model.nombre || '').trim();
    const apellido = (this.model.apellido || '').trim();
    const email = (this.model.email || '').trim();
    const tel = (this.model.telefono || '').trim();
    const dob = (this.model.fechaNacimiento || '').trim();
    const pass = this.model.password || '';

    // Nombre / apellido
    if (nombre.length < 2) errors['nombre'] = 'El nombre debe tener al menos 2 caracteres.';
    if (apellido.length < 2) errors['apellido'] = 'El apellido debe tener al menos 2 caracteres.';

    // Fecha nacimiento
    if (!dob) errors['fechaNacimiento'] = 'La fecha de nacimiento es obligatoria.';

    // Email (simple pero efectivo)
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) errors['email'] = 'Ingresa un correo válido.';

    // Teléfono (solo dígitos, 7-15)
    const telDigits = tel.replace(/\D/g, '');
    if (telDigits.length < 7 || telDigits.length > 15) {
      errors['telefono'] = 'El teléfono debe tener entre 7 y 15 dígitos.';
    }

    // Password fuerte
    const passErrors = this.passwordStrengthErrors(pass);
    if (passErrors.length) errors['password'] = passErrors.join(' ');

    this.fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  // Puedes mostrar estos errores en UI si quieres (por ahora los unimos en 1 string)
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