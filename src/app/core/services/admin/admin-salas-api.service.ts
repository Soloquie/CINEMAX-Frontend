import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type TipoSala = string;

export interface SalaResponseDTO {
  id: number;
  cineId: number;
  cineNombre: string;
  nombre: string;
  tipo: TipoSala;
  activa: boolean;
}

export interface SalaUpsertDTO {
  nombre: string;
  tipo: TipoSala;
  activa: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminSalasApiService {
  private readonly base = `${environment.apiBaseUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  listarPorCine(cineId: number): Observable<SalaResponseDTO[]> {
    return this.http.get<SalaResponseDTO[]>(`${this.base}/cines/${cineId}/salas`);
  }

  crear(cineId: number, dto: SalaUpsertDTO): Observable<SalaResponseDTO> {
    return this.http.post<SalaResponseDTO>(`${this.base}/cines/${cineId}/salas`, dto);
  }

  actualizar(salaId: number, dto: SalaUpsertDTO): Observable<SalaResponseDTO> {
    return this.http.put<SalaResponseDTO>(`${this.base}/salas/${salaId}`, dto);
  }

  eliminar(salaId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/salas/${salaId}`);
  }
}