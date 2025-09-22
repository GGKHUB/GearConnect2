import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Post {
  id: number;
  userId: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  caption: string;
  imageUrl: string;
  likes: Array<{
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  }>;
  comments: Array<{
    id: number;
    userId: {
      id: number;
      username: string;
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
    };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeadersForFormData(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }

  createPost(formData: FormData): Observable<any> {
    const headers = this.getAuthHeadersForFormData();
    return this.http.post(`${this.apiUrl}/posts`, formData, { headers });
  }

  getUserPosts(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts/user/${userId}`);
  }

  likePost(postId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/posts/${postId}/like`, {}, { headers });
  }

  addComment(postId: number, text: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/posts/${postId}/comments`, { text }, { headers });
  }

  deletePost(postId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/posts/${postId}`, { headers });
  }
}
