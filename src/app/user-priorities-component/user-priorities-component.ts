import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardTooltipModule } from '@shared/components/tooltip/tooltip';
import { environment } from '../../environments/environment';
import { HighlightPipe } from '@shared/pipes/highlight.pipe';

@Component({
  selector: 'app-user-priorities-component',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ZardTooltipModule, ZardButtonComponent, ZardAvatarComponent, ZardDividerComponent, ZardSelectComponent, ZardSelectItemComponent, HighlightPipe],
  templateUrl: './user-priorities-component.html',
  styleUrl: './user-priorities-component.css'
})
export class UserPrioritiesComponent implements OnInit {
  userName: string = '';
  name: string = '';
  lastName: string = '';
  email: string = '';
  currentRoute: string = '';
  tasksData: any = null;
  filteredTasksData: any = null; // Nueva propiedad para tareas filtradas
  isLoading: boolean = true;
  defaultValue = 'priority';
  private readonly SORT_COOKIE_KEY = 'kairo_sort_order';
  // Propiedad para filtro unificado
  filtroGeneral: string = '';

  // Form properties
  taskForm: FormGroup;
  estados = ['pendiente', 'en progreso', 'completada'];
  prioridades = ['alta', 'media', 'baja'];
  selectedTask: any = null;
  originalTaskData: any = null; // Store original data for comparison

  @ViewChild('taskEditForm', { static: true }) taskEditFormTemplate!: TemplateRef<any>;
  @ViewChild('taskDetailsModal', { static: true }) taskDetailsModalTemplate!: TemplateRef<any>;
  @ViewChild('sidebarContent', { static: true }) sidebarContentTemplate!: TemplateRef<any>;

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

