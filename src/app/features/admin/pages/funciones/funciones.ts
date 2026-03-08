import { Component, OnInit } from '@angular/core';
import { AdminFuncionesApiService, FuncionResponseDTO, FuncionUpsertDTO } from '../../../../core/services/admin/admin-funciones-api.service';
import { AdminCinesApiService, CineResponseDTO } from '../../../../core/services/admin/admin-cines-api.service';
import { AdminPeliculasApiService, PeliculaResponseDTO } from '../../../../core/services/admin/admin-peliculas.service';
import { CatalogoGenerosApiService } from '../../../../core/services/catalogo-generos.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { from } from 'rxjs';

interface SalaPublicDTO {
  id: number;
  nombre: string;
  tipo: string;
  activa: boolean;
}

@Component({
  selector: 'app-funciones',
  templateUrl: './funciones.html',
  styleUrls: ['./funciones.scss'],
  standalone: false,
})
export class FuncionesComponent implements OnInit {
  loading = true;
  errorMsg = '';

  salasLoading = false;
  salasError = '';

  modalErrorMsg = '';
  fieldErrors: Record<string, string> = {};

  funciones: FuncionResponseDTO[] = [];
  filtered: FuncionResponseDTO[] = [];

  // filtros
  q = '';
  cineId: number | 'ALL' = 'ALL';
  peliculaId: number | 'ALL' = 'ALL';

  // data selects
  cines: CineResponseDTO[] = [];
  peliculas: PeliculaResponseDTO[] = [];
  salas: SalaPublicDTO[] = [];

  // modal
  modalOpen = false;
  editingId: number | null = null;

  // form (datetime-local sin segundos, lo convertimos al guardar)
  form = {
    peliculaId: 0,
    cineId: 0,
    salaId: 0,
    inicioLocal: '', // yyyy-MM-ddTHH:mm
    finLocal: '',    // yyyy-MM-ddTHH:mm (opcional)
    idioma: 'ES',
    subtitulos: false,
    precioBase: 15000,
  };

  constructor(
    private funcionesApi: AdminFuncionesApiService,
    private cinesApi: AdminCinesApiService,
    private peliculasApi: AdminPeliculasApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.bootstrap();
  }

  bootstrap(): void {
    this.loading = true;
    this.errorMsg = '';

    this.cinesApi.listar().subscribe({
      next: (c) => (this.cines = c || []),
      error: () => (this.cines = []),
    });

    this.peliculasApi.listar().subscribe({
      next: (p) => (this.peliculas = p || []),
      error: () => (this.peliculas = []),
    });

    this.loadFunciones();
  }

  loadFunciones(): void {
    this.loading = true;
    this.errorMsg = '';
    this.funcionesApi.listar().subscribe({
      next: (list) => {
        this.funciones = list || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudieron cargar las funciones.';
        this.loading = false;
      },
    });
  }

  // ------- filtros -------
  applyFilters(): void {
    const q = this.q.trim().toLowerCase();
    this.filtered = this.funciones.filter((f) => {
      const matchQ = !q || (f.peliculaTitulo || '').toLowerCase().includes(q) || (f.cineNombre || '').toLowerCase().includes(q);
      const matchCine = this.cineId === 'ALL' || f.cineId === this.cineId;
      const matchPel = this.peliculaId === 'ALL' || f.peliculaId === this.peliculaId;
      return matchQ && matchCine && matchPel;
    });
  }

  onSearch(v: string) {
    this.q = v;
    this.applyFilters();
  }

  onCineFilter(v: string) {
    this.cineId = v === 'ALL' ? 'ALL' : Number(v);
    this.applyFilters();
  }

  onPeliculaFilter(v: string) {
    this.peliculaId = v === 'ALL' ? 'ALL' : Number(v);
    this.applyFilters();
  }

loadSalasPorCine(cineId: number): void {
  if (!cineId) {
    this.salas = [];
    return;
  }

  this.salasLoading = true;
  this.salasError = '';
  this.salas = [];
  this.form.salaId = 0;

  this.http.get<any[]>(`${environment.apiBaseUrl}/api/admin/cines/${cineId}/salas`)
    .subscribe({
      next: (list) => {
        const all = list || [];
        this.salas = all
          .filter(s => s.activa !== false) // solo activas
          .map(s => ({ id: s.id, nombre: s.nombre, tipo: s.tipo, activa: s.activa }));

        this.salasLoading = false;
      },
      error: (err) => {
        this.salasLoading = false;
        this.salasError = 'No se pudieron cargar las salas.';
        this.salas = [];
      }
    });
}

