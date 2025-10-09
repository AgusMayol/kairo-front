import { Component } from '@angular/core';
import {  } from '@angular/router';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-password-recovery-component',
  imports: [],
  templateUrl: './password-recovery-component.html',
  styleUrl: './password-recovery-component.css'
})
export class PasswordRecoveryComponent {
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
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
    const recoveryAnswer = formData.get('recoveryAnswer') as string;

    if(password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if(password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    this.isSubmitting = true;

    const recovery = async (email: string, password: string, recoveryAnswer: string) => {
      try {
        let data: any;

        const promise = () => new Promise(
          (resolve, reject) => {
            fetch('https://kairo-backend.vercel.app/api/recovery', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password, recoveryAnswer })
            })
            .then(response => response.json())
            .then(dataJson => {
              data = dataJson;
              if (data.success) {
                resolve(data);
              } else {
                reject(data.message);
                this.isSubmitting = false;
              }
            })
            .catch(error => {
              console.error('Error durante el restablecimiento de contraseña:', error);
              reject('Error durante el restablecimiento de contraseña');
              this.isSubmitting = false;
            });
          }
        );

        toast.promise(promise, {
          loading: 'Restableciendo contraseña...',
          success: (data: any) => {
            return 'Restablecimiento de contraseña exitoso, por favor inicie sesión';
          },
          error: (error: any) => {
            return error;
          },
        });

        const checkDataAndRedirect = () => {
          if (data) {
            if (data.success) {
              setTimeout(() => {
                window.location.href = '/login';
              }, 1000);
            }
          } else {
            setTimeout(checkDataAndRedirect, 100); // Check again in 100ms
          }
        };
        
        checkDataAndRedirect();
      } catch (error) {
        console.error('Error durante el restablecimiento de contraseña:', error);
        toast.error('Error durante el restablecimiento de contraseña');
        this.isSubmitting = false;
      }
    };

    recovery(email, password, recoveryAnswer);
  }
}
