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

export interface PageResponseDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
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

  listarCines(
    ciudad?: string,
    page = 0,
    size = 10
  ): Observable<PageResponseDTO<CinePublicDTO>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (ciudad) params = params.set('ciudad', ciudad);

    return this.http.get<PageResponseDTO<CinePublicDTO>>(`${this.base}/cines`, { params });
  }

  listarPeliculas(
    q?: string,
    generoId?: number,
    desde?: string,
    hasta?: string,
    page = 0,
    size = 12
  ): Observable<PageResponseDTO<PeliculaCardDTO>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (q) params = params.set('q', q);
    if (generoId != null) params = params.set('generoId', generoId);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<PageResponseDTO<PeliculaCardDTO>>(`${this.base}/peliculas`, { params });
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