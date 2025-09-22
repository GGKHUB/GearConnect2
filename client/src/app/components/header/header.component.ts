import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a routerLink="/feed" class="logo">
            <i class="fas fa-car"></i>
            <span>GearConnect</span>
          </a>
          
          <nav class="nav" *ngIf="currentUser">
            <a routerLink="/feed" class="nav-link">
              <i class="fas fa-home"></i>
              Feed
            </a>
            <a routerLink="/create-post" class="nav-link">
              <i class="fas fa-plus"></i>
              Create Post
            </a>
            <a routerLink="/create-story" class="nav-link">
              <i class="fas fa-book-open"></i>
              Add Story
            </a>
            <a routerLink="/profile" class="nav-link">
              <i class="fas fa-user"></i>
              Profile
            </a>
          </nav>
          
          <div class="user-section" *ngIf="currentUser">
            <div class="user-info" (click)="viewUserProfile()">
              <img 
                    [src]="getImageUrl(currentUser.profilePicture || '/assets/default-avatar.svg')"
                [alt]="currentUser.username"
                class="user-avatar clickable-avatar"
              >
              <span class="username clickable-username">{{ currentUser.username }}</span>
            </div>
            <button class="btn btn-outline" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 0;
    }
    
    .logo {
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: bold;
      color: #e74c3c;
      text-decoration: none;
      transition: color 0.3s ease, transform 0.2s ease;
      cursor: pointer;
    }
    
    .logo:hover {
      color: #c0392b;
      transform: scale(1.05);
    }
    
    .logo i {
      margin-right: 10px;
      font-size: 28px;
    }
    
    .nav {
      display: flex;
      gap: 30px;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #333;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .nav-link:hover {
      color: #e74c3c;
    }
    
    .nav-link i {
      margin-right: 8px;
    }
    
    .user-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .user-info:hover {
      transform: scale(1.05);
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e74c3c;
    }

    .clickable-avatar {
      transition: transform 0.2s ease;
    }

    .clickable-avatar:hover {
      transform: scale(1.1);
    }
    
    .username {
      font-weight: 600;
      color: #333;
    }

    .clickable-username {
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .clickable-username:hover {
      color: #e74c3c;
    }
    
    @media (max-width: 768px) {
      .nav {
        display: none;
      }
      
      .user-info .username {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '/assets/default-avatar.svg';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  }

  viewUserProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['/user', this.currentUser.id.toString()]);
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