  // ------- modal -------
  openCreate(): void {
    this.editingId = null;
    this.modalOpen = true;

    const firstCine = this.cines[0]?.id || 0;
    const firstPeli = this.peliculas[0]?.id || 0;

    this.form = {
      peliculaId: firstPeli,
      cineId: firstCine,
      salaId: 0,
      inicioLocal: this.nowLocal(),
      finLocal: '',
      idioma: 'ES',
      subtitulos: false,
      precioBase: 15000,
    };

    if (firstCine) this.loadSalasPorCine(firstCine);
  }

  openEdit(f: FuncionResponseDTO): void {
    this.editingId = f.id;
    this.modalOpen = true;

    this.form = {
      peliculaId: f.peliculaId,
      cineId: f.cineId,
      salaId: f.salaId,
      inicioLocal: this.toLocalInput(f.inicio),
      finLocal: f.fin ? this.toLocalInput(f.fin) : '',
      idioma: f.idioma || 'ES',
      subtitulos: !!f.subtitulos,
      precioBase: (f.precioBase ?? 0) as any,
    };

  if (this.form.cineId) this.loadSalasPorCine(this.form.cineId);  }

  closeModal(): void {
    this.modalOpen = false;
  }

  onCineChangeInForm(v: string): void {
    const id = Number(v);
    this.form.cineId = id;
    this.form.salaId = 0;
    this.loadSalasPorCine(id);
  }

  save(): void {
  if (!this.validateModalForm()) return;


    const dto: FuncionUpsertDTO = {
      peliculaId: this.form.peliculaId,
      salaId: this.form.salaId,
      inicio: this.withSeconds(this.form.inicioLocal),
      fin: this.form.finLocal ? this.withSeconds(this.form.finLocal) : null,
      idioma: this.form.idioma || null,
      subtitulos: !!this.form.subtitulos,
      precioBase: this.form.precioBase ?? null,
    };

    this.loading = true;
    this.errorMsg = '';

    const req$ = this.editingId
      ? this.funcionesApi.actualizar(this.editingId, dto)
      : this.funcionesApi.crear(dto);

    req$.subscribe({
      next: () => {
        this.modalOpen = false;
        this.loadFunciones();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo guardar la función.';
        this.loading = false;
      },
    });
  }

  cancelar(f: FuncionResponseDTO): void {
    const ok = confirm(`¿Cancelar la función de "${f.peliculaTitulo}" en "${f.cineNombre}"?`);
    if (!ok) return;

    this.loading = true;
    this.funcionesApi.cancelar(f.id).subscribe({
      next: () => this.loadFunciones(),
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo cancelar.';
        this.loading = false;
      },
    });
  }

  // ------- helpers datetime -------
  private withSeconds(dtLocal: string): string {
    // dtLocal: yyyy-MM-ddTHH:mm  -> yyyy-MM-ddTHH:mm:ss
    return dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
  }

  private toLocalInput(iso: string): string {
    // iso puede venir "2026-03-07T17:30:00"
    return iso ? iso.substring(0, 16) : '';
  }

  private nowLocal(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${mm}`;
  }

  formatMoney(value: any): string {
    const n = Number(value ?? 0);
    return n.toLocaleString('es-CO');
  }

  private setFieldError(key: string, msg: string) {
  this.fieldErrors[key] = msg;
}

  private clearModalErrors() {
    this.modalErrorMsg = '';
    this.fieldErrors = {};
  }

  private validateModalForm(): boolean {
  this.clearModalErrors();

  if (!this.form.peliculaId) this.setFieldError('peliculaId', 'Selecciona una película.');
  if (!this.form.cineId) this.setFieldError('cineId', 'Selecciona un cine.');
  if (!this.form.salaId) this.setFieldError('salaId', 'Selecciona una sala.');
  if (!this.form.inicioLocal) this.setFieldError('inicioLocal', 'Selecciona fecha/hora de inicio.');

  if (this.form.precioBase === null || this.form.precioBase === undefined || Number(this.form.precioBase) <= 0) {
    this.setFieldError('precioBase', 'El precio debe ser mayor a 0.');
  }

  if (this.form.finLocal && this.form.inicioLocal) {
    const ini = new Date(this.withSeconds(this.form.inicioLocal));
    const fin = new Date(this.withSeconds(this.form.finLocal));
    if (fin <= ini) this.setFieldError('finLocal', 'La hora fin debe ser mayor que la hora inicio.');
  }

  const ok = Object.keys(this.fieldErrors).length === 0;
  if (!ok) this.modalErrorMsg = 'Revisa los campos marcados.';
  return ok;
}
}