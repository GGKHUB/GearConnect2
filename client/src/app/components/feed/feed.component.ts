import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { StoriesComponent } from '../stories/stories.component';
import { PostViewerComponent } from '../post-viewer/post-viewer.component';


@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StoriesComponent, PostViewerComponent],
  template: `
    <div class="feed-container">
      <div class="container">
        <div class="feed-header">
          <h1><i class="fas fa-home"></i> GearConnect Feed</h1>
          <a routerLink="/create-post" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create Post
          </a>
        </div>
        
        <!-- Stories Section -->
        <app-stories></app-stories>
        
        <div class="feed-content">
          <div class="loading" *ngIf="isLoading">
            <div class="spinner"></div>
            <p>Loading posts...</p>
          </div>
          
          <div class="posts" *ngIf="!isLoading && posts.length > 0">
            <div class="post" *ngFor="let post of posts">
              <div class="post-header">
                <div class="user-info">
                  <img 
                    [src]="getImageUrl(post.userId.profilePicture || '/assets/default-avatar.svg')" 
                    [alt]="post.userId.username"
                    class="user-avatar clickable-avatar"
                    (click)="viewUserProfile(post.userId.id)"
                  >
                  <div class="user-details">
                    <h3 class="username-link" (click)="viewUserProfile(post.userId.id)">{{ post.userId.username }}</h3>
                    <p class="post-time">{{ formatDate(post.createdAt) }}</p>
                  </div>
                </div>
                <div class="post-actions-header" *ngIf="isCurrentUserPost(post)">
                  <button 
                    class="delete-btn" 
                    (click)="deletePost(post)"
                    [disabled]="isDeleting[post.id]"
                    title="Delete post"
                  >
                    <i class="fas fa-trash" *ngIf="!isDeleting[post.id]"></i>
                    <i class="fas fa-spinner fa-spin" *ngIf="isDeleting[post.id]"></i>
                  </button>
                </div>
              </div>
              
              <div class="post-content">
                <p class="post-caption" *ngIf="post.caption">{{ post.caption }}</p>
                <img 
                  [src]="getImageUrl(post.imageUrl)" 
                  [alt]="post.caption" 
                  class="post-image clickable-image"
                  (click)="viewPost(post)"
                >
              </div>
              
              <div class="post-actions">
                <button 
                  class="action-btn like-btn" 
                  [class.liked]="isLiked(post)"
                  (click)="toggleLike(post)"
                >
                  <i class="fas fa-heart"></i>
                  <span>{{ post.likes.length }}</span>
                </button>
                
                <button class="action-btn comment-btn" (click)="toggleComments(post)">
                  <i class="fas fa-comment"></i>
                  <span>{{ post.comments.length }}</span>
                </button>
              </div>

              <!-- Likers Section -->
              <div class="likers-section" *ngIf="post.likes.length > 0">
                <div class="likers-header">
                  <i class="fas fa-heart"></i>
                  <span *ngIf="post.likes.length === 1">{{ post.likes[0].username }} liked this</span>
                  <span *ngIf="post.likes.length === 2">{{ post.likes[0].username }} and {{ post.likes[1].username }} liked this</span>
                  <span *ngIf="post.likes.length > 2">{{ post.likes[0].username }} and {{ post.likes.length - 1 }} others liked this</span>
                </div>
                <div class="likers-list" *ngIf="post.showLikers">
                  <div class="liker-item" *ngFor="let liker of post.likes">
                    <img 
                      [src]="getImageUrl(liker.profilePicture || '/assets/default-avatar.svg')" 
                      [alt]="liker.username"
                      class="liker-avatar"
                    >
                    <span class="liker-name">{{ liker.username }}</span>
                  </div>
                </div>
                <button 
                  class="show-likers-btn" 
                  *ngIf="post.likes.length > 0"
                  (click)="toggleLikers(post)"
                >
                  {{ post.showLikers ? 'Hide' : 'Show' }} who liked this
                </button>
              </div>
              
              <div class="comments-section" *ngIf="post.showComments">
                <div class="comments" *ngIf="post.comments.length > 0">
                  <div class="comment" *ngFor="let comment of post.comments">
                    <img 
                      [src]="getImageUrl(comment.userId.profilePicture || '/assets/default-avatar.svg')" 
                      [alt]="comment.userId.username"
                      class="comment-avatar"
                    >
                    <div class="comment-content">
                      <div class="comment-header">
                        <strong>{{ comment.userId.username }}</strong>
                        <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                      </div>
                      <p>{{ comment.text }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="add-comment">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    class="comment-input"
                    [(ngModel)]="newComments[post.id]"
                    (keyup.enter)="addComment(post)"
                  >
                  <button 
                    class="btn btn-primary btn-sm"
                    (click)="addComment(post)"
                    [disabled]="!newComments[post.id] || !newComments[post.id].trim()"
                  >
                    Post
                  </button>
                </div>
              </div>

              <!-- Commenters Summary Section -->
              <div class="commenters-summary" *ngIf="post.comments.length > 0 && !post.showComments">
                <div class="commenters-header">
                  <i class="fas fa-comment"></i>
                  <span *ngIf="post.comments.length === 1">{{ post.comments[0].userId.username }} commented</span>
                  <span *ngIf="post.comments.length === 2">{{ post.comments[0].userId.username }} and {{ post.comments[1].userId.username }} commented</span>
                  <span *ngIf="post.comments.length > 2">{{ post.comments[0].userId.username }} and {{ post.comments.length - 1 }} others commented</span>
                </div>
                <div class="commenters-preview" *ngIf="post.comments.length > 0">
                  <div class="commenter-item" *ngFor="let comment of post.comments.slice(0, 3)">
                    <img 
                      [src]="getImageUrl(comment.userId.profilePicture || '/assets/default-avatar.svg')" 
                      [alt]="comment.userId.username"
                      class="commenter-avatar"
                    >
                    <div class="commenter-info">
                      <span class="commenter-name">{{ comment.userId.username }}</span>
                      <span class="comment-preview">{{ comment.text.length > 50 ? comment.text.substring(0, 50) + '...' : comment.text }}</span>
                    </div>
                  </div>
                  <div class="more-comments" *ngIf="post.comments.length > 3">
                    <span>+{{ post.comments.length - 3 }} more comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="empty-state" *ngIf="!isLoading && posts.length === 0">
            <i class="fas fa-car"></i>
            <h2>No posts yet</h2>
            <p>Be the first to share your car photos!</p>
            <a routerLink="/create-post" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Create First Post
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Viewer Modal -->
    <app-post-viewer
      [post]="selectedPost"
      [isVisible]="showPostViewer"
      [posts]="posts"
      [currentIndex]="selectedPostIndex"
      [showNavigation]="posts.length > 1"
      (closeEvent)="closePostViewer()"
      (previousEvent)="previousPost()"
      (nextEvent)="nextPost()"
    ></app-post-viewer>
  `,
  styles: [`
    .feed-container {
      padding: 40px 0;
    }
    
    .feed-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .feed-header h1 {
      font-size: 32px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .feed-header h1 i {
      color: #e74c3c;
    }
    
    .loading {
      text-align: center;
      padding: 60px 20px;
    }
    
    .loading p {
      margin-top: 20px;
      color: #666;
      font-size: 18px;
    }
    
    .posts {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .post {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
      overflow: hidden;
    }
    
    .post-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .post-actions-header {
      display: flex;
      align-items: center;
    }

    .delete-btn {
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .delete-btn:hover:not(:disabled) {
      background: #c0392b;
      transform: scale(1.1);
    }

    .delete-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e74c3c;
    }
    
    .clickable-avatar {
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .clickable-avatar:hover {
      transform: scale(1.1);
    }
    
    .user-details h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
    
    .username-link {
      cursor: pointer;
      transition: color 0.3s ease;
    }
    
    .username-link:hover {
      color: #e74c3c;
    }
    
    .post-time {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .post-content {
      padding: 0;
    }
    
    .post-caption {
      padding: 20px;
      margin: 0;
      font-size: 16px;
      line-height: 1.6;
      color: #333;
    }
    
    .post-image {
      width: 100%;
      height: auto;
      display: block;
    }

    .clickable-image {
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .clickable-image:hover {
      transform: scale(1.02);
    }
    
    .post-actions {
      padding: 20px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 20px;
    }
    
    .action-btn {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 16px;
      color: #666;
      transition: color 0.3s ease;
    }
    
    .action-btn:hover {
      color: #e74c3c;
    }
    
    .like-btn.liked {
      color: #e74c3c;
    }
    
    .comments-section {
      border-top: 1px solid #eee;
      padding: 20px;
    }
    
    .comments {
      margin-bottom: 20px;
    }
    
    .comment {
      display: flex;
      gap: 12px;
      margin-bottom: 15px;
    }
    
    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .comment-content {
      flex: 1;
    }
    
    .comment-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 5px;
    }
    
    .comment-header strong {
      color: #333;
      font-size: 14px;
    }
    
    .comment-time {
      color: #666;
      font-size: 12px;
    }
    
    .comment-content p {
      margin: 0;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .add-comment {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .comment-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
    }
    
    .comment-input:focus {
      border-color: #e74c3c;
    }
    
    .btn-sm {
      padding: 8px 16px;
      font-size: 14px;
    }
    
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .empty-state i {
      font-size: 64px;
      color: #e74c3c;
      margin-bottom: 20px;
    }
    
    .empty-state h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }
    
    .empty-state p {
      color: #666;
      font-size: 16px;
      margin-bottom: 30px;
    }
    
    @media (max-width: 768px) {
      .feed-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }
      
      .feed-header h1 {
        font-size: 28px;
      }
    }

    .likers-section {
      padding: 10px 0;
      border-top: 1px solid #eee;
    }

    .likers-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 0.9em;
      color: #333;
    }

    .likers-header i {
      color: #e74c3c;
    }

    .likers-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
    }

    .liker-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 0;
    }

    .liker-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }

    .liker-name {
      font-size: 0.9em;
      color: #333;
      font-weight: 500;
    }

    .show-likers-btn {
      background: none;
      border: none;
      color: #666;
      font-size: 0.8em;
      cursor: pointer;
      padding: 5px 0;
      text-decoration: underline;
    }

    .show-likers-btn:hover {
      color: #e74c3c;
    }

    .commenters-summary {
      padding: 10px 0;
      border-top: 1px solid #eee;
    }

    .commenters-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 0.9em;
      color: #333;
    }

    .commenters-header i {
      color: #e74c3c;
    }

    .commenters-preview {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .commenter-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 5px 0;
    }

    .commenter-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .commenter-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .commenter-name {
      font-size: 0.9em;
      color: #333;
      font-weight: 500;
    }

    .comment-preview {
      font-size: 0.8em;
      color: #666;
      line-height: 1.3;
    }

    .more-comments {
      font-size: 0.8em;
      color: #666;
      font-style: italic;
      margin-top: 5px;
    }
  `]
})
export class FeedComponent implements OnInit {
  posts: (Post & { showComments: boolean; showLikers: boolean })[] = [];
  isLoading = true;
  newComments: { [postId: string]: string } = {};
  isDeleting: { [postId: number]: boolean } = {};
  
