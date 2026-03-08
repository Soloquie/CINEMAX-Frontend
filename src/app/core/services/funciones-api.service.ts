import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FuncionPublicDTO {
  id: number;
  peliculaId: number;
  peliculaTitulo: string;
  posterUrl: string | null;

  cineId: number;
  cineNombre: string;
  salaId: number;
  salaNombre: string;

  inicio: string; 
  fin: string;

  idioma: string;
  subtitulos: boolean;
  precioBase: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class FuncionesApiService {
  private readonly base = `${environment.apiBaseUrl}/api/funciones`;

  constructor(private http: HttpClient) {}

  listar(fecha?: string, cineId?: number, peliculaId?: number): Observable<FuncionPublicDTO[]> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    if (cineId) params = params.set('cineId', String(cineId));
    if (peliculaId) params = params.set('peliculaId', String(peliculaId));
    return this.http.get<FuncionPublicDTO[]>(this.base, { params });
  }
}