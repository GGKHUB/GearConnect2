import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  testConnection(): Observable<any> {
    console.log('Testing connection to:', this.apiUrl);
    return this.http.get(`${this.apiUrl}/posts`);
  }

  testRegister(): Observable<any> {
    const testData = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'testpass123'
    };
    console.log('Testing register with:', testData);
    return this.http.post(`${this.apiUrl}/register`, testData);
  }
}
