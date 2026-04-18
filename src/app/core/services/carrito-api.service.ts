import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RemoveCartItemsRequestDTO {
  funcionAsientoIds: number[];
}

export interface CarritoItemResponseDTO {
  itemId: number;
  tipo: string;

  // asientos
  funcionAsientoId?: number | null;
  funcionId?: number | null;
  peliculaTitulo?: string | null;
  salaNombre?: string | null;
  cineNombre?: string | null;
  inicioFuncion?: string | null;
  fila?: string | null;
  numero?: number | null;

  // productos
  productoId?: number | null;
  productoNombre?: string | null;
  productoDescripcion?: string | null;
  productoImagenUrl?: string | null;
  cantidad?: number | null;

  precioUnitario: number;
  subtotal?: number | null;
}

export interface CarritoResponseDTO {
  carritoId: number;
  estado: string;
  expiraEn: string | null;
  items: CarritoItemResponseDTO[];
}

@Injectable({ providedIn: 'root' })
export class CarritoApiService {
  private readonly base = `${environment.apiBaseUrl}/api/carrito`;

  constructor(private http: HttpClient) {}

  getMyCart(): Observable<CarritoResponseDTO> {
    return this.http.get<CarritoResponseDTO>(this.base);
  }

  removeSeats(ids: number[]): Observable<{ message: string }> {
    const body: RemoveCartItemsRequestDTO = { funcionAsientoIds: ids };
    return this.http.post<{ message: string }>(`${this.base}/remove-seats`, body);
  }

  removeProducto(productoId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/productos/${productoId}`);
  }
}