import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CategoriaConfiteria = 'COMBO' | 'POPCORN' | 'DRINK' | 'CANDY' | string;

export interface ProductoPublicDTO {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaConfiteria;
  imagenUrl: string | null;
  activo: boolean;
  stock: number;
}

export interface MessageResponseDTO {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ConfiteriaApiService {
  private readonly publicBase = `${environment.apiBaseUrl}/api/confiteria`;
  private readonly cartBase = `${environment.apiBaseUrl}/api/carrito`;

  constructor(private http: HttpClient) {}

  listarProductos(categoria?: string): Observable<ProductoPublicDTO[]> {
    let params = new HttpParams();
    if (categoria && categoria !== 'ALL') {
      params = params.set('categoria', categoria);
    }
    return this.http.get<ProductoPublicDTO[]>(`${this.publicBase}/productos`, { params });
  }

  agregarProducto(productoId: number, cantidad = 1): Observable<MessageResponseDTO> {
    return this.http.post<MessageResponseDTO>(`${this.cartBase}/productos`, {
      productoId,
      cantidad,
    });
  }

  actualizarCantidad(productoId: number, cantidad: number): Observable<MessageResponseDTO> {
    return this.http.put<MessageResponseDTO>(`${this.cartBase}/productos/${productoId}`, {
      cantidad,
    });
  }

  eliminarProducto(productoId: number): Observable<MessageResponseDTO> {
    return this.http.delete<MessageResponseDTO>(`${this.cartBase}/productos/${productoId}`);
  }
}