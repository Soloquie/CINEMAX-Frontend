import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import {
  PagoApiService,
  PagoEstadoResponseDTO
} from '../../../../core/services/pago-api.service';
import { ComprobanteApiService } from '../../../../core/services/comprobante-api.service';

@Component({
  selector: 'app-pago-resultado',
  templateUrl: './pago-resultado.html',
  styleUrls: ['./pago-resultado.scss'],
  standalone: false,
})
export class PagoResultadoComponent implements OnInit, OnDestroy {

  loading = true;
  errorMsg = '';

  referencia = '';
  paymentId = '';
  sessionId = '';
  statusMercadoPago = '';
  cancelado = false;

  estado: PagoEstadoResponseDTO | null = null;

  descargandoPdf = false;
  enviandoCorreo = false;
  mensajeAccion = '';
  errorAccion = '';

  private pollingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoApi: PagoApiService,
    private comprobanteApi: ComprobanteApiService
  ) {}

  ngOnInit(): void {
    this.referencia = this.route.snapshot.queryParamMap.get('referencia') || '';
    this.paymentId = this.route.snapshot.queryParamMap.get('payment_id') || '';
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id') || '';
    this.statusMercadoPago = this.route.snapshot.queryParamMap.get('status') || '';
    this.cancelado = this.route.snapshot.queryParamMap.get('cancelado') === 'true';

    if (this.cancelado) {
      this.loading = false;
      this.errorMsg = 'El pago fue cancelado antes de finalizar.';
      return;
    }

    if (!this.referencia) {
      this.loading = false;
      this.errorMsg = 'No se recibió la referencia del pago.';
      return;
    }

    this.consultarEstado();

    this.pollingSub = interval(3000)
      .pipe(
        switchMap(() => this.pagoApi.consultarEstado(this.referencia)),
        takeWhile((estado) => this.debeSeguirConsultando(estado), true)
      )
      .subscribe({
        next: (estado) => {
          this.estado = estado;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err?.error?.message || 'No se pudo consultar el estado del pago.';
        }
      });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  private consultarEstado(): void {
    this.loading = true;
    this.errorMsg = '';

    this.pagoApi.consultarEstado(this.referencia).subscribe({
      next: (estado) => {
        this.estado = estado;
        this.loading = false;
      },
      error: (err) => {
        this.estado = null;
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo consultar el estado del pago.';
      }
    });
  }

  private debeSeguirConsultando(estado: PagoEstadoResponseDTO): boolean {
    const estadoPago = (estado.estadoPago || '').toUpperCase();
    return estadoPago === 'PENDIENTE' || estadoPago === 'APROBADO';
  }

  esPagoConfirmado(): boolean {
    return (this.estado?.estadoPago || '').toUpperCase() === 'CONFIRMADO';
  }

  esPagoRechazado(): boolean {
    const estadoPago = (this.estado?.estadoPago || '').toUpperCase();
    return estadoPago === 'RECHAZADO' || estadoPago === 'FALLIDO_CONFIRMACION';
  }

  descargarComprobantePdf(): void {
    this.limpiarMensajesAccion();

    const ventaId = this.estado?.ventaId;

    if (!ventaId) {
      this.errorAccion = 'No se encontró la venta asociada al pago.';
      return;
    }

    this.descargandoPdf = true;

    this.comprobanteApi.descargarPdf(ventaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        const nombreArchivo = this.estado?.codigoVenta
          ? `comprobante-cinemax-${this.estado.codigoVenta}.pdf`
          : `comprobante-cinemax-${ventaId}.pdf`;

        link.href = url;
        link.download = nombreArchivo;
        link.click();

        window.URL.revokeObjectURL(url);

        this.descargandoPdf = false;
        this.mensajeAccion = 'Comprobante descargado correctamente.';
      },
      error: (err) => {
        this.descargandoPdf = false;
        this.errorAccion = err?.error?.message || 'No se pudo descargar el comprobante.';
      }
    });
  }

  enviarComprobanteCorreo(): void {
    this.limpiarMensajesAccion();

    const ventaId = this.estado?.ventaId;

    if (!ventaId) {
      this.errorAccion = 'No se encontró la venta asociada al pago.';
      return;
    }

    this.enviandoCorreo = true;

    this.comprobanteApi.enviarPorCorreo(ventaId).subscribe({
      next: () => {
        this.enviandoCorreo = false;
        this.mensajeAccion = 'Comprobante enviado correctamente al correo.';
      },
      error: (err) => {
        this.enviandoCorreo = false;
        this.errorAccion = err?.error?.message || 'No se pudo enviar el comprobante al correo.';
      }
    });
  }

  irMisCompras(): void {
    this.router.navigate(['/mis-compras']);
  }

  volverInicio(): void {
    this.router.navigate(['/peliculas']);
  }

  irCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  private limpiarMensajesAccion(): void {
    this.mensajeAccion = '';
    this.errorAccion = '';
  }
}