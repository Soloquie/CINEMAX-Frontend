import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { MoviesComponent } from './pages/movies/movies';
import { CinesComponent } from './pages/cines/cines';
import { FuncionesComponent } from './pages/funciones/funciones';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: Dashboard },
      { path: 'movies', component: MoviesComponent },
      { path: 'cines', component:   CinesComponent },
      { path: 'funciones', component: FuncionesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}