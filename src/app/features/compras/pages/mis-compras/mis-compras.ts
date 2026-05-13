import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CompraResumenDTO,
  VentaApiService
} from '../../../../core/services/venta-api';

@Component({
  selector: 'app-mis-compras',
  templateUrl: './mis-compras.html',
  styleUrls: ['./mis-compras.scss'],
  standalone: false
})
export class MisComprasComponent implements OnInit {

  compras: CompraResumenDTO[] = [];
  loading = true;
  errorMsg = '';
  successMsg = '';

  enviandoCorreoId: number | null = null;
  descargandoPdfId: number | null = null;

  constructor(
    private ventaApi: VentaApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.ventaApi.listarMisCompras().subscribe({
      next: (compras) => {
        this.compras = compras;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar tus compras.';
      }
    });
  }

  descargarPdf(compra: CompraResumenDTO): void {
    this.descargandoPdfId = compra.ventaId;
    this.errorMsg = '';
    this.successMsg = '';

    this.ventaApi.descargarComprobantePdf(compra.ventaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `comprobante-cinemax-${compra.codigoVenta || compra.ventaId}.pdf`;
        link.click();

        window.URL.revokeObjectURL(url);
        this.descargandoPdfId = null;
      },
      error: (err) => {
        this.descargandoPdfId = null;
        this.errorMsg = err?.error?.message || 'No se pudo descargar el comprobante.';
      }
    });
  }

  enviarCorreo(compra: CompraResumenDTO): void {
    this.enviandoCorreoId = compra.ventaId;
    this.errorMsg = '';
    this.successMsg = '';

    this.ventaApi.enviarComprobanteEmail(compra.ventaId).subscribe({
      next: (res) => {
        this.enviandoCorreoId = null;
        this.successMsg = res?.mensaje || 'Comprobante enviado correctamente al correo.';
      },
      error: (err) => {
        this.enviandoCorreoId = null;
        this.errorMsg = err?.error?.message || 'No se pudo enviar el comprobante al correo.';
      }
    });
  }

  volverPeliculas(): void {
    this.router.navigate(['/peliculas']);
  }

  formatearDinero(total?: number): string {
    if (total === null || total === undefined) {
      return '—';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(total);
  }

  estadoVentaClase(estado?: string): string {
    return (estado || '').toLowerCase();
  }

  estadoPagoClase(estado?: string): string {
    return (estado || '').toLowerCase();
  }

  trackByCompra(_: number, compra: CompraResumenDTO): number {
    return compra.ventaId;
  }
}