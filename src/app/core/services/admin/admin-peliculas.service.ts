import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GeneroDTO {
  id: number;
  nombre: string;
}

export interface PeliculaResponseDTO {
  id: number;
  titulo: string;
  sinopsis: string;
  duracionMin: number;
  clasificacion: string;
  fechaEstreno: string; // LocalDate => "yyyy-MM-dd"
  posterUrl: string | null;
  activa: boolean;
  generos: GeneroDTO[];
}

export interface PeliculaUpsertForm {
  titulo: string;
  sinopsis: string;
  duracionMin: number;
  clasificacion: string;
  fechaEstreno: string;      // yyyy-MM-dd
  activa: boolean;
  generoIds: number[];
  poster?: File | null;      
}

@Injectable({ providedIn: 'root' })
export class AdminPeliculasApiService {
  private readonly base = `${environment.apiBaseUrl}/api/admin/peliculas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<PeliculaResponseDTO[]> {
    return this.http.get<PeliculaResponseDTO[]>(this.base);
  }

  crear(form: PeliculaUpsertForm): Observable<PeliculaResponseDTO> {
    return this.http.post<PeliculaResponseDTO>(this.base, this.toFormData(form));
  }

  actualizar(id: number, form: PeliculaUpsertForm): Observable<PeliculaResponseDTO> {
    return this.http.put<PeliculaResponseDTO>(`${this.base}/${id}`, this.toFormData(form));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  private toFormData(form: PeliculaUpsertForm): FormData {
    const fd = new FormData();
    fd.append('titulo', form.titulo);
    fd.append('sinopsis', form.sinopsis);
    fd.append('duracionMin', String(form.duracionMin));
    fd.append('clasificacion', form.clasificacion);
    fd.append('fechaEstreno', form.fechaEstreno);
    fd.append('activa', String(form.activa));

    for (const gid of (form.generoIds || [])) {
      fd.append('generoIds', String(gid));
    }

    if (form.poster) {
      fd.append('poster', form.poster);
    }

    return fd;
  }
}