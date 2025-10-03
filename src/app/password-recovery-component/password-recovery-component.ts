import { Component } from '@angular/core';
import {  } from '@angular/router';

@Component({
  selector: 'app-password-recovery-component',
  imports: [],
  templateUrl: './password-recovery-component.html',
  styleUrl: './password-recovery-component.css'
})
export class PasswordRecoveryComponent {
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  togglePassword(): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      if (this.isPasswordVisible) {
        passwordInput.type = 'password';
        this.isPasswordVisible = false;
      } else {
        passwordInput.type = 'text';
        this.isPasswordVisible = true;
      }
    }
  }
  
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


  toggleConfirmPassword(): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      if (this.isConfirmPasswordVisible) {
        passwordInput.type = 'password';
        this.isConfirmPasswordVisible = false;
      } else {
        passwordInput.type = 'text';
        this.isConfirmPasswordVisible = true;
      }
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


  // Función de submit para el formulario
  onSubmit(event: Event): void {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const recoveryAnswer = formData.get('recoveryAnswer') as string;

    if(password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    if(password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    async function recovery(email: string, password: string, recoveryAnswer: string) {
      try {
        const response = await fetch('https://kairo-backend.vercel.app/api/recovery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, recoveryAnswer })
        });
        
        const data = await response.json();
        
        if (data.success) {
         alert("Restablecimiento de contraseña exitoso, por favor inicie sesión");
          window.location.href = '/login';
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error durante el restablecimiento de contraseña:', error);
        alert('Error durante el restablecimiento de contraseña');
      }
    }

    recovery(email, password, recoveryAnswer);
  }
}
