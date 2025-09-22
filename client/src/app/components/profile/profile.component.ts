import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="container">
        <div class="profile-header">
          <div class="profile-avatar-section">
            <div class="avatar-container">
              <img 
                [src]="getImageUrl(currentUser?.profilePicture || '/assets/default-avatar.svg')" 
                [alt]="currentUser?.username"
                class="profile-avatar"
              >
              <button class="avatar-edit-btn" (click)="fileInput.click()" [disabled]="isLoading">
                <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
                <i class="fas fa-camera" *ngIf="!isLoading"></i>
              </button>
            </div>
            <input 
              #fileInput
              type="file" 
              accept="image/*" 
              (change)="onFileSelected($event)"
              style="display: none"
            >
          </div>
          
          <div class="profile-info">
            <h1>{{ currentUser?.username }}</h1>
            <p class="join-date">
              <i class="fas fa-calendar"></i>
              Joined {{ formatDate(currentUser?.joinDate) }}
            </p>
          </div>
        </div>
        
        <div class="profile-content">
          <div class="profile-form">
            <h2>Profile Information</h2>
            
            <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
              <div class="row">
                <div class="col-6">
                  <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      [(ngModel)]="profileData.firstName"
                      class="form-control"
                      placeholder="Enter your first name"
                    >
                  </div>
                </div>
                
                <div class="col-6">
                  <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      [(ngModel)]="profileData.lastName"
                      class="form-control"
                      placeholder="Enter your last name"
                    >
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  [(ngModel)]="profileData.bio"
                  class="form-control"
                  rows="4"
                  placeholder="Tell us about yourself and your passion for cars..."
                ></textarea>
              </div>
              
              <div class="row">
                <div class="col-6">
                  <div class="form-group">
                    <label for="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      [(ngModel)]="profileData.location"
                      class="form-control"
                      placeholder="City, Country"
                    >
                  </div>
                </div>
                
                <div class="col-6">
                  <div class="form-group">
                    <label for="favoriteCarBrand">Favorite Car Brand</label>
                    <select
                      id="favoriteCarBrand"
                      name="favoriteCarBrand"
                      [(ngModel)]="profileData.favoriteCarBrand"
                      class="form-control"
                    >
                      <option value="">Select your favorite brand</option>
                      <option value="Ferrari">Ferrari</option>
                      <option value="Lamborghini">Lamborghini</option>
                      <option value="Porsche">Porsche</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Audi">Audi</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Ford">Ford</option>
                      <option value="Chevrolet">Chevrolet</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Subaru">Subaru</option>
                      <option value="Volkswagen">Volkswagen</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="alert alert-success" *ngIf="successMessage">
                {{ successMessage }}
              </div>
              
              <div class="alert alert-error" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>
              
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="isLoading"
              >
                <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
                <i class="fas fa-save" *ngIf="!isLoading"></i>
                {{ isLoading ? 'Saving...' : 'Save Profile' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 40px 0;
    }
    
    .profile-header {
      background: white;
      border-radius: 16px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 30px;
    }
    
    .profile-avatar-section {
      position: relative;
    }
    
    .avatar-container {
      position: relative;
      display: inline-block;
    }
    
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e74c3c;
    }
    
    .avatar-edit-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }
    
    .avatar-edit-btn:hover:not(:disabled) {
      background: #c0392b;
    }
    
    .avatar-edit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .profile-info h1 {
      font-size: 32px;
      color: #333;
      margin-bottom: 10px;
    }
    
    .join-date {
      color: #666;
      font-size: 16px;
    }
    
    .join-date i {
      margin-right: 8px;
    }
    
    .profile-content {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .profile-form h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 30px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #555;
    }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #e74c3c;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }
    
    select.form-control {
      cursor: pointer;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-primary {
      background-color: #e74c3c;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #c0392b;
      transform: translateY(-2px);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }
      
      .profile-avatar {
        width: 100px;
        height: 100px;
      }
      
      .profile-info h1 {
        font-size: 28px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileData = {
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    favoriteCarBrand: ''
  };
  
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileData = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          bio: user.bio || '',
          location: user.location || '',
          favoriteCarBrand: user.favoriteCarBrand || ''
        };
      }
    });

    // Fetch complete profile data from backend
    this.authService.getProfile().subscribe({
      next: () => {
        // Profile data will be updated via the currentUser$ subscription above
      },
      error: (error) => {
        console.error('Failed to fetch profile data:', error);
        this.errorMessage = 'Failed to load profile data. Please refresh the page.';
      }
    });
  }

  updateProfile(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    this.authService.updateProfile(this.profileData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file.';
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB.';
        return;
      }
      
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      this.authService.uploadProfilePicture(file).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Profile picture updated successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to upload profile picture. Please try again.';
        }
      });
    }
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '/assets/default-avatar.svg';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
