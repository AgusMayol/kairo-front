import { Component } from '@angular/core';
import { setSessionCookie } from '../auth.util';

@Component({
  selector: 'app-register-component',
  imports: [],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css'
})
export class RegisterComponent {
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
    const passwordInput = document.getElementById('confirmPassword') as HTMLInputElement;
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
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const username = formData.get('username') as string;
    const recoveryAnswer = formData.get('recoveryAnswer') as string;

    if(password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    if(!email.endsWith('@flowbit.com')) {
      alert('Solo se permiten correos con dominio @flowbit.com');
      return;
    }

    if(password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    async function register(email: string, password: string, firstName: string, lastName: string, username: string, recoveryAnswer: string) {
      try {
        const response = await fetch('https://kairo-backend.vercel.app/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, firstName, lastName, username, recoveryAnswer })
        });
        
        const data = await response.json();
        
        if (data.success) {
         alert("Registro exitoso, por favor inicie sesión");
          window.location.href = '/login';
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error durante el registro:', error);
        alert('Error durante el registro');
      }
    }

    register(email, password, firstName, lastName, username, recoveryAnswer);
  }
}
