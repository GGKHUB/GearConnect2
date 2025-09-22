import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-post-container">
      <div class="container">
        <div class="create-post-header">
          <h1><i class="fas fa-plus"></i> Create New Post</h1>
          <p>Share your car photos with the community</p>
        </div>
        
        <div class="create-post-content">
          <div class="post-form">
            <form (ngSubmit)="createPost()" #postForm="ngForm">
              <div class="form-group">
                <label for="image">Select Photo</label>
                <div class="file-upload-area" [class.has-file]="selectedFile" (click)="fileInput.click()">
                  <div class="file-upload-content" *ngIf="!selectedFile">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Click to select a photo or drag and drop</p>
                    <span class="file-types">JPG, PNG, GIF up to 10MB</span>
                  </div>
                  <div class="file-preview" *ngIf="selectedFile">
                    <img [src]="imagePreview" [alt]="selectedFile.name" class="preview-image">
                    <div class="file-info">
                      <p class="file-name">{{ selectedFile.name }}</p>
                      <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                    </div>
                    <button type="button" class="remove-file" (click)="removeFile()">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <input 
                  #fileInput
                  type="file" 
                  accept="image/*" 
                  (change)="onFileSelected($event)"
                  style="display: none"
                >
                <div class="error-message" *ngIf="!selectedFile && postForm.submitted">
                  Please select a photo
                </div>
              </div>
              
              <div class="form-group">
                <label for="caption">Caption (Optional)</label>
                <textarea
                  id="caption"
                  name="caption"
                  [(ngModel)]="postData.caption"
                  class="form-control"
                  rows="4"
                  placeholder="Tell us about your car or share your thoughts..."
                  maxlength="1000"
                ></textarea>
                <div class="character-count">
                  {{ postData.caption.length }}/1000 characters
                </div>
              </div>
              
              <div class="alert alert-error" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>
              
              <div class="form-actions">
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="goBack()"
                >
                  <i class="fas fa-arrow-left"></i>
                  Cancel
                </button>
                
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="!selectedFile || isLoading"
                >
                  <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
                  <i class="fas fa-share" *ngIf="!isLoading"></i>
                  {{ isLoading ? 'Creating Post...' : 'Create Post' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-post-container {
      padding: 40px 0;
    }
    
    .create-post-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .create-post-header h1 {
      font-size: 32px;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 10px;
    }
    
    .create-post-header h1 i {
      color: #e74c3c;
    }
    
    .create-post-header p {
      color: #666;
      font-size: 18px;
    }
    
    .create-post-content {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .post-form {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .form-group {
      margin-bottom: 30px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      color: #555;
      font-size: 16px;
    }
    
    .file-upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }
    
    .file-upload-area:hover {
      border-color: #e74c3c;
      background: #fef9f9;
    }
    
    .file-upload-area.has-file {
      border-color: #e74c3c;
      background: #fef9f9;
    }
    
    .file-upload-content i {
      font-size: 48px;
      color: #e74c3c;
      margin-bottom: 20px;
    }
    
    .file-upload-content p {
      font-size: 18px;
      color: #333;
      margin-bottom: 10px;
    }
    
    .file-types {
      color: #666;
      font-size: 14px;
    }
    
    .file-preview {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
    }
    
    .preview-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #e74c3c;
    }
    
    .file-info {
      flex: 1;
      text-align: left;
    }
    
    .file-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
      word-break: break-word;
    }
    
    .file-size {
      color: #666;
      font-size: 14px;
    }
    
    .remove-file {
      position: absolute;
      top: -10px;
      right: -10px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }
    
    .remove-file:hover {
      background: #c0392b;
    }
    
    .form-control {
      width: 100%;
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      font-family: inherit;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #e74c3c;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 120px;
    }
    
    .character-count {
      text-align: right;
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .form-actions {
      display: flex;
      gap: 20px;
      justify-content: flex-end;
      margin-top: 30px;
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
      text-decoration: none;
    }
    
    .btn-primary {
      background-color: #e74c3c;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #c0392b;
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #5a6268;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .create-post-header h1 {
        font-size: 28px;
        flex-direction: column;
        gap: 10px;
      }
      
      .post-form {
        padding: 30px 20px;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .file-preview {
        flex-direction: column;
        text-align: center;
      }
      
      .file-info {
        text-align: center;
      }
    }
  `]
})
export class CreatePostComponent {
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  postData = {
    caption: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 10MB';
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file';
        return;
      }
      
      this.selectedFile = file;
      this.errorMessage = '';
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.errorMessage = '';
  }

  createPost(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a photo';
      return;
    }
    
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('caption', this.postData.caption);
    
    this.postService.createPost(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.router.navigate(['/feed']);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create post. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
