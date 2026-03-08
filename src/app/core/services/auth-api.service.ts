import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MessageResponseDTO {
  message: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface UserSummaryDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  emailVerificado: boolean;
  estado: string;
  roles: string[]; 
}

export interface AuthResponseDTO {
  accessToken: string;
  tokenType: string;   // "Bearer"
  expiresIn: number;   // 3600
  user: UserSummaryDTO;
}

export interface RegisterRequestDTO {
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // yyyy-MM-dd
  email: string;
  telefono?: string;
  password: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly base = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  register(payload: RegisterRequestDTO): Observable<MessageResponseDTO> {
    return this.http.post<MessageResponseDTO>(`${this.base}/register`, payload);
  }

  login(payload: LoginRequestDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.base}/login`, payload);
  }

  verifyEmail(token: string): Observable<MessageResponseDTO> {
    const params = new HttpParams().set('token', token);
    return this.http.get<MessageResponseDTO>(`${this.base}/verify-email`, { params });
  }

  resendVerification(email: string): Observable<MessageResponseDTO> {
    return this.http.post<MessageResponseDTO>(`${this.base}/resend-verification`, { email });
  }

  forgotPassword(payload: ForgotPasswordRequestDTO) {
  return this.http.post<MessageResponseDTO>(`${this.base}/forgot-password`, payload);
}

  resetPassword(payload: ResetPasswordRequestDTO) {
  return this.http.post<MessageResponseDTO>(`${this.base}/reset-password`, payload);
}
}