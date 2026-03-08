import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CatalogoApiService, CinePublicDTO, PeliculaCardDTO } from '../../../../core/services/catalogo-api.service';
import { FuncionesApiService, FuncionPublicDTO } from '../../../../core/services/funciones-api.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import { UserApiService, UserMeDTO } from '../../../../core/services/user-api.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss'],
  standalone: false,
})
export class InicioComponent implements OnInit {
  loading = true;
  errorMsg = '';

  // filtros header
  cines: CinePublicDTO[] = [];
  selectedCineId: number | null = null;
  query = '';

  // data
  nowPlayingAll: PeliculaCardDTO[] = [];
  nowPlaying: PeliculaCardDTO[] = [];
  comingSoon: PeliculaCardDTO[] = [];
  heroMovie: PeliculaCardDTO | null = null;

  // funciones por película
  funcionesByPelicula = new Map<number, string[]>();
  fechaHoy = this.formatLocalDate(new Date());

  // auth/menu
  menuOpen = false;
  userSummary: any = null;         // ✅ NO inicializar usando this.session acá
  userMe: UserMeDTO | null = null;

  private searchTimer: any;

  constructor(
    private catalogoApi: CatalogoApiService,
    private funcionesApi: FuncionesApiService,
    private session: AuthSessionService,
    private userApi: UserApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSummary = this.session.getUser(); // ✅ aquí sí
    this.loadHome();
    this.loadUserIfLogged();
  }

  // ---------------- HOME LOAD ----------------
  private loadHome(): void {
    this.loading = true;
    this.errorMsg = '';

    this.catalogoApi.listarCines().subscribe({
      next: (cines) => {
        this.cines = cines || [];
        if (!this.selectedCineId && this.cines.length > 0) this.selectedCineId = this.cines[0].id;
        this.loadMoviesAndFunciones();
      },
      error: () => {
        this.cines = [];
        this.loadMoviesAndFunciones();
      },
    });
  }

  private loadMoviesAndFunciones(): void {
    let loaded = 0;
    const done = () => {
      loaded++;
      if (loaded >= 2) {
        this.heroMovie = this.nowPlayingAll[0] || null;
        this.applySearch();
        this.loadFunciones();
        this.loading = false;
      }
    };

    this.catalogoApi.enCartelera().subscribe({
      next: (list) => {
        this.nowPlayingAll = list || [];
        done();
      },
      error: () => {
        this.nowPlayingAll = [];
        this.errorMsg = 'No se pudo cargar cartelera.';
        done();
      },
    });

    this.catalogoApi.proximas(30).subscribe({
      next: (list) => {
        this.comingSoon = list || [];
        done();
      },
      error: () => {
        this.comingSoon = [];
        done();
      },
    });
  }

  onCineChange(): void {
    this.loadFunciones();
  }

  onSearchInput(value: string): void {
    this.query = value;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.applySearch(), 250);
  }

  private applySearch(): void {
    const q = (this.query || '').trim().toLowerCase();
    this.nowPlaying = !q
      ? [...this.nowPlayingAll]
      : this.nowPlayingAll.filter(m => (m.titulo || '').toLowerCase().includes(q));
  }

  private loadFunciones(): void {
    this.funcionesByPelicula.clear();
    const cineId = this.selectedCineId ?? undefined;

    this.funcionesApi.listar(this.fechaHoy, cineId).subscribe({
      next: (funciones) => this.groupFunciones(funciones || []),
      error: () => {},
    });
  }

  private groupFunciones(funciones: FuncionPublicDTO[]): void {
    const map = new Map<number, string[]>();

    for (const f of funciones) {
      const pid = f.peliculaId;
      const time = this.extractTimeFromInicio(f.inicio);
      if (!pid || !time) continue;

      const arr = map.get(pid) ?? [];
      arr.push(time);
      map.set(pid, arr);
    }

    for (const [pid, times] of map.entries()) {
      map.set(pid, Array.from(new Set(times)).sort());
    }

    this.funcionesByPelicula = map;
  }

  getTimesFor(peliculaId: number): string[] {
    return (this.funcionesByPelicula.get(peliculaId) ?? []).slice(0, 3);
  }

  private extractTimeFromInicio(inicioIso: string): string | null {
    if (!inicioIso) return null;
    // "2026-03-07T14:20:00" -> "14:20"
    const t = inicioIso.indexOf('T');
    if (t >= 0 && inicioIso.length >= t + 6) return inicioIso.substring(t + 1, t + 6);
    return null;
  }

  // ---------------- AUTH UI ----------------
  isLoggedIn(): boolean {
    return this.session.isLoggedIn();
  }

  onCartClick(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/carrito']); // placeholder (lo hacemos luego)
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.session.clear();
    this.menuOpen = false;
    this.userSummary = null;
    this.userMe = null;
    this.router.navigate(['/peliculas']);
  }

private loadUserIfLogged(): void {
  if (!this.session.isLoggedIn()) return;

  this.userApi.me().subscribe({
    next: (me) => (this.userMe = me),
    error: () => {
      this.session.clear();
      this.userSummary = null;
      this.userMe = null;
    },
  });
}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu')) this.menuOpen = false;
  }

  private formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  isAdmin(): boolean {
  const roles = (this.userMe?.roles || this.userSummary?.roles || []) as string[];
  return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
}

goAdminPanel(): void {
  this.menuOpen = false;
  this.router.navigate(['/admin']);
}
}