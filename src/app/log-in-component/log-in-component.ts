import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { setSessionCookie } from '../auth.util';

@Component({
  selector: 'app-log-in-component',
  imports: [RouterModule],
  templateUrl: './log-in-component.html',
  styleUrl: './log-in-component.css'
})
export class LogInComponent {
  router = inject(Router);
  isPasswordVisible: boolean = false;
  
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

  // Función de submit para el formulario
  onSubmit(event: Event): void {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    async function login(email: string, password: string) {
      try {
        const response = await fetch('https://kairo-backend.vercel.app/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSessionCookie({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            firstName: data.user.firstName,
            lastName: data.user.lastName
          });
          window.location.href = '/dashboard';
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error durante el login:', error);
        alert('Error durante el login');
      }
    }

    login(email, password);
  }
}
