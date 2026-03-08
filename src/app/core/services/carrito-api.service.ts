import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CarritoItemResponseDTO {
  itemId: number;
  tipo: string;

  funcionAsientoId: number;
  funcionId: number;

  peliculaTitulo: string;
  salaNombre: string;
  cineNombre: string;
  inicioFuncion: string; // ISO

  fila: string;
  numero: number;

  precioUnitario: number; // BigDecimal -> number
}

export interface CarritoResponseDTO {
  carritoId: number;
  estado: string;
  expiraEn: string | null; // ISO
  items: CarritoItemResponseDTO[];
}

@Injectable({ providedIn: 'root' })
export class CarritoApiService {
  private readonly base = `${environment.apiBaseUrl}/api/carrito`;

  constructor(private http: HttpClient) {}

  getMyCart(): Observable<CarritoResponseDTO> {
    return this.http.get<CarritoResponseDTO>(this.base);
  }
}