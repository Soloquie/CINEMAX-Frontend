import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type TipoAsiento = 'STANDARD' | 'VIP' | 'DISCAPACIDAD' | string;

export interface AsientoResponseDTO {
  id: number;
  fila: string;
  numero: number;
  tipo: TipoAsiento;
  activo: boolean;
}

export interface AsientoPosDTO {
  fila: string;
  numero: number;
}

export interface AsientosGenerarDTO {
  filas: string[];
  asientosPorFila: number;
  tipoDefault: TipoAsiento;
  vipFilas: string[];
  discapacidad: AsientoPosDTO[];
  desactivarFuera: boolean;
}

export type AsientosGenerarResponseDTO = any;

@Injectable({ providedIn: 'root' })
export class AdminAsientosApiService {
  private readonly base = `${environment.apiBaseUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  generar(salaId: number, dto: AsientosGenerarDTO): Observable<AsientosGenerarResponseDTO> {
    return this.http.post(`${this.base}/salas/${salaId}/asientos/generar`, dto);
  }

  listarPorSala(salaId: number): Observable<AsientoResponseDTO[]> {
    return this.http.get<AsientoResponseDTO[]>(`${this.base}/salas/${salaId}/asientos`);
  }
}