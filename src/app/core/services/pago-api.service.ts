import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * DTO que representa la respuesta del backend al crear un checkout de pago.
 * El campo initPoint contiene la URL de Mercado Pago a la que se debe redirigir al usuario.
 */
export interface CheckoutPagoResponseDTO {
  referencia: string;
  preferenceId: string;
  initPoint: string;
  publicKey: string;
}

/**
 * DTO que representa el estado actual de un pago consultado desde el backend.
 * Se usa después de que Mercado Pago redirige al usuario de regreso al frontend.
 */
export interface PagoEstadoResponseDTO {
  referencia: string;
  estadoPago: string;
  estadoVenta?: string | null;
  ventaId?: number | null;
  codigoVenta?: string | null;
  mensajeError?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PagoApiService {

  private readonly base = `${environment.apiBaseUrl}/api/pagos`;

  constructor(private http: HttpClient) {}

  /**
   * Crea el checkout de pago a partir del carrito activo del usuario autenticado.
   * No recibe body porque el backend toma el carrito desde el usuario autenticado.
   */
  crearCheckout(): Observable<CheckoutPagoResponseDTO> {
    return this.http.post<CheckoutPagoResponseDTO>(`${this.base}/checkout`, {});
  }

  /**
   * Consulta el estado de un pago usando la referencia generada por el backend.
   */
  consultarEstado(referencia: string): Observable<PagoEstadoResponseDTO> {
    return this.http.get<PagoEstadoResponseDTO>(`${this.base}/estado/${referencia}`);
  }
}