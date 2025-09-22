import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your GearConnect account</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="credentials.email"
              #email="ngModel"
              required
              email
              class="form-control"
              [class.error]="email.invalid && email.touched"
              placeholder="Enter your email"
            >
            <div class="error-message" *ngIf="email.invalid && email.touched">
              <span *ngIf="email.errors?.['required']">Email is required</span>
              <span *ngIf="email.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.password"
              #password="ngModel"
              required
              minlength="6"
              class="form-control"
              [class.error]="password.invalid && password.touched"
              placeholder="Enter your password"
            >
            <div class="error-message" *ngIf="password.invalid && password.touched">
              <span *ngIf="password.errors?.['required']">Password is required</span>
              <span *ngIf="password.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>
          
          <div class="alert alert-error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          
          <button
            type="submit"
            class="btn btn-primary btn-full"
            [disabled]="loginForm.invalid || isLoading"
          >
            <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
            <i class="fas fa-sign-in-alt" *ngIf="!isLoading"></i>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Sign up here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url('/assets/login-background.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: 20px;
      position: relative;
    }
    
    .auth-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1;
    }
    
    .auth-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      padding: 40px;
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 2;
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .auth-header h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 10px;
    }
    
    .auth-header p {
      color: #666;
      font-size: 16px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-control {
      width: 100%;
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #e74c3c;
    }
    
    .form-control.error {
      border-color: #e74c3c;
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .btn-full {
      width: 100%;
      padding: 15px;
      font-size: 16px;
      margin-top: 10px;
    }
    
    .btn i {
      margin-right: 8px;
    }
    
    .auth-footer {
      text-align: center;
      margin-top: 30px;
    }
    
    .auth-footer a {
      color: #e74c3c;
      text-decoration: none;
      font-weight: 600;
    }
    
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
