import { Routes, CanActivateFn } from '@angular/router';
import { LogInComponent } from './log-in-component/log-in-component';
import { RegisterComponent } from './register-component/register-component';
import { PasswordRecoveryComponent } from './password-recovery-component/password-recovery-component';
import { DashboardComponent } from './dashboard-component/dashboard-component';
import { UserPrioritiesComponent } from './user-priorities-component/user-priorities-component';
import { hasSession } from './auth.util';
import { ReportComponent } from './report-component/report-component';

export const authGuard: CanActivateFn = () => {
    if (hasSession()) {
        return true;
    }
    window.location.href = '/login';
    return false;
};

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LogInComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'password-recovery', component: PasswordRecoveryComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'user-priorities', component: UserPrioritiesComponent, canActivate: [authGuard] },
    { path: 'report', component: ReportComponent, canActivate: [authGuard] }

];
