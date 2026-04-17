import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { MoviesComponent } from './pages/movies/movies';
import { CinesComponent } from './pages/cines/cines';
import { FuncionesComponent } from './pages/funciones/funciones';
import { FormsModule } from '@angular/forms';
import { ConfiteriaComponent } from './pages/confiteria/confiteria';


@NgModule({
  declarations: [
    Dashboard,
    AdminLayoutComponent,
    MoviesComponent,
    CinesComponent,
    FuncionesComponent,
    ConfiteriaComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule
  ]
})
export class AdminModule { }
