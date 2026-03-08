import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TicketsComponent } from './tickets';

const routes: Routes = [
  { path: '', component: TicketsComponent }
];

@NgModule({
  declarations: [TicketsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
})
export class TicketsModule {}