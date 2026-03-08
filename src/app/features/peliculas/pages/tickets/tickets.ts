import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CatalogoApiService,
  CinePublicDTO,
  PeliculaDetailDTO,
} from '../../../../core/services/catalogo-api.service';

import { FuncionesApiService, FuncionPublicDTO } from '../../../../core/services/funciones-api.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.html',
  styleUrls: ['./tickets.scss'],
  standalone: false,
})
export class TicketsComponent implements OnInit {
  loading = true;
  errorMsg = '';

  peliculaId!: number;
  pelicula: PeliculaDetailDTO | null = null;

  // filtros
  cines: CinePublicDTO[] = [];
  cinesDisponibles: CinePublicDTO[] = [];
  selectedCineId: number | null = null;

  // ✅ FECHA OPCIONAL
  selectedDate: string | null = null;
  availableDates: string[] = [];

  // funciones
  allFunciones: FuncionPublicDTO[] = [];
  filteredFunciones: FuncionPublicDTO[] = [];

  selectedFuncion: FuncionPublicDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogoApi: CatalogoApiService,
    private funcionesApi: FuncionesApiService
  ) {}

  ngOnInit(): void {
    this.peliculaId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadPelicula();
    this.loadCines();
    this.loadFuncionesAll();
  }

  // ---------- carga base ----------
  private loadPelicula(): void {
    this.catalogoApi.detallePelicula(this.peliculaId).subscribe({
      next: (p) => (this.pelicula = p),
      error: () => (this.pelicula = null),
    });
  }

  private loadCines(): void {
    this.catalogoApi.listarCines().subscribe({
      next: (cines) => {
        this.cines = cines || [];
        this.recomputeCinesDisponibles(); // ✅ depende de allFunciones + selectedDate
      },
      error: () => {
        this.cines = [];
        this.recomputeCinesDisponibles();
      },
    });
  }

  private loadFuncionesAll(): void {
    this.loading = true;
    this.errorMsg = '';
    this.selectedFuncion = null;

    // ✅ sin fecha y sin cine: trae todas las funciones de esa película
    this.funcionesApi.listar(undefined, undefined, this.peliculaId).subscribe({
      next: (list) => {
        this.allFunciones = list || [];
        this.availableDates = this.computeAvailableDates(this.allFunciones);

        // ✅ NO seleccionar fecha por defecto
        this.selectedDate = null;

        this.recomputeCinesDisponibles();
        this.applyFilters();

        this.loading = false;
      },
      error: () => {
        this.allFunciones = [];
        this.availableDates = [];
        this.filteredFunciones = [];
        this.errorMsg = 'No se pudieron cargar las funciones.';
        this.loading = false;
      },
    });
  }

  // ---------- filtros UI ----------
  selectCine(id: number | null): void {
    this.selectedCineId = id;
    this.selectedFuncion = null;
    this.applyFilters();
  }

  selectDate(dateIso: string | null): void {
    this.selectedDate = dateIso;
    this.selectedFuncion = null;

    this.recomputeCinesDisponibles();

    if (this.selectedCineId != null && !this.cinesDisponibles.some(c => c.id === this.selectedCineId)) {
      this.selectedCineId = null;
    }

    this.applyFilters();
  }

  private applyFilters(): void {
    let list = [...this.allFunciones];

    if (this.selectedDate) {
      list = list.filter((f) => (f.inicio || '').startsWith(this.selectedDate!));
    }

    if (this.selectedCineId != null) {
      list = list.filter((f) => f.cineId === this.selectedCineId);
    }

    // orden por fecha/hora
    list.sort((a, b) => (a.inicio || '').localeCompare(b.inicio || ''));

    this.filteredFunciones = list;
  }

  // ✅ cines disponibles según filtros (fecha opcional)
  private recomputeCinesDisponibles(): void {
    if (!this.allFunciones || this.allFunciones.length === 0) {
      this.cinesDisponibles = [...this.cines];
      return;
    }

    let base = [...this.allFunciones];
    if (this.selectedDate) {
      base = base.filter((f) => (f.inicio || '').startsWith(this.selectedDate!));
    }

    const cineIds = new Set(base.map((f) => f.cineId));
    this.cinesDisponibles = this.cines.filter((c) => cineIds.has(c.id));
  }

  private computeAvailableDates(funciones: FuncionPublicDTO[]): string[] {
    const set = new Set<string>();
    for (const f of funciones) {
      if (f.inicio && f.inicio.length >= 10) set.add(f.inicio.substring(0, 10));
    }
    return Array.from(set).sort(); // yyyy-MM-dd
  }

  // ---------- acciones ----------
  goHome(): void {
    this.router.navigate(['/peliculas']);
  }

  selectFuncion(f: FuncionPublicDTO): void {
    this.selectedFuncion = f;
  }

  goToSeats(): void {
    if (!this.selectedFuncion) return;
    this.router.navigate(['/peliculas', this.peliculaId, 'tickets', this.selectedFuncion.id, 'asientos']);
  }

  // ---------- helpers ----------
  formatTime(inicioIso: string): string {
    if (!inicioIso) return '—';
    const t = inicioIso.indexOf('T');
    if (t >= 0 && inicioIso.length >= t + 6) return inicioIso.substring(t + 1, t + 6);
    return inicioIso;
  }

  formatMoney(n: any): string {
    const num = Number(n ?? 0);
    return num.toLocaleString('es-CO');
  }

  // ✅ fecha "YYYY-MM-DD" desde inicio
  fechaDeFuncion(inicioIso: string): string {
    return inicioIso?.length >= 10 ? inicioIso.substring(0, 10) : '—';
  }

  generosTexto(): string {
    const gens = this.pelicula?.generos || [];
    return gens.length ? gens.map((g) => g.nombre).join(', ') : '—';
  }

  dateChipLabel(dateIso: string): string {
    const d = new Date(dateIso + 'T00:00:00');
    const m = d.toLocaleString('es-CO', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    return `${m} ${day}`;
  }
}