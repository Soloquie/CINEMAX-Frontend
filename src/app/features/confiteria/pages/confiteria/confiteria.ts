import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import {
  ConfiteriaApiService,
  ProductoPublicDTO
} from '../../../../core/services/confiteria-api.service';

import {
  CarritoApiService,
  CarritoResponseDTO,
  CarritoItemResponseDTO
} from '../../../../core/services/carrito-api.service';

type CategoriaUI = 'ALL' | 'COMBO' | 'POPCORN' | 'DRINK' | 'CANDY';

@Component({
  selector: 'app-confiteria',
  templateUrl: './confiteria.html',
  styleUrls: ['./confiteria.scss'],
  standalone: false,
})
export class ConfiteriaComponent implements OnInit {
  loading = true;
  saving = false;
  errorMsg = '';

  productos: ProductoPublicDTO[] = [];
  cart: CarritoResponseDTO | null = null;

  selectedCategoria: CategoriaUI = 'ALL';
  search = '';

  // contexto de compra
  hasFuncionContext = false;
  funcionId: number | null = null;
  peliculaId: number | null = null;

  // datos para UI
  posterUrl: string | null = null;
  peliculaTitulo: string | null = null;
  cineNombre: string | null = null;
  salaNombre: string | null = null;
  inicioFuncion: string | null = null;

  categorias = [
    { key: 'ALL' as CategoriaUI, label: 'Todos', icon: 'apps' },
    { key: 'COMBO' as CategoriaUI, label: 'Combos', icon: 'fastfood' },
    { key: 'POPCORN' as CategoriaUI, label: 'Popcorn', icon: 'local_dining' },
    { key: 'DRINK' as CategoriaUI, label: 'Drinks', icon: 'local_bar' },
    { key: 'CANDY' as CategoriaUI, label: 'Candy', icon: 'icecream' },
  ];

  constructor(
    private confiteriaApi: ConfiteriaApiService,
    private carritoApi: CarritoApiService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const st: any = history.state;

    this.funcionId = st?.funcionId ? Number(st.funcionId) : null;
    this.peliculaId = st?.peliculaId ? Number(st.peliculaId) : null;

    this.posterUrl = st?.posterUrl ?? null;
    this.peliculaTitulo = st?.peliculaTitulo ?? null;
    this.cineNombre = st?.cineNombre ?? null;
    this.salaNombre = st?.salaNombre ?? null;
    this.inicioFuncion = st?.inicioFuncion ?? null;

    this.hasFuncionContext = !!(
      this.funcionId ||
      this.inicioFuncion ||
      this.peliculaTitulo
    );

    this.bootstrap();
  }

  // ---------------- carga inicial ----------------
  bootstrap(): void {
    this.loading = true;
    this.errorMsg = '';

    this.confiteriaApi.listarProductos().subscribe({
      next: (prods) => {
        this.productos = (prods || []).filter(p => p.activo);
        this.loadCart();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo cargar la confitería.';
        this.loading = false;
      }
    });
  }

  loadCart(): void {
    this.carritoApi.getMyCart().subscribe({
      next: (cart) => {
        this.cart = cart;

        // Si ya hay asientos en carrito, habilita el modo compra
        if (this.seatItems.length > 0) {
          this.hasFuncionContext = true;
        }

        // Si no vino contexto por state, toma el primero desde el carrito
        const firstSeat = this.seatItems[0];
        if (firstSeat) {
          this.peliculaTitulo = this.peliculaTitulo || firstSeat.peliculaTitulo || null;
          this.cineNombre = this.cineNombre || firstSeat.cineNombre || null;
          this.salaNombre = this.salaNombre || firstSeat.salaNombre || null;
          this.inicioFuncion = this.inicioFuncion || firstSeat.inicioFuncion || null;
          this.funcionId = this.funcionId || firstSeat.funcionId || null;
        }

        this.loading = false;
      },
      error: () => {
        // si falla carrito, igual deja explorar catálogo
        this.cart = null;
        this.loading = false;
      }
    });
  }

  // ---------------- filtros ----------------
  setCategoria(cat: CategoriaUI): void {
    this.selectedCategoria = cat;
  }

  get filteredProductos(): ProductoPublicDTO[] {
    const q = this.search.trim().toLowerCase();

    return this.productos.filter(p => {
      const matchCategoria =
        this.selectedCategoria === 'ALL' || p.categoria === this.selectedCategoria;

      const matchSearch =
        !q ||
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q);

      return matchCategoria && matchSearch;
    });
  }

