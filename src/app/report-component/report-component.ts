import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { getSessionUser } from '../auth.util';
import { AuthService } from '../auth.service';
import { toast } from 'ngx-sonner';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardAlertDialogComponent } from '@shared/components/alert-dialog/alert-dialog.component';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardSheetService } from '@shared/components/sheet/sheet.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { ZardTooltipModule } from '@shared/components/tooltip/tooltip';
import { environment } from '../../environments/environment';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-report-component',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ZardTooltipModule, ZardButtonComponent, ZardAvatarComponent, ZardDividerComponent],
  templateUrl: './report-component.html',
  styleUrl: './report-component.css'
})
export class ReportComponent implements OnInit, AfterViewInit {
  userName: string = '';
  name: string = '';
  lastName: string = '';
  email: string = '';
  currentRoute: string = '';
  tasksData: any[] = [];
  isLoading: boolean = true;
  productivityRate: number = 0;
  chart: any;
  productivityGauge: any;
  // Form properties
  taskForm: FormGroup;
  estados = ['pendiente', 'en progreso', 'completada'];
  prioridades = ['alta', 'media', 'baja'];
  selectedTask: any = null;
  originalTaskData: any = null; // Store original data for comparison

  @ViewChild('sidebarContent', { static: true }) sidebarContentTemplate!: TemplateRef<any>;
  @ViewChild('taskDetailsModal', { static: true }) taskDetailsModalTemplate!: TemplateRef<any>;

