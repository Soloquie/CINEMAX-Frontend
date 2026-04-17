import { Component, OnInit } from '@angular/core';
import {
  AdminProductosApiService,
  ProductoAdminResponseDTO,
  ProductoUpsertForm,
  ProductoCategoria,
  ActualizarStockDTO,
  TipoMovimientoInventario
} from '../../../../../app/core/services/admin/admin-productos-api';

@Component({
  selector: 'app-confiteria',
  templateUrl: './confiteria.html',
  styleUrls: ['./confiteria.scss'],
  standalone: false,
})
export class ConfiteriaComponent implements OnInit {
  loading = true;
  saving = false;
  stockSaving = false;

  errorMsg = '';
  modalErrorMsg = '';
  stockErrorMsg = '';

  productos: ProductoAdminResponseDTO[] = [];
  filtered: ProductoAdminResponseDTO[] = [];

  q = '';
  categoriaFiltro: 'ALL' | ProductoCategoria = 'ALL';
  estadoFiltro: 'ALL' | 'ACTIVE' | 'LOW' | 'INACTIVE' = 'ALL';

  categorias: ProductoCategoria[] = ['COMBO', 'POPCORN', 'DRINK', 'CANDY'];

  modalOpen = false;
  editingId: number | null = null;
  imagePreview: string | null = null;

  form: ProductoUpsertForm = this.emptyForm();

  stockModalOpen = false;
  stockTarget: ProductoAdminResponseDTO | null = null;
  stockForm: ActualizarStockDTO = {
    cantidad: 0,
    tipo: 'ENTRADA',
    motivo: '',
  };

  constructor(private api: AdminProductosApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.listar().subscribe({
      next: (list) => {
        this.productos = list || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los productos de confitería.';
        this.loading = false;
      },
    });
  }

  // ---------------- filtros ----------------
  onSearch(value: string): void {
    this.q = value;
    this.applyFilters();
  }

  onCategoriaFilter(value: 'ALL' | ProductoCategoria): void {
    this.categoriaFiltro = value;
    this.applyFilters();
  }

  onEstadoFilter(value: 'ALL' | 'ACTIVE' | 'LOW' | 'INACTIVE'): void {
    this.estadoFiltro = value;
    this.applyFilters();
  }