  // Post viewer properties
  showPostViewer = false;
  selectedPost: Post | null = null;
  selectedPostIndex = 0;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe({
      next: (posts: Post[]) => {
        this.posts = posts.map(post => ({ ...post, showComments: false, showLikers: false }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
      }
    });
  }

  toggleLike(post: Post): void {
    this.postService.likePost(post.id).subscribe({
      next: (response: any) => {
        // Update the likes array in the local posts array
        const postIndex = this.posts.findIndex(p => p.id === post.id);
        if (postIndex !== -1) {
          this.posts[postIndex].likes = response.likes || [];
        }
      },
      error: (error: any) => {
        console.error('Error toggling like:', error);
        // Show error message to user
        alert('Failed to like/unlike post. Please try again.');
      }
    });
  }

  toggleComments(post: Post & { showComments: boolean }): void {
    post.showComments = !post.showComments;
  }

  toggleLikers(post: Post & { showLikers: boolean }): void {
    post.showLikers = !post.showLikers;
  }

  addComment(post: Post): void {
    const commentText = this.newComments[post.id];
    if (!commentText?.trim()) return;

    this.postService.addComment(post.id, commentText).subscribe({
      next: (response: any) => {
        // Add the comment to the local posts array
        const postIndex = this.posts.findIndex(p => p.id === post.id);
        if (postIndex !== -1) {
          this.posts[postIndex].comments.push(response.comment);
        }
        this.newComments[post.id] = '';
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  isLiked(post: Post): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return post.likes.some(like => like.id === currentUser.id);
  }

  getImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  }

  viewUserProfile(userId: number): void {
    this.router.navigate(['/user', userId.toString()]);
  }

  viewPost(post: Post): void {
    this.selectedPostIndex = this.posts.findIndex(p => p.id === post.id);
    this.selectedPost = post;
    this.showPostViewer = true;
  }

  closePostViewer(): void {
    this.showPostViewer = false;
    this.selectedPost = null;
    this.selectedPostIndex = 0;
  }

  previousPost(): void {
    if (this.selectedPostIndex > 0) {
      this.selectedPostIndex--;
      this.selectedPost = this.posts[this.selectedPostIndex];
    }
  }

  nextPost(): void {
    if (this.selectedPostIndex < this.posts.length - 1) {
      this.selectedPostIndex++;
      this.selectedPost = this.posts[this.selectedPostIndex];
    }
  }

  isCurrentUserPost(post: Post): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? post.userId.id === currentUser.id : false;
  }

  deletePost(post: Post): void {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.isDeleting[post.id] = true;
      
      this.postService.deletePost(post.id).subscribe({
        next: (response) => {
          this.isDeleting[post.id] = false;
          // Remove the post from the local array
          this.posts = this.posts.filter(p => p.id !== post.id);
        },
        error: (error) => {
          this.isDeleting[post.id] = false;
          console.error('Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        }
      });
    }
  }

  formatDate(dateString: string): string {
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
