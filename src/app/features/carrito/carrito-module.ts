import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoRoutingModule } from './carrito-routing-module';
import { CarritoComponent } from './pages/carrito/carrito';

@NgModule({
  declarations: [CarritoComponent],
  imports: [CommonModule, CarritoRoutingModule],
})
export class CarritoModule {}