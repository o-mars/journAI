import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';
import { LoginComponent } from 'src/app/components/login/login.component';
import { SettingsComponent } from 'src/app/components/settings/settings.component';
import { NewEntryComponent } from 'src/app/components/new-entry/new-entry.component';
import { EntryComponent } from 'src/app/components/entry/entry.component';
import { SignupComponent } from 'src/app/components/signup/signup.component';
import { AuthGuard } from 'src/app/services/auth-guard.service';
import { NoAuthGuard } from 'src/app/services/no-auth-guard.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'new-entry', component: NewEntryComponent, canActivate: [AuthGuard] },
  { path: 'entry', component: EntryComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [NoAuthGuard] },
  { path: 'main', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/main' },
  // { path: '', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