  private applyFilters(): void {
    const q = this.q.trim().toLowerCase();

    this.filtered = this.productos.filter((p) => {
      const matchQ =
        !q ||
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q);

      const matchCategoria =
        this.categoriaFiltro === 'ALL' || p.categoria === this.categoriaFiltro;

      let matchEstado = true;
      if (this.estadoFiltro === 'ACTIVE') {
        matchEstado = !!p.activo;
      } else if (this.estadoFiltro === 'INACTIVE') {
        matchEstado = !p.activo;
      } else if (this.estadoFiltro === 'LOW') {
        matchEstado = !!p.activo && Number(p.stock ?? 0) <= Number(p.stockMinimo ?? 0);
      }

      return matchQ && matchCategoria && matchEstado;
    });
  }

  // ---------------- stats ----------------
  get totalProductos(): number {
    return this.productos.length;
  }

  get activosCount(): number {
    return this.productos.filter((p) => !!p.activo).length;
  }

  get lowStockCount(): number {
    return this.productos.filter((p) => !!p.activo && Number(p.stock ?? 0) <= Number(p.stockMinimo ?? 0)).length;
  }

  get totalStockUnits(): number {
    return this.productos.reduce((acc, p) => acc + Number(p.stock ?? 0), 0);
  }

  // ---------------- modal producto ----------------
  openCreate(): void {
    this.editingId = null;
    this.modalErrorMsg = '';
    this.imagePreview = null;
    this.form = this.emptyForm();
    this.modalOpen = true;
  }

  openEdit(p: ProductoAdminResponseDTO): void {
    this.editingId = p.id;
    this.modalErrorMsg = '';
    this.imagePreview = p.imagenUrl || null;

    this.form = {
      sku: p.sku || '',
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: Number(p.precio ?? 0),
      categoria: p.categoria || 'COMBO',
      activo: !!p.activo,
      stock: Number(p.stock ?? 0),
      stockMinimo: Number(p.stockMinimo ?? 0),
      imagen: null,
    };

    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] || null;

    this.form.imagen = file;

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    this.modalErrorMsg = '';

    if (!this.form.sku.trim()) {
      this.modalErrorMsg = 'El SKU es obligatorio.';
      return;
    }

    if (!this.form.nombre.trim()) {
      this.modalErrorMsg = 'El nombre es obligatorio.';
      return;
    }

    if (!this.form.precio || Number(this.form.precio) <= 0) {
      this.modalErrorMsg = 'El precio debe ser mayor a 0.';
      return;
    }

    if (this.form.stock === null || this.form.stock === undefined || Number(this.form.stock) < 0) {
      this.modalErrorMsg = 'El stock debe ser 0 o mayor.';
      return;
    }

    if (this.form.stockMinimo === null || this.form.stockMinimo === undefined || Number(this.form.stockMinimo) < 0) {
      this.modalErrorMsg = 'El stock mínimo debe ser 0 o mayor.';
      return;
    }

    this.saving = true;

    const req$ = this.editingId
      ? this.api.actualizar(this.editingId, this.form)
      : this.api.crear(this.form);

    req$.subscribe({
      next: () => {
        this.modalOpen = false;
        this.saving = false;
        this.load();
      },
      error: (err) => {
        this.modalErrorMsg = err?.error?.message || 'No se pudo guardar el producto.';
        this.saving = false;
      },
    });
  }

  deleteProducto(p: ProductoAdminResponseDTO): void {
    const ok = confirm(`¿Eliminar "${p.nombre}"?`);
    if (!ok) return;

    this.loading = true;
    this.api.eliminar(p.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo eliminar el producto.';
        this.loading = false;
      },
    });
  }

  // ---------------- modal stock ----------------
  openStockModal(p: ProductoAdminResponseDTO): void {
    this.stockTarget = p;
    this.stockErrorMsg = '';
    this.stockForm = {
      cantidad: 0,
      tipo: 'ENTRADA',
      motivo: '',
    };
    this.stockModalOpen = true;
  }

  closeStockModal(): void {
    this.stockModalOpen = false;
  }

  saveStock(): void {
    if (!this.stockTarget) return;

    if (this.stockForm.cantidad === null || this.stockForm.cantidad === undefined || Number(this.stockForm.cantidad) < 0) {
      this.stockErrorMsg = 'La cantidad debe ser 0 o mayor.';
      return;
    }

    this.stockSaving = true;

    this.api.actualizarStock(this.stockTarget.id, this.stockForm).subscribe({
      next: () => {
        this.stockModalOpen = false;
        this.stockSaving = false;
        this.load();
      },
      error: (err) => {
        this.stockErrorMsg = err?.error?.message || 'No se pudo actualizar el stock.';
        this.stockSaving = false;
      },
    });
  }

  // ---------------- ui helpers ----------------
  emptyForm(): ProductoUpsertForm {
    return {
      sku: '',
      nombre: '',
      descripcion: '',
      precio: null,
      categoria: 'COMBO',
      activo: true,
      stock: 0,
      stockMinimo: 0,
      imagen: null,
    };
  }

  money(value: any): string {
    return Number(value ?? 0).toLocaleString('es-CO');
  }

  categoryLabel(cat: ProductoCategoria): string {
    if (cat === 'COMBO') return 'Combos';
    if (cat === 'POPCORN') return 'Popcorn';
    if (cat === 'DRINK') return 'Drinks';
    if (cat === 'CANDY') return 'Candy';
    return String(cat || '—');
  }

  categoryClass(cat: ProductoCategoria): string {
    switch (cat) {
      case 'COMBO':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'POPCORN':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'DRINK':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'CANDY':
        return 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  }

  stockStatusLabel(p: ProductoAdminResponseDTO): string {
    if (!p.activo) return 'Inactivo';
    if (Number(p.stock ?? 0) <= 0) return 'Sin stock';
    if (Number(p.stock ?? 0) <= Number(p.stockMinimo ?? 0)) return 'Low Stock';
    return 'In Stock';
  }

  stockStatusClass(p: ProductoAdminResponseDTO): string {
    if (!p.activo) return 'text-slate-400';
    if (Number(p.stock ?? 0) <= 0) return 'text-red-400';
    if (Number(p.stock ?? 0) <= Number(p.stockMinimo ?? 0)) return 'text-primary';
    return 'text-emerald-400';
  }

  stockDotClass(p: ProductoAdminResponseDTO): string {
    if (!p.activo) return 'bg-slate-500';
    if (Number(p.stock ?? 0) <= 0) return 'bg-red-500';
    if (Number(p.stock ?? 0) <= Number(p.stockMinimo ?? 0)) return 'bg-primary';
    return 'bg-emerald-500';
  }
}