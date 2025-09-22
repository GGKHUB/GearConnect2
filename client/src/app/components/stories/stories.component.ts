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
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.css']
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
