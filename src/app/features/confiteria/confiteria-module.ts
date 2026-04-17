import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfiteriaRoutingModule } from './confiteria-routing-module';
import { ConfiteriaComponent } from './pages/confiteria/confiteria';

@NgModule({
  declarations: [ConfiteriaComponent],
  imports: [
    CommonModule,
    FormsModule,
    ConfiteriaRoutingModule
  ]
})
export class ConfiteriaModule {}