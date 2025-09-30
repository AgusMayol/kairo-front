import { Component } from '@angular/core';

@Component({
  selector: 'app-register-component',
  imports: [],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css'
})
export class RegisterComponent {
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  
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



  showConfirmPassword(event: Event): void {
    const passwordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = 'text';
      this.isConfirmPasswordVisible = true;
    }
  }

  hideConfirmPassword(event: Event): void {
    const passwordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = 'password';
      this.isConfirmPasswordVisible = false;
    }
  }
}
