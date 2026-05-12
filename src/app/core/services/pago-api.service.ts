import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ProveedorPago = 'MERCADO_PAGO' | 'STRIPE';

/**
 * DTO enviado al backend para indicar con qué proveedor se desea iniciar el checkout.
 */
export interface CrearCheckoutPagoRequestDTO {
  proveedor: ProveedorPago;
}

/**
 * DTO que representa la respuesta del backend al crear un checkout.
 * Sirve tanto para Mercado Pago como para Stripe.
 */
export interface CheckoutPagoResponseDTO {
  referencia: string;
  proveedor: string;
  montoCentavos: number;
  moneda: string;
  checkoutId: string;
  initPoint: string;
  publicKey: string;
}

/**
 * DTO que representa el estado actual de un pago consultado desde el backend.
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
   * Crea un checkout de pago según el proveedor seleccionado.
   * El backend calcula el total desde el carrito activo del usuario autenticado.
   */
  crearCheckout(proveedor: ProveedorPago): Observable<CheckoutPagoResponseDTO> {
    const body: CrearCheckoutPagoRequestDTO = { proveedor };
    return this.http.post<CheckoutPagoResponseDTO>(`${this.base}/checkout`, body);
  }

  /**
   * Consulta el estado de un pago usando la referencia generada por el backend.
   */
  consultarEstado(referencia: string): Observable<PagoEstadoResponseDTO> {
    return this.http.get<PagoEstadoResponseDTO>(`${this.base}/estado/${referencia}`);
  }
} 