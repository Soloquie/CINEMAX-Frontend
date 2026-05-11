import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import {
  PagoApiService,
  PagoEstadoResponseDTO
} from '../../../../core/services/pago-api.service';

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
  statusMercadoPago = '';

  estado: PagoEstadoResponseDTO | null = null;

  private pollingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoApi: PagoApiService
  ) {}

  ngOnInit(): void {
    this.referencia = this.route.snapshot.queryParamMap.get('referencia') || '';
    this.paymentId = this.route.snapshot.queryParamMap.get('payment_id') || '';
    this.statusMercadoPago = this.route.snapshot.queryParamMap.get('status') || '';

    if (!this.referencia) {
      this.loading = false;
      this.errorMsg = 'No se recibió la referencia del pago.';
      return;
    }

    this.consultarEstado();

    /*
     * Se consulta varias veces porque el webhook de Mercado Pago puede tardar unos segundos
     * en confirmar la venta en el backend.
     */
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

  volverInicio(): void {
    this.router.navigate(['/peliculas']);
  }

  irCarrito(): void {
    this.router.navigate(['/carrito']);
  }
}