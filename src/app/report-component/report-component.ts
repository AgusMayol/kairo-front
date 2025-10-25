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

import { ZardTooltipModule } from '@shared/components/tooltip/tooltip';
import { environment } from '../../environments/environment';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-report-component',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ZardTooltipModule, ZardButtonComponent, ZardAvatarComponent, ZardDividerComponent],
  templateUrl: './report-component.html',
  styleUrl: './report-component.css'
})
export class ReportComponent implements OnInit {
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

  @ViewChild('sidebarContent', { static: true }) sidebarContentTemplate!: TemplateRef<any>;

  constructor(private router: Router, private fb: FormBuilder, private alertDialogService: ZardAlertDialogService, private sheetService: ZardSheetService) {
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
    this.createPieChart();
    this.createProductivityGauge();
  }


  createPieChart() {
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

    this.chart = new Chart("MyChart", {
      type: 'pie', //this denotes tha type of chart

      data: {// values on X-Axis
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
        aspectRatio: 2.5
      }

    });
  }

  createProductivityGauge() {

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

    this.productivityGauge = new Chart("ProductivityGauge", {
      type: 'doughnut',
      data,
      options: {
        aspectRatio: 2.5,
        circumference: 180,
        rotation: -90,
        plugins: {

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
      return;
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      this.isLoading = false;
    }
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
