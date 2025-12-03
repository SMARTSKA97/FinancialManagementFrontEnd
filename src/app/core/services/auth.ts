import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './generic-api';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';


// --- AUTH-SPECIFIC DTOs ---
export interface RegisterUserDto {
  name: string;
}

export interface UserDetails {
  name: string;
  email: string;
  exp: number;
}

export interface LoginUserDto {
  userName: string;
  password: string;
  forceLogin?: boolean;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiBaseUrl = environment.apiBaseUrl;
  private isBrowser: boolean;
  private router = inject(Router);
  private http = inject(HttpClient);

  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  // A single source of truth for all user details
  private currentUserDetailsSubject = new BehaviorSubject<UserDetails | null>(null);

  // Public observables derived from the single source of truth
  public currentUserDetails$ = this.currentUserDetailsSubject.asObservable();
  public currentUser$ = this.currentUserDetails$.pipe(map(details => details?.name ?? null));
  public currentUserEmail$ = this.currentUserDetails$.pipe(map(details => details?.email ?? null));
  public sessionExpiresIn$: Observable<string>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // We don't load tokens on startup anymore because refresh token is in cookie
    // We will call restoreSession() from APP_INITIALIZER
    this.sessionExpiresIn$ = of('N/A');
  }

  private buildUrl(...segments: string[]): string {
    const fullPath = [this.apiBaseUrl, ...segments]
      .map(segment => segment.replace(/^\/+|\/+$/g, ''))
      .join('/');
    return fullPath;
  }

  public getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  private getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    this.accessTokenSubject.next(accessToken);
    if (this.isBrowser) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    this.decodeAndSetUser(accessToken);
  }

  private clearTokens(): void {
    this.accessTokenSubject.next(null);
    this.currentUserDetailsSubject.next(null);
    if (this.isBrowser) {
      localStorage.removeItem('refreshToken');
    }
  }

  // New method to restore session on app startup
  public restoreSession(): Observable<boolean> {
    if (!this.isBrowser) return of(false);

    // Check if we have a refresh token in local storage
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return of(false);

    return this.refreshToken().pipe(
      map(success => success),
      catchError(() => of(false))
    );
  }

  private decodeAndSetUser(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);
      const userDetails: UserDetails = {
        name: decodedToken.sub,
        email: decodedToken.email,
        exp: decodedToken.exp
      };
      this.currentUserDetailsSubject.next(userDetails);
    } catch (e) {
      this.clearTokens();
    }
  }

  register(userData: RegisterUserDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.buildUrl('Auth', 'register'), userData);
  }

  login(credentials: LoginUserDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(this.buildUrl('Auth', 'login'), credentials).pipe(
      tap(response => {
        if (response.isSuccess && response.result) {
          this.storeTokens(response.result.accessToken, response.result.refreshToken);
        }
      })
    );
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(false);
    }

    return this.http.post<ApiResponse<LoginResponseDto>>(this.buildUrl('Auth', 'refresh'), { refreshToken }).pipe(
      map(response => {
        if (response.isSuccess && response.result) {
          this.storeTokens(response.result.accessToken, response.result.refreshToken);
          return true;
        }
        this.logout();
        return false;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      // Call backend to revoke token
      this.http.post(this.buildUrl('Auth', 'logout'), { refreshToken }).subscribe();
    }
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getRefreshToken(); // Presence of refresh token indicates "logged in" status
  }
}