  constructor(
    private router: Router, 
    private fb: FormBuilder, 
    private alertDialogService: ZardAlertDialogService, 
    private sheetService: ZardSheetService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const user = getSessionUser();
    this.userName = user ? user.username : '';
    this.name = user ? user.firstName : '';
    this.lastName = user ? user.lastName : '';
    this.email = user ? user.email : '';

    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = event.urlAfterRedirects;
      });

    // Initialize form
    this.taskForm = this.fb.group({
      titulo: ['', Validators.required],
      prioridad: ['', Validators.required],
      estado: ['', Validators.required],
      nota: [''],
      esPrioridad: [false]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadTasks();
  }

  ngAfterViewInit(): void {
    // Charts are now created from loadTasks after data is ready
  }


  createPieChart() {
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const data: number[] = [0, 0, 0];
    for (const task of this.tasksData) {
      console.log(task);
      switch (task.tarea.estado) {
        case 'pendiente':
          data[0]++;
          break;
        case 'en progreso':
          data[1]++;
          break;
        case 'completada':
          data[2]++;
          break;
      }
    }

    const canvas = document.getElementById('MyChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas MyChart not found in DOM');
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: this.estados.map(estado => estado.charAt(0).toUpperCase() + estado.slice(1)),
        datasets: [{
          data: data,
          backgroundColor: [
            '#FEF9C2',
            '#DBEAFE',
            '#DBFCE7'
          ],
          hoverOffset: 4
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              boxWidth: 15,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return ` ${value} tareas (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createProductivityGauge() {
    // Destroy existing chart if it exists
    if (this.productivityGauge) {
      this.productivityGauge.destroy();
    }

    const completadas = this.tasksData.filter((task: any) => task.tarea.estado === 'completada').length;
    const enProgreso = this.tasksData.filter((task: any) => task.tarea.estado === 'en progreso').length;
    const pendientes = this.tasksData.filter((task: any) => task.tarea.estado === 'pendiente').length;

    const COLORS = ['rgb(140, 214, 16)', 'rgb(239, 198, 0)', 'rgb(231, 24, 49)'];

    this.productivityRate = Math.floor(completadas / (completadas + enProgreso + pendientes) * 100);

    const productivityRate = this.productivityRate;
    const data = {
      datasets: [{
        data: [this.productivityRate, 100 - this.productivityRate],
        backgroundColor(ctx: any) {
          if (ctx.type !== 'data') {
            return;
          }
          if (ctx.index === 1) {
            return 'rgb(234, 234, 234)';
          }

          if (productivityRate < 40) {
            return COLORS[2];
          } else if (productivityRate >= 40 && productivityRate < 70) {
            return COLORS[1];
          } else {
            return COLORS[0];
          }
        }
      }]
    };

    const canvas = document.getElementById('ProductivityGauge') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas ProductivityGauge not found in DOM');
      return;
    }

    this.productivityGauge = new Chart(canvas, {
      type: 'doughnut',
      data,
      options: {
        circumference: 180,
        rotation: -90,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: any) => {
                // Only show tooltip for the productivity segment (index 0)
                if (context.dataIndex === 0) {
                  return ` ${productivityRate}%`;
                } else {
                  return ` ${100 - productivityRate}%`;
                }
                return '';
              },
              title: () => {
                return 'Productividad';
              }
            }
          }
        }
      }
    });
  }

  // Helper method to get the correct API URL based on environment
  private getApiUrl(): string {
    if (environment.production === false) {
      return 'https://preview-kairo-backend.vercel.app';
    }
    return 'https://kairo-backend.vercel.app';
  }

  async loadTasks(): Promise<void> {
    const user = getSessionUser();
    if (!user || !user.username) {
      console.error('No user or username found');
      this.isLoading = false;
      return;
    }

    try {
      const baseUrl = this.getApiUrl();
      const endpoint = `${baseUrl}/api/tasks/assignedToUser/${user.username}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      this.tasksData = responseData["tareasAsignadas"];
      console.log('Tasks data:', this.tasksData);
      console.log('Tasks loaded:', this.tasksData);
      console.log('First task structure:', this.tasksData[0]);
      console.log('Tasks data:', this.tasksData[0]);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error, no pudimos cargar el histórico. Reintentá más tarde.');
    } finally {
      this.isLoading = false;
      // Create charts after data is loaded and isLoading is set to false
      setTimeout(() => {
        this.createPieChart();
        this.createProductivityGauge();
      }, 100);
    }
  }



  logout(): void {
    this.authService.logout();
  }

  openMobileSheet(): void {
    this.sheetService.create({
      zTitle: 'Menú',
      zContent: this.sidebarContentTemplate,
      zSide: 'left',
      zSize: 'default',
      zClosable: true,
      zMaskClosable: true,
      zHideFooter: true
    });
  }

  getOverdueTasks(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    return this.tasksData
      .filter((task: any) => {
        if (!task.tarea.fechaVencimiento) return false;
        const dueDate = new Date(task.tarea.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0);
        // Include ALL overdue tasks regardless of status
        return dueDate < today;
      })
      .sort((a: any, b: any) => {
        // Sort from oldest (most overdue) to newest
        const dateA = new Date(a.tarea.fechaVencimiento).getTime();
        const dateB = new Date(b.tarea.fechaVencimiento).getTime();
        return dateA - dateB;
      });
  }

  // Toggle personal priority (star)
  async togglePersonalPriority(task: any): Promise<void> {
    // Show loading toast
    const loadingToast = toast.loading('Actualizando prioridad...');

    try {
      const baseUrl = this.getApiUrl();
      const response = await fetch(`${baseUrl}/api/tasks/priority/${task.tarea.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.userName
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        const isCurrentPriority = responseData?.current;
        task.asignacion.esPrioridad = isCurrentPriority;
        const message = isCurrentPriority ? 'Agregada a tus prioridades' : 'Quitada de tus prioridades';
        toast.success(message, {
          id: loadingToast
        });
      } else {
        throw new Error('Error al actualizar prioridad');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Error al actualizar la prioridad', {
        id: loadingToast
      });
    }
  }

  // Open details modal
  openDetailsModal(task: any): void {
    // Create a deep copy to avoid modifying original data
    this.selectedTask = JSON.parse(JSON.stringify(task));
    // Store original data for comparison
    this.originalTaskData = JSON.parse(JSON.stringify(task));

    this.alertDialogService.create({
      zTitle: 'Detalles de la Tarea',
      zDescription: 'Información completa y gestión de la tarea',
      zContent: this.taskDetailsModalTemplate,
      zOkText: 'Guardar Cambios',
      zCancelText: 'Cerrar',
      zWidth: '600px',
      zOnOk: () => {
        console.log('OK button clicked, saving changes...');
        this.saveDetailsChanges();
        return {}; // Return object to close the dialog
      }
    });
  }

  // Update task via API
  async updateTask(task: any): Promise<void> {
    const baseUrl = this.getApiUrl();
    console.log('updateTask called with:', task);
    console.log('Making PUT request to:', `${baseUrl}/api/tasks/${task.tarea.id}`);

    const response = await fetch(`${baseUrl}/api/tasks/${task.tarea.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.tarea)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.ok) {
      const responseData = await response.json();
      console.log('API Response data:', responseData);
      // Don't reload tasks data - we'll update manually
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Error al actualizar tarea');
    }
  }

  // Save changes from details modal
  async saveDetailsChanges(): Promise<void> {
    console.log('saveDetailsChanges called with:', this.selectedTask);
    console.log('Task estado:', this.selectedTask?.tarea?.estado);
    console.log('Task nota:', this.selectedTask?.tarea?.nota);

    if (!this.selectedTask) {
      console.error('No selected task to save');
      return;
    }

    // Validate notes length
    if (this.selectedTask.tarea.nota && this.selectedTask.tarea.nota.length > 400) {
      toast.error('Máximo 400 caracteres en las notas');
      return;
    }

    // Check if there are changes
    const hasChanges = this.hasTaskChanges();
    console.log('Has changes:', hasChanges);

    if (!hasChanges) {
      toast.info('No se detectaron modificaciones');
      return;
    }

    // CRITICAL: Capture the task reference BEFORE the API call
    // This prevents race conditions when user opens another modal before this one finishes
    const taskToUpdate = JSON.parse(JSON.stringify(this.selectedTask));
    const taskId = taskToUpdate.tarea.id;

    // Show loading toast
    const loadingToast = toast.loading('Guardando cambios...');

    try {
      console.log('Calling updateTask with task ID:', taskId);
      console.log('Estado before API call:', taskToUpdate.tarea.estado);
      
      // First, update the task via API using the captured reference
      await this.updateTask(taskToUpdate);
      
      console.log('API call successful for task ID:', taskId, ', updating local data...');
      console.log('Estado after API call:', taskToUpdate.tarea.estado);

      // Only update the original task data after successful API call
      // Use the captured reference, NOT this.selectedTask
      this.updateOriginalTaskData(taskToUpdate);

      // Update toast to success
      toast.success('Modificaciones guardadas', {
        id: loadingToast
      });
      
      console.log('Local data updated successfully for task ID:', taskId);
    } catch (error) {
      console.error('Error saving changes for task ID:', taskId, error);
      // Update toast to error
      toast.error('Error al guardar los cambios', {
        id: loadingToast
      });
      // Do not update local data if API call failed
    }
  }

  // Update original task data in the tasks array
  private updateOriginalTaskData(updatedTask: any): void {
    this.updateLocalTaskContainer(updatedTask);
  }

  // Replace the task container in the array and trigger change detection
  private updateLocalTaskContainer(updatedContainer: any): void {
    if (!updatedContainer || !updatedContainer.tarea) {
      console.warn('updateLocalTaskContainer called with invalid container');
      return;
    }

    let changed = false;
    
    // Update tasksData with immutability (deep copy to ensure change detection)
    if (Array.isArray(this.tasksData)) {
      const idx = this.tasksData.findIndex((t: any) => t?.tarea?.id === updatedContainer.tarea.id);
      if (idx !== -1) {
        // Create a deep copy of the updated container to ensure Angular detects the change
        const deepCopy = JSON.parse(JSON.stringify(updatedContainer));
        this.tasksData = [
          ...this.tasksData.slice(0, idx),
          deepCopy,
          ...this.tasksData.slice(idx + 1)
        ];
        changed = true;
        console.log('Task data updated in tasksData at index:', idx, 'New estado:', deepCopy.tarea.estado);
      } else {
        console.warn('Task not found in tasksData, id:', updatedContainer.tarea.id);
      }
    }

    // Force change detection to ensure UI updates
    if (changed) {
      console.log('Forcing change detection...');
      this.cdr.detectChanges();
    }
  }

  // Check if task has changes
  private hasTaskChanges(): boolean {
    if (!this.selectedTask || !this.originalTaskData) return false;

    // Compare the current task data with the original data
    const currentTask = this.selectedTask.tarea;
    const originalTask = this.originalTaskData.tarea;

    // Check for changes in editable fields
    const hasEstadoChange = currentTask.estado !== originalTask.estado;
    const hasNotaChange = (currentTask.nota || '') !== (originalTask.nota || '');

    console.log('Estado change:', hasEstadoChange, 'from', originalTask.estado, 'to', currentTask.estado);
    console.log('Nota change:', hasNotaChange, 'from', originalTask.nota, 'to', currentTask.nota);

    return hasEstadoChange || hasNotaChange;
  }

  readonly zImageDefault = {
    fallback: "",
    url: "/user.svg",
  };

  readonly zImagePin = {
    fallback: "",
    url: "/pin.svg",
  };

  readonly zKairo = {
    fallback: "",
    url: "/logo-simple.png",
  };

}
