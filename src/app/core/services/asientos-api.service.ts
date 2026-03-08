import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FuncionAsientoResponseDTO {
  funcionAsientoId: number;
  asientoId: number;
  fila: string;
  numero: number;
  tipo: 'STANDARD' | 'VIP' | 'DISCAPACIDAD' | string;
  estado: 'DISPONIBLE' | 'BLOQUEADO' | 'VENDIDO' | string;
  mio: boolean;
  retencionExpira: string | null;
}

export interface HoldAsientosRequestDTO {
  funcionAsientoIds: number[];
}

export interface ReleaseAsientosRequestDTO {
  funcionAsientoIds: number[];
}

export interface HoldAsientosResponseDTO {
  funcionId: number;
  bloqueados: number[];
  expiraEn: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class AsientosApiService {
  private readonly base = `${environment.apiBaseUrl}/api/funciones`;

  constructor(private http: HttpClient) {}

  listar(funcionId: number): Observable<FuncionAsientoResponseDTO[]> {
    return this.http.get<FuncionAsientoResponseDTO[]>(`${this.base}/${funcionId}/asientos`);
  }

  hold(funcionId: number, ids: number[]): Observable<HoldAsientosResponseDTO> {
    const body: HoldAsientosRequestDTO = { funcionAsientoIds: ids };
    return this.http.post<HoldAsientosResponseDTO>(`${this.base}/${funcionId}/asientos/hold`, body);
  }

  release(funcionId: number, ids: number[]): Observable<any> {
    const body: ReleaseAsientosRequestDTO = { funcionAsientoIds: ids };
    return this.http.post(`${this.base}/${funcionId}/asientos/release`, body);
  }
}