incrementById(productId?: number | null): void {
  if (!productId) return;

  const producto = this.productos.find(prod => prod.id === productId);
  if (!producto) return;

  this.increment(producto);
}

  // ---------------- carrito ----------------
  get snackItems(): CarritoItemResponseDTO[] {
    return (this.cart?.items || []).filter(i => i.tipo === 'PRODUCTO');
  }

  get seatItems(): CarritoItemResponseDTO[] {
    return (this.cart?.items || []).filter(i => i.tipo === 'ASIENTO');
  }

  qtyInCart(productId: number): number {
    const item = this.snackItems.find(i => i.productoId === productId);
    return Number(item?.cantidad ?? 0);
  }

  snacksSubtotal(): number {
    return this.snackItems.reduce((acc, i) => acc + Number(i.subtotal ?? 0), 0);
  }

  ticketsSubtotal(): number {
    return this.seatItems.reduce((acc, i) => acc + Number(i.subtotal ?? i.precioUnitario ?? 0), 0);
  }

  totalGeneral(): number {
    return this.ticketsSubtotal() + this.snacksSubtotal();
  }

  totalSnackUnits(): number {
    return this.snackItems.reduce((acc, i) => acc + Number(i.cantidad ?? 0), 0);
  }

  // ---------------- acciones compra ----------------
  private blockPurchaseWithoutFuncion(): boolean {
    if (this.hasFuncionContext) return false;

    this.errorMsg = 'Primero debes seleccionar una función para poder comprar productos de confitería.';
    return true;
  }

  addProduct(p?: ProductoPublicDTO | null): void {
    if (!p || this.saving || p.stock <= 0) return;
    if (this.blockPurchaseWithoutFuncion()) return;

    this.saving = true;
    this.errorMsg = '';

    this.confiteriaApi.agregarProducto(p.id, 1).subscribe({
      next: () => {
        this.saving = false;
        this.loadCart();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo agregar el producto.';
        this.saving = false;
      }
    });
  }

  increment(p?: ProductoPublicDTO | null): void {
    if (!p || this.saving) return;
    if (this.blockPurchaseWithoutFuncion()) return;

    const current = this.qtyInCart(p.id);
    const next = current + 1;

    if (next > p.stock) return;

    this.saving = true;
    this.errorMsg = '';

    if (current === 0) {
      this.confiteriaApi.agregarProducto(p.id, 1).subscribe({
        next: () => {
          this.saving = false;
          this.loadCart();
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'No se pudo agregar el producto.';
          this.saving = false;
        }
      });
      return;
    }

    this.confiteriaApi.actualizarCantidad(p.id, next).subscribe({
      next: () => {
        this.saving = false;
        this.loadCart();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la cantidad.';
        this.saving = false;
      }
    });
  }

  decrement(productId?: number | null): void {
    if (!productId || this.saving) return;

    const current = this.qtyInCart(productId);
    if (current <= 0) return;

    this.saving = true;
    this.errorMsg = '';

    if (current === 1) {
      this.confiteriaApi.eliminarProducto(productId).subscribe({
        next: () => {
          this.saving = false;
          this.loadCart();
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'No se pudo eliminar el producto.';
          this.saving = false;
        }
      });
      return;
    }

    this.confiteriaApi.actualizarCantidad(productId, current - 1).subscribe({
      next: () => {
        this.saving = false;
        this.loadCart();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la cantidad.';
        this.saving = false;
      }
    });
  }

  removeProduct(productId?: number | null): void {
    if (!productId || this.saving) return;

    this.saving = true;
    this.errorMsg = '';

    this.confiteriaApi.eliminarProducto(productId).subscribe({
      next: () => {
        this.saving = false;
        this.loadCart();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo eliminar el producto.';
        this.saving = false;
      }
    });
  }

  // ---------------- navegación ----------------
  goBack(): void {
    this.location.back();
  }

  goCart(): void {
    this.router.navigate(['/carrito'], {
      state: {
        posterUrl: this.posterUrl,
        peliculaTitulo: this.peliculaTitulo,
        cineNombre: this.cineNombre,
        salaNombre: this.salaNombre,
        inicioFuncion: this.inicioFuncion,
      }
    });
  }

  goToMovies(): void {
    if (this.peliculaId) {
      this.router.navigate(['/peliculas', this.peliculaId, 'tickets']);
      return;
    }
    this.router.navigate(['/peliculas']);
  }

  // ---------------- helpers UI ----------------
  formatMoney(n: any): string {
    return Number(n ?? 0).toLocaleString('es-CO');
  }

  formatTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  stockLabel(p: ProductoPublicDTO): string {
    if (Number(p.stock) <= 0) return 'Agotado';
    if (Number(p.stock) <= 5) return 'Últimas unidades';
    return 'Disponible';
  }

  stockClass(p: ProductoPublicDTO): string {
    if (Number(p.stock) <= 0) return 'text-red-400';
    if (Number(p.stock) <= 5) return 'text-amber-300';
    return 'text-emerald-400';
  }

  showExploreBanner(): boolean {
    return !this.hasFuncionContext;
  }
}