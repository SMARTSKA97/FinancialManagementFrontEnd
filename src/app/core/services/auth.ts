import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './generic-api';
import { jwtDecode } from 'jwt-decode';


// --- AUTH-SPECIFIC DTOs ---
export interface RegisterUserDto {
  name: string;
  dateOfBirth: string;
  email: string;
  userName: string;
  password: string;
}

export interface LoginUserDto {
  userName: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  userName: string;
}

export interface UserDetails {
  name: string;
  email: string;
  exp: number; // Expiry timestamp
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiBaseUrl = environment.apiBaseUrl;
  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<UserDetails | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadUserFromToken();
  }

  private buildUrl(...segments: string[]): string {
    const fullPath = [this.apiBaseUrl, ...segments]
      .map(segment => segment.replace(/^\/+|\/+$/g, ''))
      .join('/');
    return fullPath;
  }

  register(userData: RegisterUserDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.buildUrl('Auth', 'register'), userData);
  }

  login(credentials: LoginUserDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(this.buildUrl('Auth', 'login'), credentials).pipe(
      tap(response => {
        if (this.isBrowser && response.isSuccess && response.result?.token) {
          localStorage.setItem('authToken', response.result.token);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userDetails: UserDetails = {
        name: decodedToken.sub, // 'sub' is the standard claim for username/subject
        email: decodedToken.email,
        exp: decodedToken.exp
      };
      this.currentUserSubject.next(userDetails);
    }
  }
}