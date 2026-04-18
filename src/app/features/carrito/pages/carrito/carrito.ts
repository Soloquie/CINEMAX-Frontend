import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  CarritoApiService,
  CarritoResponseDTO,
  CarritoItemResponseDTO
} from '../../../../core/services/carrito-api.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss'],
  standalone: false,
})
export class CarritoComponent implements OnInit {
  loading = true;
  errorMsg = '';

  cart: CarritoResponseDTO | null = null;
  items: CarritoItemResponseDTO[] = [];

  posterUrl: string | null = null;

  movieTitle = '—';
  cineNombre = '—';
  salaNombre = '—';
  inicioFuncion: string | null = null;

  expiraEn: string | null = null;

  // resumen separado
  ticketItems: CarritoItemResponseDTO[] = [];
  snackItems: CarritoItemResponseDTO[] = [];

  ticketsCount = 0;
  snacksCount = 0;

  ticketsTotal = 0;
  snacksTotal = 0;
  total = 0;

  constructor(
    private api: CarritoApiService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const st: any = history.state;
    this.posterUrl = st?.posterUrl ?? null;

    this.loadCart();
  }

  private loadCart(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getMyCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.items = cart?.items || [];
        this.expiraEn = cart?.expiraEn || null;

        this.computeSummary();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;

        if (err.status === 401) {
          this.router.navigate(['/auth/login']);
          return;
        }

        this.cart = null;
        this.items = [];
        this.errorMsg = 'No se pudo cargar tu carrito.';
      },
    });
  }

  private computeSummary(): void {
    this.ticketItems = this.items.filter(i => i.tipo === 'ASIENTO');
    this.snackItems = this.items.filter(i => i.tipo === 'PRODUCTO');

    this.ticketsCount = this.ticketItems.length;
    this.snacksCount = this.snackItems.reduce((acc, it) => acc + Number(it.cantidad ?? 0), 0);

    this.ticketsTotal = this.ticketItems.reduce(
      (acc, it) => acc + Number(it.subtotal ?? it.precioUnitario ?? 0),
      0
    );

    this.snacksTotal = this.snackItems.reduce(
      (acc, it) => acc + Number(it.subtotal ?? (Number(it.precioUnitario ?? 0) * Number(it.cantidad ?? 1))),
      0
    );

    this.total = this.ticketsTotal + this.snacksTotal;

    if (this.ticketItems.length === 0) {
      this.movieTitle = '—';
      this.cineNombre = '—';
      this.salaNombre = '—';
      this.inicioFuncion = null;
      return;
    }

    const firstTicket = this.ticketItems[0];
    this.movieTitle = firstTicket.peliculaTitulo || '—';
    this.cineNombre = firstTicket.cineNombre || '—';
    this.salaNombre = firstTicket.salaNombre || '—';
    this.inicioFuncion = firstTicket.inicioFuncion || null;
  }

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/peliculas']);
  }

  backToSeats(): void {
    this.location.back();
  }

  proceedToPayment(): void {
    alert('Pago: lo conectamos en el siguiente paso');
  }

  removeItem(item: CarritoItemResponseDTO): void {
    this.loading = true;
    this.errorMsg = '';

    if (item.tipo === 'ASIENTO' && item.funcionAsientoId) {
      this.api.removeSeats([item.funcionAsientoId]).subscribe({
        next: () => this.loadCart(),
        error: (err: HttpErrorResponse) => {
          this.loading = false;

          if (err.status === 401) {
            this.router.navigate(['/auth/login']);
            return;
          }

          this.errorMsg = err?.error?.message || 'No se pudo eliminar la boleta del carrito.';
        },
      });
      return;
    }

    if (item.tipo === 'PRODUCTO' && item.productoId) {
      this.api.removeProducto(item.productoId).subscribe({
        next: () => this.loadCart(),
        error: (err: HttpErrorResponse) => {
          this.loading = false;

          if (err.status === 401) {
            this.router.navigate(['/auth/login']);
            return;
          }

          this.errorMsg = err?.error?.message || 'No se pudo eliminar el producto de confitería.';
        },
      });
      return;
    }

    this.loading = false;
  }

  seatsText(limit = 10): string {
    const seats = this.ticketItems.map(i => `${i.fila || ''}${i.numero ?? ''}`).filter(Boolean);
    const shown = seats.slice(0, limit).join(', ');
    return seats.length > limit ? `${shown} +${seats.length - limit}` : (shown || '—');
  }

  isMultiFuncion(): boolean {
    const ids = new Set(this.ticketItems.map(i => i.funcionId).filter(Boolean));
    return ids.size > 1;
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  formatTime(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatIso(iso?: string | null): string {
    return iso ? iso.replace('T', ' ') : '—';
  }

  money(n: any): string {
    const num = Number(n ?? 0);
    return num.toLocaleString('es-CO');
  }
}