import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { VerifyAccountComponent } from './pages/verify-account/verify-account';
import { FormsModule } from '@angular/forms';
import { AccountLockedComponent } from './pages/account-locked/account-locked';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VerifyAccountComponent,
    AccountLockedComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule
  ]
})
export class AuthModule { }
