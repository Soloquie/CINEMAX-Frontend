import { Component, OnInit } from '@angular/core';
import { AdminPeliculasApiService, PeliculaResponseDTO, PeliculaUpsertForm } from '../../../../core/services/admin/admin-peliculas.service';
import { CatalogoGenerosApiService, GeneroDTO } from '../../../../core/services/catalogo-generos.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.html',
  styleUrls: ['./movies.scss'],
  standalone: false,
})
export class MoviesComponent implements OnInit {
  loading = true;
  errorMsg = '';
  
  generos: GeneroDTO[] = [];
  generosLoading = false;

  peliculas: PeliculaResponseDTO[] = [];
  filtered: PeliculaResponseDTO[] = [];

  // filtros UI
  search = '';
  statusFilter: 'ALL' | 'NOW' | 'SOON' = 'ALL';

  // modal
  modalOpen = false;
  editingId: number | null = null;

  // form model
  form: PeliculaUpsertForm = {
    titulo: '',
    sinopsis: '',
    duracionMin: 90,
    clasificacion: 'PG-13',
    fechaEstreno: this.today(),
    activa: true,
    generoIds: [],
    poster: null,
  };

  posterPreview: string | null = null;

  constructor(private api: AdminPeliculasApiService, private generosApi: CatalogoGenerosApiService) {}

  ngOnInit(): void {
    this.load();
    this.loadGeneros();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.api.listar().subscribe({
      next: (list) => {
        this.peliculas = list || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudieron cargar las películas.';
        this.loading = false;
      },
    });
  }

  // -------- filters --------
  onSearch(value: string): void {
    this.search = value;
    this.applyFilters();
  }

  onStatusFilter(value: 'ALL' | 'NOW' | 'SOON'): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  private applyFilters(): void {
    const q = this.search.trim().toLowerCase();

    this.filtered = this.peliculas.filter((p) => {
      const matchText = !q || p.titulo.toLowerCase().includes(q);

      const estreno = p.fechaEstreno ? new Date(p.fechaEstreno) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let matchStatus = true;
      if (this.statusFilter === 'NOW') {
        matchStatus = !!p.activa && (!!estreno ? estreno <= today : true);
      }
      if (this.statusFilter === 'SOON') {
        matchStatus = !!p.activa && (!!estreno ? estreno > today : false);
      }

      return matchText && matchStatus;
    });
  }

  // -------- modal create/edit --------
  openCreate(): void {
    this.editingId = null;
    this.modalOpen = true;
    this.posterPreview = null;
    this.form = {
      titulo: '',
      sinopsis: '',
      duracionMin: 90,
      clasificacion: 'PG-13',
      fechaEstreno: this.today(),
      activa: true,
      generoIds: [],
      poster: null,
    };
  }

  openEdit(p: PeliculaResponseDTO): void {
    this.editingId = p.id;
    this.modalOpen = true;
    this.posterPreview = p.posterUrl || null;

    this.form = {
      titulo: p.titulo || '',
      sinopsis: p.sinopsis || '',
      duracionMin: p.duracionMin || 90,
      clasificacion: p.clasificacion || 'PG-13',
      fechaEstreno: p.fechaEstreno || this.today(),
      activa: !!p.activa,
      generoIds: (p.generos || []).map(g => g.id),
      poster: null, // solo si cambia
    };
  }

  loadGeneros(): void {
  this.generosLoading = true;
  this.generosApi.listarGeneros().subscribe({
    next: (list) => {
      this.generos = list || [];
      this.generosLoading = false;
    },
    error: () => {
      this.generos = [];
      this.generosLoading = false;
    },
  });
}

  closeModal(): void {
    this.modalOpen = false;
  }

  onPosterChange(file: File | null): void {
    this.form.poster = file;

    if (!file) {
      this.posterPreview = null;
      return;
    }

  const reader = new FileReader();
  reader.onload = () => (this.posterPreview = String(reader.result));
  reader.readAsDataURL(file);
}

  save(): void {
    if (!this.form.titulo.trim()) {
      this.errorMsg = 'El título es obligatorio.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const req$ = this.editingId
      ? this.api.actualizar(this.editingId, this.form)
      : this.api.crear(this.form);

    req$.subscribe({
      next: () => {
        this.modalOpen = false;
        this.load();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo guardar la película.';
        this.loading = false;
      },
    });
  }

  delete(p: PeliculaResponseDTO): void {
    const ok = confirm(`¿Eliminar "${p.titulo}"?`);
    if (!ok) return;

    this.loading = true;
    this.api.eliminar(p.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo eliminar.';
        this.loading = false;
      },
    });
  }

  // helpers
  formatStatus(p: PeliculaResponseDTO): 'Now Playing' | 'Coming Soon' | 'Inactive' {
    if (!p.activa) return 'Inactive';
    const estreno = p.fechaEstreno ? new Date(p.fechaEstreno) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (estreno && estreno > today) return 'Coming Soon';
    return 'Now Playing';
  }

  isGeneroSelected(id: number): boolean {
  return (this.form.generoIds || []).includes(id);
  }

  toggleGenero(id: number): void {
    const current = new Set(this.form.generoIds || []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.form.generoIds = Array.from(current);
  }

  today(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  generosTexto(p: { generos?: { nombre: string }[] }): string {
  const names = (p.generos || []).map(g => g.nombre).filter(Boolean);
  return names.length ? names.join(', ') : '—';
}


}