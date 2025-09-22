import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { Story } from '../../models/story.model';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stories-container">
      <div class="stories-header">
        <h3>
          <i class="fas fa-clock"></i>
          Stories
        </h3>
        <button class="create-story-btn" (click)="createStory()">
          <i class="fas fa-plus"></i>
          Add Story
        </button>
      </div>

      <div class="stories-scroll" *ngIf="stories.length > 0">
        <div class="story-item" 
             *ngFor="let story of stories" 
             (click)="viewStory(story)"
             [class.own-story]="isOwnStory(story)">
          <div class="story-avatar">
            <img 
              [src]="getImageUrl(story.userId.profilePicture)" 
              [alt]="story.userId.username"
              class="avatar-img"
            >
            <div class="story-indicator"></div>
          </div>
          <div class="story-info">
            <span class="username">{{ story.userId.username }}</span>
            <span class="time-ago">{{ getTimeAgo(story.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="no-stories" *ngIf="stories.length === 0 && !isLoading">
        <i class="fas fa-book-open"></i>
        <h4>No stories yet</h4>
        <p>Be the first to share your automotive story!</p>
        <button class="btn btn-primary" (click)="createStory()">
          <i class="fas fa-plus"></i>
          Create Story
        </button>
      </div>

      <div class="loading-stories" *ngIf="isLoading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading stories...</span>
      </div>
    </div>

    <!-- Story Viewer Modal -->
    <div class="story-modal" *ngIf="selectedStory" (click)="closeStoryViewer()">
      <div class="story-viewer" (click)="$event.stopPropagation()">
        <div class="story-header">
          <div class="story-user">
            <img 
              [src]="getImageUrl(selectedStory.userId.profilePicture)" 
              [alt]="selectedStory.userId.username"
              class="user-avatar"
            >
            <div class="user-info">
              <span class="username">{{ selectedStory.userId.username }}</span>
              <span class="time">{{ getTimeAgo(selectedStory.createdAt) }}</span>
            </div>
          </div>
          <div class="story-actions">
            <span class="views" *ngIf="selectedStory.views > 0">
              <i class="fas fa-eye"></i>
              {{ selectedStory.views }}
            </span>
            <button class="delete-btn" 
                    *ngIf="isOwnStory(selectedStory)" 
                    (click)="deleteStory(selectedStory.id)">
              <i class="fas fa-trash"></i>
            </button>
            <button class="close-btn" (click)="closeStoryViewer()">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="story-content">
          <div class="story-image" *ngIf="selectedStory.imageUrl">
            <img [src]="getImageUrl(selectedStory.imageUrl)" [alt]="selectedStory.content">
          </div>
          <div class="story-text">
            <p>{{ selectedStory.content }}</p>
          </div>
        </div>

        <div class="story-progress">
          <div class="progress-bar" [style.width.%]="storyProgress"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stories-container {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .stories-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .stories-header h3 {
      margin: 0;
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
    }

    .create-story-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .create-story-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }

    .stories-scroll {
      display: flex;
      gap: 15px;
      overflow-x: auto;
      padding-bottom: 10px;
      scrollbar-width: thin;
    }

    .stories-scroll::-webkit-scrollbar {
      height: 6px;
    }

    .stories-scroll::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .stories-scroll::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .story-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .story-item:hover {
      transform: scale(1.05);
    }

    .story-avatar {
      position: relative;
      margin-bottom: 8px;
    }

    .avatar-img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #667eea, #764ba2) border-box;
    }

    .own-story .avatar-img {
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #e74c3c, #f39c12) border-box;
    }

    .story-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: 2px solid white;
      border-radius: 50%;
    }

    .story-info {
      text-align: center;
    }

    .username {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .time-ago {
      font-size: 10px;
      color: #666;
    }

    .no-stories {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-stories i {
      font-size: 48px;
      color: #ddd;
      margin-bottom: 15px;
    }

    .no-stories h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .no-stories p {
      margin: 0 0 20px 0;
    }

    .loading-stories {
      text-align: center;
      padding: 20px;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .story-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .story-viewer {
      background: white;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      position: relative;
    }

    .story-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #f1f1f1;
    }

    .story-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info .username {
      display: block;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .user-info .time {
      font-size: 12px;
      color: #666;
    }

    .story-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .views {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      font-size: 14px;
    }

    .delete-btn,
    .close-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      font-size: 16px;
    }

    .delete-btn:hover {
      background: #fee;
      color: #e74c3c;
    }

    .close-btn:hover {
      background: #f1f1f1;
      color: #333;
    }

    .story-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    .story-image img {
      width: 100%;
      height: auto;
      display: block;
    }

    .story-text {
      padding: 20px;
    }

    .story-text p {
      margin: 0;
      line-height: 1.6;
      color: #333;
      font-size: 16px;
    }

    .story-progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.3);
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transition: width 0.1s linear;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }

    .fa-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .stories-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .create-story-btn {
        justify-content: center;
      }

      .story-viewer {
        margin: 10px;
        max-height: 85vh;
      }
    }
  `]
})
export class StoriesComponent implements OnInit, OnDestroy {
  stories: Story[] = [];
  selectedStory: Story | null = null;
  isLoading = false;
  storyProgress = 0;
  private storyTimer: any = null;
  private currentUserId: number | null = null;

  constructor(
    private storyService: StoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadStories();
  }

  private loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id ? Number(user.id) : null;
  }

  loadStories(): void {
    this.isLoading = true;
    this.storyService.getStories().subscribe({
      next: (stories) => {
        this.stories = stories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stories:', error);
        this.isLoading = false;
      }
    });
  }

  createStory(): void {
    this.router.navigate(['/create-story']);
  }

  viewStory(story: Story): void {
    this.selectedStory = story;
    this.storyProgress = 0;
    this.startStoryProgress();

    // Increment view count
    this.storyService.viewStory(story.id).subscribe({
      next: (updatedStory) => {
        if (this.selectedStory) {
          this.selectedStory.views = updatedStory.views;
        }
      },
      error: (error) => {
        console.error('Error viewing story:', error);
      }
    });
  }

  closeStoryViewer(): void {
    this.selectedStory = null;
    this.stopStoryProgress();
  }

  deleteStory(storyId: number): void {
    if (confirm('Are you sure you want to delete this story?')) {
      this.storyService.deleteStory(storyId).subscribe({
        next: () => {
          this.stories = this.stories.filter(story => story.id !== storyId);
          this.closeStoryViewer();
        },
        error: (error) => {
          console.error('Error deleting story:', error);
          alert('Failed to delete story. Please try again.');
        }
      });
    }
  }

  isOwnStory(story: Story): boolean {
    return story.userId.id === this.currentUserId;
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${Math.floor(hours / 24)}d ago`;
    }
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '/assets/default-avatar.png';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  }

  private startStoryProgress(): void {
    this.storyProgress = 0;
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    this.storyTimer = setInterval(() => {
      this.storyProgress += increment;
      if (this.storyProgress >= 100) {
        this.closeStoryViewer();
      }
    }, interval);
  }

  private stopStoryProgress(): void {
    if (this.storyTimer) {
      clearInterval(this.storyTimer);
      this.storyTimer = null;
    }
    this.storyProgress = 0;
  }

  ngOnDestroy(): void {
    this.stopStoryProgress();
  }
}
