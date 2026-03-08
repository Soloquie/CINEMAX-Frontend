import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CinePublicDTO {
  id: number;
  nombre: string;
  ciudad?: string;
}

export interface GeneroDTO { id: number; nombre: string; }

export interface PeliculaDetailDTO {
  id: number;
  titulo: string;
  sinopsis?: string;
  duracionMin?: number;
  clasificacion?: string;
  fechaEstreno?: string;
  posterUrl?: string;
  activa?: boolean;
  generos?: GeneroDTO[];
}

export interface PeliculaCardDTO {
  id: number;
  titulo: string;
  posterUrl?: string;
  clasificacion?: string;
  duracionMin?: number;
  genero?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  listarCines(ciudad?: string): Observable<CinePublicDTO[]> {
    let params = new HttpParams();
    if (ciudad) params = params.set('ciudad', ciudad);
    return this.http.get<CinePublicDTO[]>(`${this.base}/cines`, { params });
  }

  enCartelera(): Observable<PeliculaCardDTO[]> {
    return this.http.get<PeliculaCardDTO[]>(`${this.base}/peliculas/en-cartelera`);
  }

  proximas(dias = 30): Observable<PeliculaCardDTO[]> {
    const params = new HttpParams().set('dias', String(dias));
    return this.http.get<PeliculaCardDTO[]>(`${this.base}/peliculas/proximas`, { params });
  }

  detallePelicula(id: number): Observable<PeliculaDetailDTO> {
  return this.http.get<PeliculaDetailDTO>(`${this.base}/peliculas/${id}`);
}
}