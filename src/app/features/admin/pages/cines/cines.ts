import { Component, OnInit } from '@angular/core';
import { AdminCinesApiService, CineResponseDTO, CineUpsertDTO } from '../../../../core/services/admin/admin-cines-api.service';
import { AdminSalasApiService, SalaResponseDTO, SalaUpsertDTO, TipoSala } from '../../../../core/services/admin/admin-salas-api.service';
import { AdminAsientosApiService, AsientosGenerarDTO, TipoAsiento, AsientoPosDTO } from '../../../../core/services/admin/admin-asientos-api.service';

@Component({
  selector: 'app-cines',
  templateUrl: './cines.html',
  styleUrls: ['./cines.scss'],
  standalone: false,
})
export class CinesComponent implements OnInit {
  loading = false;
  errorMsg = '';

  cines: CineResponseDTO[] = [];
  selectedCine: CineResponseDTO | null = null;

  salas: SalaResponseDTO[] = [];

  // ---- Modales ----
  cineModalOpen = false;
  cineEditingId: number | null = null;
  cineForm: CineUpsertDTO = { nombre: '', ciudad: '', direccion: '', activo: true };

  salaModalOpen = false;
  salaEditingId: number | null = null;
  salaForm: SalaUpsertDTO = { nombre: '', tipo: 'STANDARD' as TipoSala, activa: true };

  asientosModalOpen = false;
  asientosSala: SalaResponseDTO | null = null;

  filasText = 'A,B,C,D,E';
  vipFilasText = '';
  discapacidadText = ''; // formato: A1,A2,B3
  asientosPorFila = 10;
  tipoDefault: TipoAsiento = 'STANDARD';
  desactivarFuera = true;
  asientosViewOpen = false;
  asientosLoading = false;
  asientosError = '';

  asientosSalaView: SalaResponseDTO | null = null;
  asientos: any[] = []; 
  gridRows: string[] = [];
  gridCols: number[] = [];
  seatMap = new Map<string, any>(); 

  tipoSalaOptions: TipoSala[] = ['STANDARD', 'VIP'];
  tipoAsientoOptions: TipoAsiento[] = ['STANDARD', 'VIP', 'DISCAPACIDAD'];

  constructor(
    private cinesApi: AdminCinesApiService,
    private salasApi: AdminSalasApiService,
    private asientosApi: AdminAsientosApiService
  ) {}

  ngOnInit(): void {
    this.loadCines();
  }

  // -------- CINES --------
  loadCines(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cinesApi.listar().subscribe({
      next: (list) => {
        this.cines = list || [];
        this.loading = false;

        // autoseleccionar el primero
        if (!this.selectedCine && this.cines.length) {
          this.selectCine(this.cines[0]);
        }
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los cines.';
        this.loading = false;
      },
    });
  }

  selectCine(c: CineResponseDTO): void {
    this.selectedCine = c;
    this.loadSalas(c.id);
  }

  openCineCreate(): void {
    this.cineEditingId = null;
    this.cineForm = { nombre: '', ciudad: '', direccion: '', activo: true };
    this.cineModalOpen = true;
  }

  openCineEdit(c: CineResponseDTO): void {
    this.cineEditingId = c.id;
    this.cineForm = {
      nombre: c.nombre,
      ciudad: c.ciudad,
      direccion: c.direccion,
      activo: !!c.activo,
    };
    this.cineModalOpen = true;
  }

