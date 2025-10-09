import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ZardToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ZardToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Kairo');
}