  ngOnInit(): void {
    this.restoreSortFromCookie();
    this.loadTasks();
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
      const endpoint = `${baseUrl}/api/tasks/priority/${user.username}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(responseData)
      // For priority endpoint, the data structure might be different
      this.tasksData = responseData.tareasAsignadas;
      this.filteredTasksData = [...this.tasksData];
    } catch (error) {
      console.error('Error loading priority tasks:', error);
      toast.error('Error al cargar las tareas prioritarias');
    } finally {
      this.isLoading = false;
    }
  }


  // Método para filtrar tareas en tiempo real por título, descripción y usuario asignador
  filtrarTareas(): void {
    if (!this.tasksData || !Array.isArray(this.tasksData)) {
      this.filteredTasksData = [];
      return;
    }

    if (!this.filtroGeneral || this.filtroGeneral.trim() === '') {
      this.filteredTasksData = [...this.tasksData];
      return;
    }

    const filtro = this.filtroGeneral.toLowerCase().trim();

    this.filteredTasksData = this.tasksData.filter((task: any) => {
      const tituloMatch = task.tarea.titulo?.toLowerCase().includes(filtro);
      const descripcionMatch = task.tarea.descripcion?.toLowerCase().includes(filtro);
      const usuarioMatch = task.tarea.asignadoPor?.toLowerCase().includes(filtro);

      return tituloMatch || descripcionMatch || usuarioMatch;
    });
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.filtroGeneral = '';
    this.filtrarTareas();
  }



  // Secondary sorting based on select value
  private getSecondarySorting(a: any, b: any): number {
    switch (this.defaultValue) {
      case 'priority':
        return this.sortBySystemPriority(a, b);
      case 'dueDate':
        return this.sortByDueDate(a, b);
      case 'creationDate':
        return this.sortByCreationDate(a, b);
      default:
        return this.sortBySystemPriority(a, b);
    }
  }

  // Sort by system priority (alta > media > baja)
  private sortBySystemPriority(a: any, b: any): number {
    const priorityOrder: { [key: string]: number } = { 'alta': 3, 'media': 2, 'baja': 1 };
    const aPriority = priorityOrder[a.tarea.prioridad] || 0;
    const bPriority = priorityOrder[b.tarea.prioridad] || 0;
    return bPriority - aPriority; // Higher priority first
  }

  // Sort by due date (earliest first, null dates last)
  private sortByDueDate(a: any, b: any): number {
    const aDate = a.tarea.fechaVencimiento ? new Date(a.tarea.fechaVencimiento) : null;
    const bDate = b.tarea.fechaVencimiento ? new Date(b.tarea.fechaVencimiento) : null;
    
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1; // a goes last
    if (!bDate) return -1; // b goes last
    
    return aDate.getTime() - bDate.getTime(); // Earlier dates first
  }

  // Sort by creation date (newest first)
  private sortByCreationDate(a: any, b: any): number {
    const aDate = new Date(a.tarea.fechaCreacion);
    const bDate = new Date(b.tarea.fechaCreacion);
    return bDate.getTime() - aDate.getTime(); // Newer dates first
  }

  // Persist and restore sort selection
  onSortChange(value: string): void {
    this.defaultValue = value;
    this.setCookie(this.SORT_COOKIE_KEY, value, 365);
  }

  private restoreSortFromCookie(): void {
    const cookieValue = this.getCookie(this.SORT_COOKIE_KEY);
    const validValues = ['priority', 'dueDate', 'creationDate'];
    if (cookieValue && validValues.includes(cookieValue)) {
      this.defaultValue = cookieValue;
    }
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  getTasksByStatus(status: string): any[] {
    if (!this.filteredTasksData || !Array.isArray(this.filteredTasksData)) {
      return [];
    }

    // Filter tasks by status and apply custom sorting
    return this.filteredTasksData
      .filter((task: any) => task.tarea.estado === status)
      .sort((a: any, b: any) => {
        // 1) User priority always comes first
        if (a.asignacion.esPrioridad && !b.asignacion.esPrioridad) {
          return -1; // a comes before b
        }
        if (!a.asignacion.esPrioridad && b.asignacion.esPrioridad) {
          return 1; // b comes before a
        }
        
        // 2) If both have same user priority status, apply secondary sorting
        return this.getSecondarySorting(a, b);
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

  async saveTaskChanges(): Promise<void> {
    if (!this.taskForm.valid || !this.selectedTask) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // CRITICAL: Capture the task reference BEFORE the API call
    // This prevents race conditions when user opens another modal before this one finishes
    const taskToUpdate = JSON.parse(JSON.stringify(this.selectedTask));
    
    // Update the task data in the captured reference
    taskToUpdate.tarea.titulo = this.taskForm.value.titulo;
    taskToUpdate.tarea.prioridad = this.taskForm.value.prioridad;
    taskToUpdate.tarea.estado = this.taskForm.value.estado;
    taskToUpdate.tarea.nota = this.taskForm.value.nota;
    taskToUpdate.asignacion.esPrioridad = this.taskForm.value.esPrioridad;

    const taskId = taskToUpdate.tarea.id;

    // Show loading toast
    const loadingToast = toast.loading('Guardando cambios...');

    try {
      console.log('Saving task changes for task ID:', taskId);

      // Update task via API using the captured reference
      await this.updateTask(taskToUpdate);

      // Update local data after successful API call
      // Use the captured reference, NOT this.selectedTask
      this.updateOriginalTaskData(taskToUpdate);

      toast.success('Tarea actualizada correctamente', {
        id: loadingToast
      });
      
      console.log('Task changes saved successfully for task ID:', taskId);
    } catch (error) {
      console.error('Error saving task changes for task ID:', taskId, error);
      toast.error('Error al guardar los cambios', {
        id: loadingToast
      });
    }
  }

  // Toggle personal priority (star)
  async togglePersonalPriority(task: any): Promise<void> {
    if (!task || !task.tarea || !task.tarea.id) {
      console.error('Invalid task provided to togglePersonalPriority');
      return;
    }

    // CRITICAL: Capture the task reference and ID BEFORE the API call
    // This prevents race conditions when user interacts with multiple tasks rapidly
    const taskId = task.tarea.id;
    const taskToUpdate = JSON.parse(JSON.stringify(task));

    // Show loading toast
    const loadingToast = toast.loading('Actualizando prioridad...');

    try {
      const baseUrl = this.getApiUrl();
      const response = await fetch(`${baseUrl}/api/tasks/priority/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.userName
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar prioridad');
      }

