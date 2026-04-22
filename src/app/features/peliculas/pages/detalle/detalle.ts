import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CatalogoApiService,
  CinePublicDTO,
  PeliculaDetailDTO
} from '../../../../core/services/catalogo-api.service';

import {
  FuncionesApiService,
  FuncionPublicDTO
} from '../../../../core/services/funciones-api.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.html',
  styleUrls: ['./detalle.scss'],
  standalone: false,
})
export class DetalleComponent implements OnInit {
  loading = true;
  errorMsg = '';

  peliculaId!: number;
  pelicula: PeliculaDetailDTO | null = null;

  cines: CinePublicDTO[] = [];
  cinesDisponibles: CinePublicDTO[] = [];
  selectedCineId: number | null = null;

  allFunciones: FuncionPublicDTO[] = [];
  filteredFunciones: FuncionPublicDTO[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogoApi: CatalogoApiService,
    private funcionesApi: FuncionesApiService
  ) {}

  ngOnInit(): void {
    this.peliculaId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBase();
  }

  private loadBase(): void {
    this.loading = true;
    this.errorMsg = '';

    this.catalogoApi.detallePelicula(this.peliculaId).subscribe({
      next: (p) => (this.pelicula = p),
      error: () => {
        this.pelicula = null;
        this.errorMsg = 'No se pudo cargar la película.';
      },
    });

    this.catalogoApi.listarCines(undefined, 0, 50).subscribe({
      next: (resp) => {
        this.cines = resp.content || [];
        this.recomputeCinesDisponibles();
      },
      error: () => {
        this.cines = [];
        this.recomputeCinesDisponibles();
      },
    });

    this.funcionesApi.listar(undefined, undefined, this.peliculaId).subscribe({
      next: (list) => {
        this.allFunciones = (list || []).filter(f => (f.estado || '').toUpperCase() !== 'CANCELADA');
        this.recomputeCinesDisponibles();

        if (!this.selectedCineId && this.cinesDisponibles.length) {
          this.selectedCineId = this.cinesDisponibles[0].id;
        }

        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.allFunciones = [];
        this.filteredFunciones = [];
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar las funciones.';
      },
    });
  }

  private recomputeCinesDisponibles(): void {
    if (!this.cines.length || !this.allFunciones.length) {
      this.cinesDisponibles = [];
      return;
    }

    const ids = new Set(this.allFunciones.map(f => f.cineId));
    this.cinesDisponibles = this.cines.filter(c => ids.has(c.id));
  }

  onCineChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    if (!this.selectedCineId) {
      this.filteredFunciones = [...this.allFunciones];
      return;
    }

    this.filteredFunciones = this.allFunciones.filter(f => f.cineId === this.selectedCineId);
  }

  goBack(): void {
    this.router.navigate(['/peliculas']);
  }

  goBuyTickets(): void {
    this.router.navigate(['/peliculas', this.peliculaId, 'tickets']);
  }

  goDirectToSeats(funcion: FuncionPublicDTO): void {
    this.router.navigate(
      ['/peliculas', this.peliculaId, 'tickets', funcion.id, 'asientos'],
      {
        state: {
          posterUrl: this.pelicula?.posterUrl || null,
          peliculaTitulo: this.pelicula?.titulo || null,
          cineNombre: funcion.cineNombre,
          salaNombre: funcion.salaNombre,
          inicioFuncion: funcion.inicio,
        },
      }
    );
  }

  generosTexto(): string {
    const gens = this.pelicula?.generos || [];
    return gens.length ? gens.map(g => g.nombre).join(', ') : '—';
  }

  formatMoney(n: any): string {
    const num = Number(n ?? 0);
    return num.toLocaleString('es-CO');
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  durationLabel(): string {
    const min = Number(this.pelicula?.duracionMin ?? 0);
    if (!min) return '—';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }

  selectedCineNombre(): string {
    const c = this.cinesDisponibles.find(x => x.id === this.selectedCineId);
    return c ? `${c.nombre}${c.ciudad ? ' • ' + c.ciudad : ''}` : 'Selecciona un cine';
  }
}