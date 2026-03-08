import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AsientosApiService, FuncionAsientoResponseDTO } from '../../../../core/services/asientos-api.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

type SeatVM = FuncionAsientoResponseDTO & {
  label: string; // e.g. A1
};

@Component({
  selector: 'app-asientos',
  templateUrl: './asientos.html',
  styleUrls: ['./asientos.scss'],
  standalone: false,
})
export class AsientosComponent implements OnInit, OnDestroy {
  loading = true;
  errorMsg = '';

  peliculaId!: number;
  funcionId!: number;

  // datos
  seats: SeatVM[] = [];
  rows: string[] = [];
  maxCols = 0;

  // grid: row -> col -> seat|null
  grid = new Map<string, (SeatVM | null)[]>();

  // selección (funcionAsientoId)
  selected = new Set<number>();

  // expiración (hold)
  holdExpiraEn: Date | null = null;
  countdownText = '';

  // refresh
  private pollTimer: any;
  private countdownTimer: any;
  public pending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asientosApi: AsientosApiService,
    private session: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.peliculaId = Number(this.route.snapshot.paramMap.get('id'));
    this.funcionId = Number(this.route.snapshot.paramMap.get('funcionId'));

    // si no está logueado, lo mandas a login con returnUrl
    if (!this.session.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.loadSeats(true);

    // polling suave para ver cambios (otros usuarios)
    this.pollTimer = setInterval(() => this.loadSeats(false), 15000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
    clearInterval(this.countdownTimer);
  }

  // --------- UI actions ----------
  goBack(): void {
    this.router.navigate(['/peliculas', this.peliculaId, 'tickets']);
  }

  isSelectable(seat: SeatVM): boolean {
    if (!seat) return false;
    if (seat.estado === 'DISPONIBLE') return true;
    if (seat.estado === 'BLOQUEADO' && seat.mio) return true; // puedo soltarlo
    return false;
  }

  isSelected(seat: SeatVM): boolean {
    return this.selected.has(seat.funcionAsientoId);
  }

  async toggleSeat(seat: SeatVM): Promise<void> {
    if (!this.isSelectable(seat) || this.pending) return;

    const id = seat.funcionAsientoId;

    // si está selected => release
    if (this.selected.has(id)) {
      this.pending = true;
      this.asientosApi.release(this.funcionId, [id]).subscribe({
        next: () => {
          this.selected.delete(id);
          // recargar para reflejar estado real
          this.loadSeats(false);
          this.pending = false;
        },
        error: (e) => {
          this.errorMsg = this.extractError(e) || 'No se pudo liberar el asiento.';
          this.pending = false;
        },
      });
      return;
    }

    // si está disponible => hold
    if (seat.estado === 'DISPONIBLE') {
      this.pending = true;
      this.asientosApi.hold(this.funcionId, [id]).subscribe({
        next: (res) => {
          // el backend te devuelve cuáles quedaron bloqueados
          for (const x of res.bloqueados || []) this.selected.add(x);
          this.holdExpiraEn = res.expiraEn ? new Date(res.expiraEn) : null;
          this.startCountdown();
          this.loadSeats(false);
          this.pending = false;
        },
        error: (e) => {
          this.errorMsg = this.extractError(e) || 'No se pudo reservar el asiento.';
          this.pending = false;
          this.loadSeats(false);
        },
      });
    }
  }

  clearMySelection(): void {
    const ids = Array.from(this.selected.values());
    if (ids.length === 0 || this.pending) return;

    this.pending = true;
    this.asientosApi.release(this.funcionId, ids).subscribe({
      next: () => {
        this.selected.clear();
        this.holdExpiraEn = null;
        this.countdownText = '';
        this.loadSeats(false);
        this.pending = false;
      },
      error: (e) => {
        this.errorMsg = this.extractError(e) || 'No se pudieron liberar los asientos.';
        this.pending = false;
      },
    });
  }

  confirmSelection(): void {
    // placeholder: aquí iría el "checkout/compra"
    // por ahora solo mostramos que está listo
    if (this.selected.size === 0) return;
    alert(`Asientos seleccionados: ${this.selectedSeatLabels().join(', ')}`);
  }

  // --------- load + build grid ----------
  private loadSeats(resetError: boolean): void {
    if (resetError) this.errorMsg = '';
    this.loading = true;

    this.asientosApi.listar(this.funcionId).subscribe({
      next: (list) => {
        this.seats = (list || []).map(s => ({
          ...s,
          label: `${s.fila}${s.numero}`,
        }));

        // sincroniza selection con lo que el backend dice "mio"
        this.selected.clear();
        let expMin: Date | null = null;

        for (const s of this.seats) {
          if (s.estado === 'BLOQUEADO' && s.mio) {
            this.selected.add(s.funcionAsientoId);
            if (s.retencionExpira) {
              const d = new Date(s.retencionExpira);
              if (!expMin || d < expMin) expMin = d;
            }
          }
        }

        this.holdExpiraEn = expMin;
        this.startCountdown();

        this.buildGrid();
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.errorMsg = this.extractError(e) || 'No se pudieron cargar los asientos.';
      },
    });
  }

  private buildGrid(): void {
    const rowsSet = new Set<string>();
    let max = 0;

    for (const s of this.seats) {
      rowsSet.add(s.fila);
      if (s.numero > max) max = s.numero;
    }

    this.rows = Array.from(rowsSet).sort();
    this.maxCols = max;

    const map = new Map<string, (SeatVM | null)[]>();
    for (const r of this.rows) {
      const arr: (SeatVM | null)[] = Array.from({ length: this.maxCols }, () => null);
      map.set(r, arr);
    }

    for (const s of this.seats) {
      const rowArr = map.get(s.fila);
      if (!rowArr) continue;
      const idx = (s.numero ?? 1) - 1;
      if (idx >= 0 && idx < rowArr.length) rowArr[idx] = s;
    }

    this.grid = map;
  }

  // --------- helpers ----------
  selectedSeatLabels(): string[] {
    const ids = new Set(this.selected);
    const labels = this.seats
      .filter(s => ids.has(s.funcionAsientoId))
      .map(s => s.label);

    // ordenar por fila/numero
    return labels.sort((a, b) => a.localeCompare(b));
  }

  seatClass(seat: SeatVM | null): string {
    if (!seat) return 'bg-transparent border border-transparent';

    const base = 'transition-all';
    const typeVip = seat.tipo === 'VIP' ? 'rounded-lg border-2' : 'rounded';

    // vendido / bloqueado (otro)
    if (seat.estado !== 'DISPONIBLE' && !(seat.estado === 'BLOQUEADO' && seat.mio)) {
      return `${base} ${typeVip} bg-slate-900 border-slate-800 cursor-not-allowed opacity-80`;
    }

    // mío (bloqueado)
    if (seat.estado === 'BLOQUEADO' && seat.mio) {
      return `${base} ${typeVip} bg-primary border-primary cursor-pointer shadow-md shadow-primary/30`;
    }

    // disponible
    if (seat.estado === 'DISPONIBLE') {
      if (seat.tipo === 'VIP') return `${base} ${typeVip} bg-slate-700 border-primary/40 hover:border-primary hover:bg-primary/20 cursor-pointer`;
      if (seat.tipo === 'DISCAPACIDAD') return `${base} ${typeVip} bg-slate-700 border-slate-400 hover:border-primary cursor-pointer`;
      return `${base} ${typeVip} bg-slate-700 border-slate-700 hover:bg-primary/20 hover:border-primary cursor-pointer`;
    }

    return `${base} ${typeVip} bg-slate-700 border-slate-700`;
  }

  private startCountdown(): void {
    clearInterval(this.countdownTimer);

    if (!this.holdExpiraEn || this.selected.size === 0) {
      this.countdownText = '';
      return;
    }

    const tick = () => {
      const ms = this.holdExpiraEn!.getTime() - Date.now();
      if (ms <= 0) {
        this.countdownText = '00:00';
        return;
      }
      const totalSec = Math.floor(ms / 1000);
      const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');
      this.countdownText = `${mm}:${ss}`;
    };

    tick();
    this.countdownTimer = setInterval(tick, 1000);
  }

  private extractError(e: any): string {
    // backend suele devolver {message: "..."} o string
    return e?.error?.message || e?.error || e?.message || '';
  }
}