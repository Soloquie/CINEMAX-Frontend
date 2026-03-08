import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FuncionResponseDTO {
  id: number;
  peliculaId: number;
  peliculaTitulo: string;
  posterUrl: string | null;

  salaId: number;
  salaNombre: string;

  cineId: number;
  cineNombre: string;

  inicio: string; // ISO
  fin: string | null;

  idioma: string | null;
  subtitulos: boolean | null;
  precioBase: number | null;
  estado: string;
}

export interface FuncionUpsertDTO {
  peliculaId: number;
  salaId: number;
  inicio: string; // "yyyy-MM-ddTHH:mm:ss"
  fin?: string | null;
  idioma?: string | null;
  subtitulos?: boolean | null;
  precioBase?: number | null;
}

@Injectable({ providedIn: 'root' })
export class AdminFuncionesApiService {
  private readonly base = `${environment.apiBaseUrl}/api/admin/funciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<FuncionResponseDTO[]> {
    return this.http.get<FuncionResponseDTO[]>(this.base);
  }

  crear(dto: FuncionUpsertDTO): Observable<FuncionResponseDTO> {
    return this.http.post<FuncionResponseDTO>(this.base, dto);
  }

  actualizar(id: number, dto: FuncionUpsertDTO): Observable<FuncionResponseDTO> {
    return this.http.put<FuncionResponseDTO>(`${this.base}/${id}`, dto);
  }

  cancelar(id: number): Observable<FuncionResponseDTO> {
    return this.http.delete<FuncionResponseDTO>(`${this.base}/${id}`);
  }
}