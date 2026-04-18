import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'peliculas' },

  {
    path: 'peliculas',
    loadChildren: () =>
      import('./features/peliculas/peliculas-module').then(m => m.PeliculasModule),
  },

    {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule),
  },

  {
  path: 'admin',
  loadChildren: () => import('./features/admin/admin-module').then(m => m.AdminModule),
},
{
  path: 'peliculas/:id/tickets',
  loadChildren: () =>
    import('./features/peliculas/pages/tickets/tickets-module').then(m => m.TicketsModule),
},
{
  path: 'peliculas/:id/detalle',
  loadChildren: () =>
    import('./features/peliculas/pages/detalle/detalle-module').then(m => m.DetalleModule),
},
  {
    path: 'carrito',
    loadChildren: () => import('./features/carrito/carrito-module').then(m => m.CarritoModule),
  },
{
  path: 'confiteria',
  loadChildren: () =>
    import('./features/confiteria/confiteria-module').then(m => m.ConfiteriaModule),
},
  { path: '**', redirectTo: 'peliculas' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}