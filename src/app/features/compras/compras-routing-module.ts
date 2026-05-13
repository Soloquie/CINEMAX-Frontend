import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MisComprasComponent } from './pages/mis-compras/mis-compras';

const routes: Routes = [
  {
    path: '',
    component: MisComprasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprasRoutingModule {}