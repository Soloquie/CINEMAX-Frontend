import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteApiService {

    private readonly apiUrl = `${environment.apiBaseUrl}/api/ventas`;
    constructor(private http: HttpClient) {}

  descargarPdf(ventaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ventaId}/comprobante/pdf`, {
      responseType: 'blob'
    });
  }

  enviarPorCorreo(ventaId: number): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.apiUrl}/${ventaId}/comprobante/email`,
      {}
    );
  }
}