      const responseData = await response.json();
      const isCurrentPriority = responseData?.current;
      
      console.log('Priority updated successfully for task ID:', taskId, 'New priority:', isCurrentPriority);
      
      // Update the captured task data
      taskToUpdate.asignacion.esPrioridad = isCurrentPriority;

      if (!isCurrentPriority) {
        // If no longer a priority, remove from the list
        this.removeTaskFromStateById(taskId);
      } else {
        // If still a priority, update the local data
        this.updateLocalTaskContainer(taskToUpdate);
      }

      const message = isCurrentPriority ? 'Agregada a tus prioridades' : 'Quitada de tus prioridades';
      toast.success(message, {
        id: loadingToast
      });
    } catch (error) {
      console.error('Error updating priority for task ID:', taskId, error);
      toast.error('Error al actualizar la prioridad', {
        id: loadingToast
      });
    }
  }

  // Remove a task (by tarea.id) from local containers and trigger change detection
  private removeTaskFromStateById(tareaId: any): void {
    if (!tareaId) return;

    if (Array.isArray(this.tasksData)) {
      const newTasks = this.tasksData.filter((t: any) => t?.tarea?.id !== tareaId);
      if (newTasks.length !== this.tasksData.length) {
        this.tasksData = newTasks;
      }
    }

    if (Array.isArray(this.filteredTasksData)) {
      const newFiltered = this.filteredTasksData.filter((t: any) => t?.tarea?.id !== tareaId);
      if (newFiltered.length !== this.filteredTasksData.length) {
        this.filteredTasksData = newFiltered;
      }
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
      // Don't update local data here - let the caller handle it
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
      
      // First, update the task via API using the captured reference
      await this.updateTask(taskToUpdate);
      
      console.log('API call successful for task ID:', taskId, ', updating local data...');

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

  // Update original task data in the tasks array and filtered copy
  private updateOriginalTaskData(updatedTask: any): void {
    this.updateLocalTaskContainer(updatedTask);
  }

  // Apply an updated tarea entity into the local containers
  private applyUpdatedTarea(updatedTarea: any): void {
    if (!updatedTarea || !updatedTarea.id) return;

    const containerItem = this.findTaskContainerByTareaId(updatedTarea.id);
    if (!containerItem) return;

    // Merge updated fields into the container's tarea
    containerItem.tarea = { ...containerItem.tarea, ...updatedTarea };
    // Reflect in both arrays
    this.updateLocalTaskContainer(containerItem);
  }

  // Find the wrapper object that contains tarea by id (from either array)
  private findTaskContainerByTareaId(tareaId: any): any | null {
    if (Array.isArray(this.tasksData)) {
      const found = this.tasksData.find((t: any) => t?.tarea?.id === tareaId);
      if (found) return found;
    }
    if (Array.isArray(this.filteredTasksData)) {
      const found = this.filteredTasksData.find((t: any) => t?.tarea?.id === tareaId);
      if (found) return found;
    }
    return null;
  }

  // Replace the task container in both arrays and trigger change detection
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

    // Update filteredTasksData with immutability (deep copy to ensure change detection)
    if (Array.isArray(this.filteredTasksData)) {
      const fIdx = this.filteredTasksData.findIndex((t: any) => t?.tarea?.id === updatedContainer.tarea.id);
      if (fIdx !== -1) {
        // Create a deep copy of the updated container to ensure Angular detects the change
        const deepCopy = JSON.parse(JSON.stringify(updatedContainer));
        this.filteredTasksData = [
          ...this.filteredTasksData.slice(0, fIdx),
          deepCopy,
          ...this.filteredTasksData.slice(fIdx + 1)
        ];
        changed = true;
        console.log('Task data updated in filteredTasksData at index:', fIdx, 'New estado:', deepCopy.tarea.estado);
      } else {
        console.warn('Task not found in filteredTasksData, id:', updatedContainer.tarea.id);
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

  // Check if task is overdue
  isTaskOverdue(task: any): boolean {
    if (!task.tarea.fechaVencimiento) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.tarea.fechaVencimiento);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
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
