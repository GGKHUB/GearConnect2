import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { PostViewerComponent } from '../post-viewer/post-viewer.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, PostViewerComponent],
  template: `
    <div class="user-profile-container">
      <div class="container">
        <div class="profile-header">
          <button class="back-btn" (click)="goBack()">
            <i class="fas fa-arrow-left"></i>
            Back to Feed
          </button>
        </div>
        
        <div class="profile-content" *ngIf="userProfile">
          <div class="profile-info">
            <div class="profile-avatar-section">
              <img 
                [src]="getImageUrl(userProfile.profilePicture)" 
                [alt]="userProfile.username"
                class="profile-avatar"
              >
            </div>
            
            <div class="profile-details">
              <h1>{{ userProfile.username }}</h1>
              <p class="join-date" *ngIf="userProfile.joinDate">
                <i class="fas fa-calendar"></i>
                Joined {{ formatDate(userProfile.joinDate) }}
              </p>
              <p class="bio" *ngIf="userProfile.bio">{{ userProfile.bio }}</p>
              <div class="profile-stats">
                <div class="stat">
                  <span class="stat-number">{{ userPosts.length }}</span>
                  <span class="stat-label">Posts</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ totalLikes }}</span>
                  <span class="stat-label">Total Likes</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="posts-section">
            <h2>{{ userProfile.username }}'s Posts</h2>
            
            <div class="loading" *ngIf="isLoading">
              <div class="spinner"></div>
              <p>Loading posts...</p>
            </div>
            
            <div class="posts-grid" *ngIf="!isLoading && userPosts.length > 0">
              <div class="post-card" *ngFor="let post of userPosts">
                <img [src]="getImageUrl(post.imageUrl)" [alt]="post.caption" class="post-thumbnail" (click)="viewPost(post)">
                <div class="post-overlay" (click)="viewPost(post)">
                  <div class="post-stats">
                    <span><i class="fas fa-heart"></i> {{ post.likes.length }}</span>
                    <span><i class="fas fa-comment"></i> {{ post.comments.length }}</span>
                  </div>
                </div>
                <div class="post-actions" *ngIf="isCurrentUserPost(post)">
                  <button 
                    class="delete-btn" 
                    (click)="deletePost(post, $event)"
                    [disabled]="isDeleting[post.id]"
                    title="Delete post"
                  >
                    <i class="fas fa-trash" *ngIf="!isDeleting[post.id]"></i>
                    <i class="fas fa-spinner fa-spin" *ngIf="isDeleting[post.id]"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="empty-state" *ngIf="!isLoading && userPosts.length === 0">
              <i class="fas fa-car"></i>
              <h3>No posts yet</h3>
              <p>{{ userProfile.username }} hasn't shared any car photos yet.</p>
            </div>
          </div>
        </div>
        
        <div class="loading" *ngIf="!userProfile && !isLoading">
          <div class="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    </div>

    <!-- Post Viewer Modal -->
    <app-post-viewer
      [post]="selectedPost"
      [isVisible]="showPostViewer"
      [posts]="userPosts"
      [currentIndex]="selectedPostIndex"
      [showNavigation]="userPosts.length > 1"
      (closeEvent)="closePostViewer()"
      (previousEvent)="previousPost()"
      (nextEvent)="nextPost()"
    ></app-post-viewer>
  `,
  styles: [`
    .user-profile-container {
      padding: 40px 0;
    }
    
    .profile-header {
      margin-bottom: 30px;
    }
    
    .back-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.3s ease;
    }
    
    .back-btn:hover {
      background: #5a6268;
    }
    
    .profile-content {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .profile-info {
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px solid #eee;
    }
    
    .profile-avatar-section {
      flex-shrink: 0;
    }
    
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e74c3c;
    }
    
    .profile-details {
      flex: 1;
    }
    
    .profile-details h1 {
      font-size: 32px;
      color: #333;
      margin-bottom: 10px;
    }
    
    .join-date {
      color: #666;
      font-size: 16px;
      margin-bottom: 15px;
    }
    
    .join-date i {
      margin-right: 8px;
    }
    
    .bio {
      color: #555;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .profile-stats {
      display: flex;
      gap: 30px;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-number {
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: #e74c3c;
    }
    
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    
    .posts-section h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 30px;
    }
    
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .post-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .post-card:hover {
      transform: translateY(-5px);
    }

    .post-actions {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
    }

    .delete-btn {
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
      transition: all 0.3s ease;
      font-size: 12px;
      opacity: 0.8;
    }

    .delete-btn:hover:not(:disabled) {
      background: #c0392b;
      transform: scale(1.1);
      opacity: 1;
    }

    .delete-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .post-thumbnail {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .post-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .post-card:hover .post-overlay {
      opacity: 1;
    }
    
    .post-stats {
      color: white;
      display: flex;
      gap: 20px;
    }
    
    .post-stats span {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 16px;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    
    .empty-state i {
      font-size: 48px;
      color: #e74c3c;
      margin-bottom: 20px;
    }
    
    .empty-state h3 {
      font-size: 20px;
      margin-bottom: 10px;
    }
    
    .loading {
      text-align: center;
      padding: 60px 20px;
    }
    
    .loading p {
      margin-top: 20px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .profile-info {
        flex-direction: column;
        text-align: center;
      }
      
      .profile-avatar {
        width: 100px;
        height: 100px;
      }
      
      .profile-details h1 {
        font-size: 28px;
      }
      
      .posts-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  userProfile: any = null;
  userPosts: Post[] = [];
  isLoading = true;
  totalLikes = 0;
  isDeleting: { [postId: number]: boolean } = {};
  
  // Post viewer properties
  showPostViewer = false;
  selectedPost: Post | null = null;
  selectedPostIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadUserProfile(userId);
        this.loadUserPosts(userId);
      }
    });
  }

  loadUserProfile(userId: string): void {
    // For now, we'll get user info from posts
    // In a real app, you'd have a separate user endpoint
    this.userProfile = {
      id: userId,
      username: 'Loading...',
      profilePicture: null,
      joinDate: null,
      bio: null
    };
  }

  loadUserPosts(userId: string): void {
    this.postService.getUserPosts(parseInt(userId)).subscribe({
      next: (posts: Post[]) => {
        this.userPosts = posts;
        this.totalLikes = posts.reduce((total, post) => total + post.likes.length, 0);
        
        // Extract user info from the first post
        if (posts.length > 0) {
          this.userProfile = {
            id: userId,
            username: posts[0].userId.username,
            profilePicture: posts[0].userId.profilePicture,
            joinDate: posts[0].createdAt, // Approximate join date
            bio: null // Bio is not available in the current structure
          };
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading user posts:', error);
        this.isLoading = false;
      }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '/assets/default-avatar.svg';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewPost(post: Post): void {
    this.selectedPostIndex = this.userPosts.findIndex(p => p.id === post.id);
    this.selectedPost = post;
    this.showPostViewer = true;
  }

  isCurrentUserPost(post: Post): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? post.userId.id === currentUser.id : false;
  }

  deletePost(post: Post, event: Event): void {
    event.stopPropagation(); // Prevent the click from bubbling up to the post card
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.isDeleting[post.id] = true;
      
      this.postService.deletePost(post.id).subscribe({
        next: (response) => {
          this.isDeleting[post.id] = false;
          // Remove the post from the local array
          this.userPosts = this.userPosts.filter(p => p.id !== post.id);
          // Update total likes
          this.totalLikes = this.userPosts.reduce((total, p) => total + p.likes.length, 0);
        },
        error: (error) => {
          this.isDeleting[post.id] = false;
          console.error('Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        }
      });
    }
  }

  closePostViewer(): void {
    this.showPostViewer = false;
    this.selectedPost = null;
    this.selectedPostIndex = 0;
  }

  previousPost(): void {
    if (this.selectedPostIndex > 0) {
      this.selectedPostIndex--;
      this.selectedPost = this.userPosts[this.selectedPostIndex];
    }
  }

  nextPost(): void {
    if (this.selectedPostIndex < this.userPosts.length - 1) {
      this.selectedPostIndex++;
      this.selectedPost = this.userPosts[this.selectedPostIndex];
    }
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }
}
