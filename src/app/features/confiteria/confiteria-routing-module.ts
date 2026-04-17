import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiteriaComponent } from './pages/confiteria/confiteria';

const routes: Routes = [
  { path: '', component: ConfiteriaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiteriaRoutingModule {}