import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { TestService } from './services/test.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="app">
      <app-header></app-header>
      <main>
        <!-- Debug info for development -->
        <div *ngIf="!environment.production" style="background: #fff3cd; padding: 10px; margin: 10px; border: 1px solid #ffeaa7; border-radius: 4px;">
          <strong>Debug Info:</strong><br>
          Environment: {{ environment.production ? 'Production' : 'Development' }}<br>
          API URL: {{ environment.apiUrl }}<br>
          <button (click)="testConnection()" style="margin: 5px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px;">Test API Connection</button>
          <button (click)="testRegister()" style="margin: 5px; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 3px;">Test Register</button>
        </div>
        
        <!-- Production debug info -->
        <div *ngIf="environment.production" style="background: #d1ecf1; padding: 10px; margin: 10px; border: 1px solid #bee5eb; border-radius: 4px; font-size: 12px;">
          <strong>Production Debug:</strong><br>
          API URL: {{ environment.apiUrl }}<br>
          <button (click)="testConnection()" style="margin: 5px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; font-size: 12px;">Test API</button>
        </div>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    main {
      padding-top: 80px;
    }
  `]
})
export class AppComponent {
  title = 'GearConnect';
  environment = environment;

  constructor(private testService: TestService) {}

  testConnection() {
    console.log('Testing API connection...');
    this.testService.testConnection().subscribe({
      next: (response) => {
        console.log('✅ API Connection successful:', response);
        alert('✅ API Connection successful! Check console for details.');
      },
      error: (error) => {
        console.error('❌ API Connection failed:', error);
        alert('❌ API Connection failed! Check console for details.');
      }
    });
  }

  testRegister() {
    console.log('Testing registration...');
    this.testService.testRegister().subscribe({
      next: (response) => {
        console.log('✅ Registration test successful:', response);
        alert('✅ Registration test successful! Check console for details.');
      },
      error: (error) => {
        console.error('❌ Registration test failed:', error);
        alert('❌ Registration test failed! Check console for details.');
      }
    });
  }
}
