import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoryService } from '../../services/story.service';

@Component({
  selector: 'app-create-story',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-story-container">
      <div class="create-story-card">
        <div class="story-header">
          <h2>
            <i class="fas fa-plus-circle"></i>
            Create Your Story
          </h2>
          <button class="close-btn" (click)="goBack()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" #storyForm="ngForm">
          <div class="form-group">
            <label for="content">What's on your mind?</label>
            <textarea
              id="content"
              name="content"
              [(ngModel)]="storyContent"
              #content="ngModel"
              required
              maxlength="500"
              class="form-control story-textarea"
              placeholder="Share your automotive story, experience, or thoughts..."
              rows="6"
            ></textarea>
            <div class="char-count">
              {{ storyContent.length }}/500
            </div>
            <div class="error-message" *ngIf="content.invalid && content.touched">
              <span *ngIf="content.errors?.['required']">Story content is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="image">Add an Image (Optional)</label>
            <div class="file-upload-area" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
              <input
                type="file"
                id="image"
                name="image"
                (change)="onFileSelected($event)"
                accept="image/*"
                class="file-input"
              >
              <div class="upload-content" *ngIf="!selectedFile">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop an image here or click to select</p>
                <span class="file-types">PNG, JPG, GIF up to 5MB</span>
              </div>
              <div class="preview-area" *ngIf="selectedFile">
                <img [src]="imagePreview" alt="Preview" class="image-preview">
                <button type="button" class="remove-image" (click)="removeImage()">
                  <i class="fas fa-times"></i>
                </button>
              </div>
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
              [disabled]="isLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="storyForm.invalid || isLoading"
            >
              <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
              <i class="fas fa-share" *ngIf="!isLoading"></i>
              {{ isLoading ? 'Sharing...' : 'Share Story' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-story-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .create-story-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 30px;
      width: 100%;
      max-width: 600px;
      position: relative;
    }

    .story-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f1f1f1;
    }

    .story-header h2 {
      color: #333;
      margin: 0;
      font-size: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: #999;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #f1f1f1;
      color: #333;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 600;
    }

    .story-textarea {
      width: 100%;
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 12px;
      font-size: 16px;
      font-family: inherit;
      resize: vertical;
      min-height: 120px;
      transition: border-color 0.3s ease;
    }

    .story-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .char-count {
      text-align: right;
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }

    .file-upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .file-upload-area:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .file-upload-area.drag-over {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .file-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .upload-content i {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 15px;
    }

    .upload-content p {
      color: #333;
      margin: 0 0 5px 0;
      font-size: 16px;
    }

    .file-types {
      color: #999;
      font-size: 14px;
    }

    .preview-area {
      position: relative;
      display: inline-block;
    }

    .image-preview {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .remove-image {
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
      font-size: 14px;
      transition: background 0.3s ease;
    }

    .remove-image:hover {
      background: #c0392b;
    }

    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f1f1f1;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 2px solid #ddd;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e9ecef;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .fa-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .create-story-card {
        margin: 10px;
        padding: 20px;
      }

      .story-header h2 {
        font-size: 20px;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class CreateStoryComponent {
  storyContent = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private storyService: StoryService,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.add('drag-over');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('drag-over');

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 5MB.';
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

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.isLoading || !this.storyContent.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('content', this.storyContent.trim());
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.storyService.createStory(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create story. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }
}


