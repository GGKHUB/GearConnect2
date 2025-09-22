import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../services/post.service';

@Component({
  selector: 'app-post-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="post-viewer-overlay" *ngIf="isVisible" (click)="close()">
      <div class="post-viewer-container" (click)="$event.stopPropagation()">
        <div class="post-viewer-header">
          <div class="user-info">
            <img 
              [src]="getImageUrl(post?.userId?.profilePicture || '/assets/default-avatar.svg')" 
              [alt]="post?.userId?.username || 'User'"
              class="user-avatar"
            >
            <div class="user-details">
              <h3>{{ post?.userId?.username || 'Unknown User' }}</h3>
              <p class="post-time">{{ formatDate(post?.createdAt) }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="close()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="post-viewer-content">
          <div class="post-image-container">
            <img 
              [src]="getImageUrl(post?.imageUrl)" 
              [alt]="post?.caption"
              class="post-image"
            >
          </div>
          
          <div class="post-details">
            <p class="post-caption" *ngIf="post?.caption">{{ post?.caption }}</p>
            
            <div class="post-stats">
              <div class="stat">
                <i class="fas fa-heart"></i>
                <span>{{ post?.likes?.length || 0 }} likes</span>
              </div>
              <div class="stat">
                <i class="fas fa-comment"></i>
                <span>{{ post?.comments?.length || 0 }} comments</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="post-viewer-navigation" *ngIf="showNavigation">
          <button 
            class="nav-btn prev-btn" 
            (click)="previousPost()"
            [disabled]="!hasPrevious"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button 
            class="nav-btn next-btn" 
            (click)="nextPost()"
            [disabled]="!hasNext"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .post-viewer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .post-viewer-container {
      background: white;
      border-radius: 16px;
      max-width: 90vw;
      max-height: 90vh;
      width: 100%;
      max-width: 800px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .post-viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
      background: white;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e74c3c;
    }
    
    .user-details h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
    
    .post-time {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .close-btn {
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
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    
    .close-btn:hover {
      background: #c0392b;
    }
    
    .post-viewer-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .post-image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      min-height: 400px;
    }
    
    .post-image {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 8px;
    }
    
    .post-details {
      padding: 20px;
      background: white;
    }
    
    .post-caption {
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      margin-bottom: 15px;
    }
    
    .post-stats {
      display: flex;
      gap: 20px;
    }
    
    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }
    
    .stat i {
      color: #e74c3c;
    }
    
    .post-viewer-navigation {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      transform: translateY(-50%);
    }
    
    .nav-btn {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.3s ease;
      pointer-events: all;
      margin: 0 20px;
    }
    
    .nav-btn:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
    }
    
    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .post-viewer-container {
        max-width: 95vw;
        max-height: 95vh;
      }
      
      .post-viewer-header {
        padding: 15px;
      }
      
      .user-info {
        gap: 10px;
      }
      
      .user-avatar {
        width: 40px;
        height: 40px;
      }
      
      .user-details h3 {
        font-size: 16px;
      }
      
      .post-image-container {
        min-height: 300px;
      }
      
      .post-image {
        max-height: 60vh;
      }
      
      .nav-btn {
        width: 40px;
        height: 40px;
        font-size: 16px;
        margin: 0 10px;
      }
    }
  `]
})
export class PostViewerComponent {
  @Input() post: Post | null = null;
  @Input() isVisible: boolean = false;
  @Input() posts: Post[] = [];
  @Input() currentIndex: number = 0;
  @Input() showNavigation: boolean = false;
  
  @Output() closeEvent = new EventEmitter<void>();
  @Output() previousEvent = new EventEmitter<void>();
  @Output() nextEvent = new EventEmitter<void>();

  get hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  get hasNext(): boolean {
    return this.currentIndex < this.posts.length - 1;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.isVisible) return;
    
    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        if (this.hasPrevious) {
          this.previousPost();
        }
        break;
      case 'ArrowRight':
        if (this.hasNext) {
          this.nextPost();
        }
        break;
    }
  }

  close(): void {
    this.closeEvent.emit();
  }

  previousPost(): void {
    if (this.hasPrevious) {
      this.previousEvent.emit();
    }
  }

  nextPost(): void {
    if (this.hasNext) {
      this.nextEvent.emit();
    }
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '/assets/default-avatar.svg';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }
}