  saveCine(): void {
    if (!this.cineForm.nombre.trim() || !this.cineForm.ciudad.trim() || !this.cineForm.direccion.trim()) {
      this.errorMsg = 'Nombre, ciudad y dirección son obligatorios.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const req$ = this.cineEditingId
      ? this.cinesApi.actualizar(this.cineEditingId, this.cineForm)
      : this.cinesApi.crear(this.cineForm);

    req$.subscribe({
      next: () => {
        this.cineModalOpen = false;
        this.loadCines();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo guardar el cine.';
        this.loading = false;
      },
    });
  }

  deleteCine(c: CineResponseDTO): void {
    const ok = confirm(`¿Eliminar el cine "${c.nombre}"? (Esto puede afectar salas/funciones)`);
    if (!ok) return;

    this.loading = true;
    this.cinesApi.eliminar(c.id).subscribe({
      next: () => {
        if (this.selectedCine?.id === c.id) {
          this.selectedCine = null;
          this.salas = [];
        }
        this.loadCines();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo eliminar el cine.';
        this.loading = false;
      },
    });
  }

  // -------- SALAS --------
  loadSalas(cineId: number): void {
    this.loading = true;
    this.errorMsg = '';
    this.salasApi.listarPorCine(cineId).subscribe({
      next: (list) => {
        this.salas = list || [];
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudieron cargar las salas.';
        this.loading = false;
      },
    });
  }

  openSalaCreate(): void {
    if (!this.selectedCine) return;
    this.salaEditingId = null;
    this.salaForm = { nombre: '', tipo: this.tipoSalaOptions[0] || ('STANDARD' as TipoSala), activa: true };
    this.salaModalOpen = true;
  }

  openSalaEdit(s: SalaResponseDTO): void {
    this.salaEditingId = s.id;
    this.salaForm = { nombre: s.nombre, tipo: s.tipo, activa: !!s.activa };
    this.salaModalOpen = true;
  }

  saveSala(): void {
    if (!this.selectedCine) return;
    if (!this.salaForm.nombre.trim()) {
      this.errorMsg = 'El nombre de la sala es obligatorio.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const req$ = this.salaEditingId
      ? this.salasApi.actualizar(this.salaEditingId, this.salaForm)
      : this.salasApi.crear(this.selectedCine.id, this.salaForm);

    req$.subscribe({
      next: () => {
        this.salaModalOpen = false;
        this.loadSalas(this.selectedCine!.id);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo guardar la sala.';
        this.loading = false;
      },
    });
  }

  deleteSala(s: SalaResponseDTO): void {
    const ok = confirm(`¿Eliminar la sala "${s.nombre}"?`);
    if (!ok) return;

    this.loading = true;
    this.salasApi.eliminar(s.id).subscribe({
      next: () => {
        this.loadSalas(this.selectedCine!.id);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo eliminar la sala.';
        this.loading = false;
      },
    });
  }

  // -------- ASIENTOS (GENERAR) --------
  openGenerarAsientos(s: SalaResponseDTO): void {
    this.asientosSala = s;
    this.asientosModalOpen = true;

    // defaults
    this.filasText = 'A,B,C,D,E';
    this.asientosPorFila = 10;
    this.tipoDefault = 'STANDARD';
    this.vipFilasText = '';
    this.discapacidadText = '';
    this.desactivarFuera = true;
  }

  generarAsientos(): void {
    if (!this.asientosSala) return;

    const filas = this.csvToList(this.filasText);
    const vipFilas = this.csvToList(this.vipFilasText);
    const discapacidad = this.parseDiscapacidad(this.discapacidadText);

    const dto: AsientosGenerarDTO = {
      filas,
      asientosPorFila: Number(this.asientosPorFila || 0),
      tipoDefault: this.tipoDefault,
      vipFilas,
      discapacidad,
      desactivarFuera: !!this.desactivarFuera,
    };

    if (!dto.filas.length || dto.asientosPorFila < 1) {
      this.errorMsg = 'Debes colocar al menos 1 fila y asientosPorFila >= 1.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.asientosApi.generar(this.asientosSala.id, dto).subscribe({
next: () => {
  this.asientosModalOpen = false;
  this.loading = false;

  const salaId = this.asientosSala?.id;
  if (salaId) {
    this.openVerAsientos(this.asientosSala!);
  } else {
    alert('Asientos generados correctamente.');
  }
},
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudieron generar los asientos.';
        this.loading = false;
      },
    });
  }

  private csvToList(text: string): string[] {
    return (text || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
  }

  // formato input: "A1,A2,B3" -> [{fila:'A',numero:1},...]
  private parseDiscapacidad(text: string): AsientoPosDTO[] {
    const raw = this.csvToList(text);
    const out: AsientoPosDTO[] = [];
    for (const item of raw) {
      const m = item.match(/^([A-Z]+)(\d+)$/);
      if (!m) continue;
      out.push({ fila: m[1], numero: Number(m[2]) });
    }
    return out;
  }

  openVerAsientos(s: SalaResponseDTO): void {
  this.asientosSalaView = s;
  this.asientosViewOpen = true;
  this.loadAsientos(s.id);
}

private loadAsientos(salaId: number): void {
  this.asientosLoading = true;
  this.asientosError = '';
  this.seatMap.clear();

  this.asientosApi.listarPorSala(salaId).subscribe({
    next: (list) => {
      this.asientos = list || [];

      // filas únicas ordenadas (A, B, C...)
      const filas = Array.from(new Set(this.asientos.map(a => (a.fila || '').toUpperCase()))).sort();

      // max número de asiento
      const maxN = this.asientos.reduce((m, a) => Math.max(m, Number(a.numero || 0)), 0);

      this.gridRows = filas;
      this.gridCols = Array.from({ length: maxN }, (_, i) => i + 1);

      for (const a of this.asientos) {
        const key = `${String(a.fila).toUpperCase()}-${a.numero}`;
        this.seatMap.set(key, a);
      }

      this.asientosLoading = false;
    },
    error: (err) => {
      this.asientosError = err?.error?.message || 'No se pudieron cargar los asientos.';
      this.asientosLoading = false;
    },
  });
}

seatClass(fila: string, col: number): string {
  const a = this.seatMap.get(`${fila}-${col}`);

  if (!a) return 'bg-white/5 border-white/10 text-slate-600'; // vacío (si faltan)

  if (!a.activo) return 'bg-slate-800/60 border-white/10 text-slate-500'; // desactivado

  if (a.tipo === 'VIP') return 'bg-primary/20 border-primary/30 text-primary';
  if (a.tipo === 'DISCAPACIDAD') return 'bg-blue-500/20 border-blue-400/30 text-blue-200';

  return 'bg-green-500/10 border-green-500/20 text-green-200'; // STANDARD
}

seatTooltip(fila: string, col: number): string {
  const a = this.seatMap.get(`${fila}-${col}`);
  if (!a) return '';
  return `${a.fila}${a.numero} • ${a.tipo} • ${a.activo ? 'Activo' : 'Inactivo'}`;
}
}