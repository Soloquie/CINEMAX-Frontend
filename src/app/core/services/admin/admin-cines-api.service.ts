import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CineResponseDTO {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  activo: boolean;
}

export interface CineUpsertDTO {
  nombre: string;
  ciudad: string;
  direccion: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminCinesApiService {
  private readonly base = `${environment.apiBaseUrl}/api/admin/cines`;

  constructor(private http: HttpClient) {}

  listar(): Observable<CineResponseDTO[]> {
    return this.http.get<CineResponseDTO[]>(this.base);
  }

  crear(dto: CineUpsertDTO): Observable<CineResponseDTO> {
    return this.http.post<CineResponseDTO>(this.base, dto);
  }

  actualizar(id: number, dto: CineUpsertDTO): Observable<CineResponseDTO> {
    return this.http.put<CineResponseDTO>(`${this.base}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}