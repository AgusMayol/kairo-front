import { Component } from '@angular/core';
import { getSessionUser, clearSessionCookie } from '../auth.util';
import { toast } from 'ngx-sonner';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-component',
  imports: [ZardButtonComponent, ZardAvatarComponent, ZardDividerComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent {
  userName: string = '';
  name: string = '';
  lastName: string = '';
  email: string = '';
  currentRoute: string = '';

  constructor(private router: Router) {
    const user = getSessionUser();
    this.userName = user ? user.firstName : '';
    this.name = user ? user.firstName : '';
    this.lastName = user ? user.lastName : '';
    this.email = user ? user.email : '';

    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  logout(): void {
    clearSessionCookie();
    window.location.href = '/login';
  }

  readonly zImageDefault = {
    fallback: "",
    url: "/user.svg",
  };

  readonly zKairo = {
    fallback: "",
    url: "/logo-simple.png",
  };
}
