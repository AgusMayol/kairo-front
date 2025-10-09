import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { setSessionCookie } from '../auth.util';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-log-in-component',
  imports: [RouterModule],
  templateUrl: './log-in-component.html',
  styleUrl: './log-in-component.css'
})
export class LogInComponent {
  router = inject(Router);
  isPasswordVisible: boolean = false;
  isSubmitting: boolean = false;
  
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

    this.isSubmitting = true;

    const login = async (email: string, password: string) => {
      try {
        let data: any;

        const promise = () => new Promise(
          (resolve, reject) => {
            fetch('https://kairo-backend.vercel.app/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(dataJson => {
              data = dataJson;
              if (data.success) {
                setSessionCookie({
                  id: data.user.id,
                  email: data.user.email,
                  username: data.user.username,
                  firstName: data.user.firstName,
                  lastName: data.user.lastName
                });
              
              resolve(data);
              
            } else {
              if(data.message === 'Tu cuenta fue bloqueada por múltiples intentos fallidos. Intentá nuevamente más tarde o contactá al administrador.') {
                const minutes = Math.floor(data.remainingTime / 60000);
                const seconds = Math.floor((data.remainingTime % 60000) / 1000);
                reject(data.message + ` Tiempo restante hasta que se pueda volver a intentar: ${minutes} minutos y ${seconds} segundos`);
                this.isSubmitting = false;
              } else {
                reject(data.message);
                this.isSubmitting = false;
              }
            }
          }
        );
      });
 
        toast.promise(promise, {
          loading: 'Iniciando sesión...',
          success: (data: any) => {
            return 'Login exitoso';
          },
          error: (error: any) => {
            return error;
          },
        });

        const checkDataAndRedirect = () => {
          if (data) {
            if (data.success) {
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);
            }
          } else {
            setTimeout(checkDataAndRedirect, 100); // Check again in 100ms
          }
        };
        
        checkDataAndRedirect();
      } catch (error) {
        console.error('Error durante el login:', error);
        toast.error('Error durante el login');
        this.isSubmitting = false;
      }
    };

    login(email, password);
  }
}
