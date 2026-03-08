import { Injectable } from '@angular/core';
import { AuthResponseDTO, UserSummaryDTO } from './auth-api.service';

const TOKEN_KEY = 'cinemax_token';
const TOKEN_TYPE_KEY = 'cinemax_token_type';
const USER_KEY = 'cinemax_user';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {

  saveAuth(auth: AuthResponseDTO): void {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);      // ✅
    localStorage.setItem(TOKEN_TYPE_KEY, auth.tokenType || 'Bearer');
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getTokenType(): string {
    return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
  }

  getUser(): UserSummaryDTO | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserSummaryDTO) : null;
  }

  isLoggedIn(): boolean {
    const t = this.getToken();
    return !!t && t !== 'undefined' && t !== 'null';
  }
}