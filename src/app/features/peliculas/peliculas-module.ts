import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeliculasRoutingModule } from './peliculas-routing-module';
import { InicioComponent } from './pages/inicio/inicio';
import { FormsModule } from '@angular/forms';
import { AsientosComponent } from './pages/asientos/asientos';


@NgModule({
  declarations: [
    InicioComponent,
    AsientosComponent
  ],
  imports: [
    CommonModule,
    PeliculasRoutingModule,
    FormsModule
  ]
})
export class PeliculasModule { }
