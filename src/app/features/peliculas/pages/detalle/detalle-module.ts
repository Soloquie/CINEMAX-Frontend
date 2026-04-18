import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DetalleRoutingModule } from './detalle-routing-module';
import { DetalleComponent } from './detalle';

@NgModule({
  declarations: [DetalleComponent],
  imports: [
    CommonModule,
    FormsModule,
    DetalleRoutingModule,
  ],
})
export class DetalleModule {}