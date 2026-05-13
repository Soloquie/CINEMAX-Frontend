import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CompraResumenDTO {
  ventaId: number;
  codigoVenta: string;
  estadoVenta: string;
  total: number;
  referenciaPago: string;
  estadoPago: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentaApiService {


  private readonly apiUrl = `${environment.apiBaseUrl}/api/ventas`;

  constructor(private http: HttpClient) {}

  listarMisCompras(): Observable<CompraResumenDTO[]> {
    return this.http.get<CompraResumenDTO[]>(`${this.apiUrl}/mis-compras`);
  }

  detalleVenta(ventaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${ventaId}`);
  }

  descargarComprobantePdf(ventaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ventaId}/comprobante/pdf`, {
      responseType: 'blob'
    });
  }

  enviarComprobanteEmail(ventaId: number): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.apiUrl}/${ventaId}/comprobante/email`,
      {}
    );
  }
}