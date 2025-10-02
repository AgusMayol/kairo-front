import { Routes } from '@angular/router';
import { LogInComponent } from './log-in-component/log-in-component';
import { RegisterComponent } from './register-component/register-component';
import { PasswordRecoveryComponent } from './password-recovery-component/password-recovery-component';
import { DashboardComponent } from './dashboard-component/dashboard-component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LogInComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'password-recovery', component: PasswordRecoveryComponent },
    { path: 'dashboard', component: DashboardComponent }
];
