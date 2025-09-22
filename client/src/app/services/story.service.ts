import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Story, CreateStoryRequest } from '../models/story.model';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private apiUrl = 'http://localhost:5000/api';

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

  // Get all stories
  getStories(): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.apiUrl}/stories`);
  }

  // Get stories by user
  getUserStories(userId: number): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.apiUrl}/stories/user/${userId}`);
  }

  // Create a new story
  createStory(formData: FormData): Observable<any> {
    const headers = this.getAuthHeadersForFormData();
    return this.http.post(`${this.apiUrl}/stories`, formData, { headers });
  }

  // View a story (increment view count)
  viewStory(storyId: number): Observable<Story> {
    const headers = this.getAuthHeaders();
    return this.http.post<Story>(`${this.apiUrl}/stories/${storyId}/view`, {}, { headers });
  }

  // Delete a story
  deleteStory(storyId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/stories/${storyId}`, { headers });
  }
}
