import { Injectable, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { getSessionUser, clearSessionCookie, KairoUser } from './auth.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly LOGOUT_EVENT_KEY = 'kairo_logout_event';
  private readonly sessionUser = signal<KairoUser | null>(null);

  constructor(private router: Router) {
    // Initialize session user
    this.sessionUser.set(getSessionUser());

    // Listen for storage events from other tabs
    this.listenForCrossTabLogout();
  }

  /**
   * Listens for logout events from other tabs/windows
   */
  private listenForCrossTabLogout(): void {
    window.addEventListener('storage', (event: StorageEvent) => {
      // The storage event only fires in OTHER tabs, not the current one
      if (event.key === this.LOGOUT_EVENT_KEY && event.newValue) {
        console.log('Logout detected in another tab, logging out...');
        this.handleCrossTabLogout();
      }
    });
  }

  /**
   * Handles logout triggered from another tab
   */
  private handleCrossTabLogout(): void {
    clearSessionCookie();
    this.sessionUser.set(null);
    
    // Clean up the event flag
    localStorage.removeItem(this.LOGOUT_EVENT_KEY);
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Performs logout and notifies other tabs
   */
  logout(): void {
    clearSessionCookie();
    this.sessionUser.set(null);

    // Notify other tabs by setting a timestamp in localStorage
    // This triggers the 'storage' event in other tabs
    localStorage.setItem(this.LOGOUT_EVENT_KEY, Date.now().toString());
    
    // Clean up immediately in this tab
    setTimeout(() => {
      localStorage.removeItem(this.LOGOUT_EVENT_KEY);
    }, 100);

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Gets the current session user
   */
  getUser(): KairoUser | null {
    return this.sessionUser();
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionUser() !== null;
  }
}

