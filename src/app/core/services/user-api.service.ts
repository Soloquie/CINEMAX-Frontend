import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserMeDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly base = `${environment.apiBaseUrl}/api/users`;

  constructor(private http: HttpClient) {}

  me(): Observable<UserMeDTO> {
    return this.http.get<UserMeDTO>(`${this.base}/me`);
  }
}