import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8060/api/v1/authentication'; // API Gateway routes to IAM service

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/sign-in`, data).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  signup(data: { username: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/sign-up`, data).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
