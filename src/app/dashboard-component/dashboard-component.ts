import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { getSessionUser, clearSessionCookie } from '../auth.util';
import { toast } from 'ngx-sonner';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardAlertDialogComponent } from '@shared/components/alert-dialog/alert-dialog.component';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardSheetService } from '@shared/components/sheet/sheet.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ZardButtonComponent, ZardAvatarComponent, ZardDividerComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  name: string = '';
  lastName: string = '';
  email: string = '';
  currentRoute: string = '';
  tasksData: any = null;
  filteredTasksData: any = null; // Nueva propiedad para tareas filtradas
  isLoading: boolean = true;

  // Nuevas propiedades para filtros
  filtroTitulo: string = '';
  filtroDescripcion: string = '';
  filtroUsuarioAsignador: string = '';

  // Form properties
  taskForm: FormGroup;
  estados = ['pendiente', 'en progreso', 'completada'];
  prioridades = ['alta', 'media', 'baja'];
  selectedTask: any = null;
  originalTaskData: any = null; // Store original data for comparison

  @ViewChild('taskEditForm', { static: true }) taskEditFormTemplate!: TemplateRef<any>;
  @ViewChild('taskDetailsModal', { static: true }) taskDetailsModalTemplate!: TemplateRef<any>;
  @ViewChild('sidebarContent', { static: true }) sidebarContentTemplate!: TemplateRef<any>;

  constructor(private router: Router, private fb: FormBuilder, private alertDialogService: ZardAlertDialogService, private sheetService: ZardSheetService) {
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

    // Initialize form
    this.taskForm = this.fb.group({
      titulo: ['', Validators.required],
      prioridad: ['', Validators.required],
      estado: ['', Validators.required],
      nota: [''],
      esPrioridad: [false]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    const user = getSessionUser();
    if (!user || !user.username) {
      console.error('No user or username found');
      this.isLoading = false;
      return;
    }

    try {
      const response = await fetch(`https://kairo-backend.vercel.app/api/tasks/assignedToUser/${user.username}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.tasksData = await response.json();
      this.tasksData = this.tasksData["tareasAsignadas"];
      this.filteredTasksData = [...this.tasksData]; // Inicializar con todas las tareas
      console.log('Tasks loaded:', this.tasksData);
      console.log('First task structure:', this.tasksData[0]);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      this.isLoading = false;
    }
  }

  // Nuevo método para filtrar tareas en tiempo real
  filtrarTareas(): void {
    if (!this.tasksData || !Array.isArray(this.tasksData)) {
      this.filteredTasksData = [];
      return;
    }

    this.filteredTasksData = this.tasksData.filter((task: any) => {
      const tituloMatch = !this.filtroTitulo ||
        task.tarea.titulo?.toLowerCase().includes(this.filtroTitulo.toLowerCase());

      const descripcionMatch = !this.filtroDescripcion ||
        task.tarea.nota?.toLowerCase().includes(this.filtroDescripcion.toLowerCase());

      const usuarioMatch = !this.filtroUsuarioAsignador ||
        task.tarea.asignadoPor?.toLowerCase().includes(this.filtroUsuarioAsignador.toLowerCase());


      return tituloMatch && descripcionMatch && usuarioMatch;
    });

  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.filtroTitulo = '';
    this.filtroDescripcion = '';
    this.filtroUsuarioAsignador = '';
    this.filtrarTareas();
  }

  getTasksByStatus(status: string): any[] {
    if (!this.filteredTasksData || !Array.isArray(this.filteredTasksData)) {
      return [];
    }

    // Filter tasks by status and sort by priority
    return this.filteredTasksData
      .filter((task: any) => task.tarea.estado === status)
      .sort((a: any, b: any) => {
        // Tasks with personal priority (esPrioridad: true) come first
        if (a.asignacion.esPrioridad && !b.asignacion.esPrioridad) {
          return -1; // a comes before b
        }
        if (!a.asignacion.esPrioridad && b.asignacion.esPrioridad) {
          return 1; // b comes before a
        }
        // If both have same priority status, maintain original order
        return 0;
      });
  }

  openEditDialog(task: any): void {
    this.selectedTask = task;

    // Populate form with task data
    this.taskForm.patchValue({
      titulo: task.tarea.titulo,
      prioridad: task.tarea.prioridad,
      estado: task.tarea.estado,
      nota: task.tarea.nota || '',
      esPrioridad: task.asignacion.esPrioridad
    });

    // Open dialog
    this.alertDialogService.create({
      zTitle: 'Editar Tarea',
      zDescription: 'Modifica los campos de la tarea según necesites',
      zContent: this.taskEditFormTemplate,
      zOkText: 'Guardar',
      zCancelText: 'Cancelar',
      zWidth: '500px'
    });
  }

  saveTaskChanges(): void {
    if (this.taskForm.valid && this.selectedTask) {
      // Update the task data
      this.selectedTask.tarea.titulo = this.taskForm.value.titulo;
      this.selectedTask.tarea.prioridad = this.taskForm.value.prioridad;
      this.selectedTask.tarea.estado = this.taskForm.value.estado;
      this.selectedTask.tarea.nota = this.taskForm.value.nota;
      this.selectedTask.asignacion.esPrioridad = this.taskForm.value.esPrioridad;

      // Update task via API
      this.updateTask(this.selectedTask);
    } else {
      toast.error('Por favor completa todos los campos requeridos');
    }
  }

  // Toggle personal priority (star)
  async togglePersonalPriority(task: any): Promise<void> {
    const newPriorityValue = !task.asignacion.esPrioridad;

    // Show loading toast
    const loadingToast = toast.loading('Actualizando prioridad...');

    try {
      const response = await fetch(`https://kairo-backend.vercel.app/api/tasks/priority/${task.asignacion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          esPrioridad: newPriorityValue
        })
      });

      if (response.ok) {
        task.asignacion.esPrioridad = newPriorityValue;
        const message = newPriorityValue ? 'Agregada a tus prioridades' : 'Quitada de tus prioridades';
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
    console.log('updateTask called with:', task);
    console.log('Making PUT request to:', `https://kairo-backend.vercel.app/api/tasks/${task.tarea.id}`);

    try {
      const response = await fetch(`https://kairo-backend.vercel.app/api/tasks/${task.tarea.id}`, {
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
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar la tarea');
    }
  }

  // Save changes from details modal
  async saveDetailsChanges(): Promise<void> {
    console.log('saveDetailsChanges called with:', this.selectedTask);
    console.log('Task estado:', this.selectedTask?.tarea?.estado);
    console.log('Task nota:', this.selectedTask?.tarea?.nota);

    if (this.selectedTask) {
      // Validate notes length
      if (this.selectedTask.tarea.nota && this.selectedTask.tarea.nota.length > 400) {
        toast.error('Máximo 400 caracteres en las notas');
        return;
      }

      // Check if there are changes
      const hasChanges = this.hasTaskChanges();
      console.log('Has changes:', hasChanges);

      if (hasChanges) {
        // Show loading toast
        const loadingToast = toast.loading('Guardando cambios...');

        try {
          console.log('Calling updateTask with:', this.selectedTask);
          await this.updateTask(this.selectedTask);

          // Only update the original task data after successful API call
          this.updateOriginalTaskData(this.selectedTask);

          // Update toast to success
          toast.success('Modificaciones guardadas', {
            id: loadingToast
          });
        } catch (error) {
          console.error('Error saving changes:', error);
          // Update toast to error
          toast.error('Error al guardar los cambios', {
            id: loadingToast
          });
        }
      } else {
        toast.info('No se detectaron modificaciones');
      }
    }
  }

  // Update original task data in the tasks array
  private updateOriginalTaskData(updatedTask: any): void {
    if (!this.tasksData || !Array.isArray(this.tasksData)) return;

    const taskIndex = this.tasksData.findIndex((task: any) => task.tarea.id === updatedTask.tarea.id);
    if (taskIndex !== -1) {
      // Update the original task with the modified data
      this.tasksData[taskIndex] = { ...updatedTask };
      console.log('Original task data updated in array');
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

  logout(): void {
    clearSessionCookie();
    window.location.href = '/login';
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
