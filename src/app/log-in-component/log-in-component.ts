import { Component } from '@angular/core';

@Component({
  selector: 'app-log-in-component',
  imports: [],
  templateUrl: './log-in-component.html',
  styleUrl: './log-in-component.css'
})
export class LogInComponent {
  
  isPasswordVisible: boolean = false;
  
  showPassword(event: Event): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = 'text';
      this.isPasswordVisible = true;
    }
  }

  hidePassword(event: Event): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = 'password';
      this.isPasswordVisible = false;
    }
  }
}
