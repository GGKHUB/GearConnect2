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
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
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
