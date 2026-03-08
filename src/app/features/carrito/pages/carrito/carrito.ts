import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { CarritoApiService, CarritoResponseDTO, CarritoItemResponseDTO } from '../../../../core/services/carrito-api.service';

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

  ticketsCount = 0;
  total = 0;

  movieTitle = '—';
  cineNombre = '—';
  salaNombre = '—';
  inicioFuncion: string | null = null;

  // expiración
  expiraEn: string | null = null;

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
    this.ticketsCount = this.items.length;
    this.total = this.items.reduce((acc, it) => acc + Number(it.precioUnitario ?? 0), 0);

    if (this.items.length === 0) {
      this.movieTitle = '—';
      this.cineNombre = '—';
      this.salaNombre = '—';
      this.inicioFuncion = null;
      return;
    }

    const first = this.items[0];
    this.movieTitle = first.peliculaTitulo || '—';
    this.cineNombre = first.cineNombre || '—';
    this.salaNombre = first.salaNombre || '—';
    this.inicioFuncion = first.inicioFuncion || null;
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
    alert('Pago: lo conectamos en el siguiente paso ');
  }

  seatsText(limit = 10): string {
    const seats = this.items.map(i => `${i.fila}${i.numero}`);
    const shown = seats.slice(0, limit).join(', ');
    return seats.length > limit ? `${shown} +${seats.length - limit}` : (shown || '—');
  }

  isMultiFuncion(): boolean {
    const ids = new Set(this.items.map(i => i.funcionId));
    return ids.size > 1;
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  formatTime(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  money(n: any): string {
    const num = Number(n ?? 0);
    return num.toLocaleString('es-CO');
  }
}