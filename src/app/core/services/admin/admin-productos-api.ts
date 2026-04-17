import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ProductoCategoria = 'COMBO' | 'POPCORN' | 'DRINK' | 'CANDY' | string;
export type TipoMovimientoInventario = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | string;

export interface ProductoAdminResponseDTO {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: ProductoCategoria;
  imagenUrl: string | null;
  activo: boolean;
  stock: number;
  stockMinimo: number;
}

export interface ProductoUpsertForm {
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number | null;
  categoria: ProductoCategoria;
  activo: boolean;
  stock: number | null;
  stockMinimo: number | null;
  imagen?: File | null;
}

export interface ActualizarStockDTO {
  cantidad: number | null;
  tipo: TipoMovimientoInventario;
  motivo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminProductosApiService {
  private readonly base = `${environment.apiBaseUrl}/api/admin/productos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ProductoAdminResponseDTO[]> {
    return this.http.get<ProductoAdminResponseDTO[]>(this.base);
  }

  crear(form: ProductoUpsertForm): Observable<ProductoAdminResponseDTO> {
    return this.http.post<ProductoAdminResponseDTO>(this.base, this.toFormData(form));
  }

  actualizar(id: number, form: ProductoUpsertForm): Observable<ProductoAdminResponseDTO> {
    return this.http.put<ProductoAdminResponseDTO>(`${this.base}/${id}`, this.toFormData(form));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  actualizarStock(id: number, dto: ActualizarStockDTO): Observable<ProductoAdminResponseDTO> {
    return this.http.patch<ProductoAdminResponseDTO>(`${this.base}/${id}/stock`, dto);
  }

  private toFormData(form: ProductoUpsertForm): FormData {
    const fd = new FormData();
    fd.append('sku', form.sku ?? '');
    fd.append('nombre', form.nombre ?? '');
    fd.append('descripcion', form.descripcion ?? '');
    fd.append('precio', String(form.precio ?? 0));
    fd.append('categoria', String(form.categoria ?? 'COMBO'));
    fd.append('activo', String(form.activo ?? true));
    fd.append('stock', String(form.stock ?? 0));
    fd.append('stockMinimo', String(form.stockMinimo ?? 0));

    if (form.imagen) {
      fd.append('imagen', form.imagen);
    }

    return fd;
  }
}