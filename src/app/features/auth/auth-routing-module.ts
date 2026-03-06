import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { VerifyAccountComponent } from './pages/verify-account/verify-account';
import { AccountLockedComponent } from './pages/account-locked/account-locked';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';

const routes: Routes = [
  { path: 'login', component: LoginComponent }, 
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent }, 
  { path: 'verify-account', component:  VerifyAccountComponent }, 
  { path: 'account-locked', component: AccountLockedComponent }, 
  { path: 'reset-password', component: ResetPasswordComponent } 
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
