import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'peliculas' },

  // /peliculas carga el módulo de peliculas (lazy)
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

  
  { path: '**', redirectTo: 'peliculas' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}