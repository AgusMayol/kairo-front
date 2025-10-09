import { Component } from '@angular/core';
import { getSessionUser, clearSessionCookie } from '../auth.util';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-dashboard-component',
  imports: [],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent {
  userName: string = '';

  constructor() {
    const user = getSessionUser();
    this.userName = user ? user.firstName : '';
  }

  logout(): void {
    clearSessionCookie();
    window.location.href = '/login';
  }
}
