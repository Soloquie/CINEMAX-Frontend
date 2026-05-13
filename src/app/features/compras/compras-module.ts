import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComprasRoutingModule } from './compras-routing-module';
import { MisComprasComponent } from './pages/mis-compras/mis-compras';

@NgModule({
  declarations: [
    MisComprasComponent
  ],
  imports: [
    CommonModule,
    ComprasRoutingModule
  ]
})
export class ComprasModule {}