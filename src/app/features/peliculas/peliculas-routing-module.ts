import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { TicketsComponent } from './pages/tickets/tickets';
import { AsientosComponent } from './pages/asientos/asientos';

const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: '', component: TicketsComponent },
  { path: ':id/tickets/:funcionId/asientos', component: AsientosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeliculasRoutingModule {}