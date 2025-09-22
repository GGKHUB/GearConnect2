import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  favoriteCarBrand?: string;
  profilePicture?: string;
  joinDate?: Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(userData: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          this.setUserData(response.token, response.user);
        })
      );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setUserData(response.token, response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setUserData(token: string, user: any): void {
    // Handle both flattened and nested user data structures
    let flattenedUser: User;
    
    if (user.profile) {
      // If user data has nested profile structure, flatten it
      flattenedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        bio: user.profile.bio,
        location: user.profile.location,
        favoriteCarBrand: user.profile.favoriteCarBrand,
        profilePicture: user.profile.profilePicture,
        joinDate: user.profile.joinDate
      };
    } else {
      // If user data is already flattened, use as is
      flattenedUser = user as User;
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(flattenedUser));
    this.currentUserSubject.next(flattenedUser);
  }

  updateProfile(profileData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/profile`, profileData, { headers })
      .pipe(
        tap((response: any) => {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            // Update user profile fields directly from the response
            const updatedUser = {
              ...currentUser,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              bio: response.user.bio,
              location: response.user.location,
              favoriteCarBrand: response.user.favoriteCarBrand,
              profilePicture: response.user.profilePicture
            };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
      );
  }

  getProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/profile`, { headers })
      .pipe(
        tap((response: any) => {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            // Flatten the profile data from the backend response
            const updatedUser = {
              ...currentUser,
              firstName: response.profile.firstName,
              lastName: response.profile.lastName,
              bio: response.profile.bio,
              location: response.profile.location,
              favoriteCarBrand: response.profile.favoriteCarBrand,
              profilePicture: response.profile.profilePicture,
              joinDate: response.profile.joinDate
            };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
      );
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const headers = this.getAuthHeadersForFormData();
    
    return this.http.post(`${this.apiUrl}/profile/picture`, formData, { headers })
      .pipe(
        tap((response: any) => {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.profilePicture = response.imageUrl;
            this.currentUserSubject.next(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        })
      );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeadersForFormData(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
