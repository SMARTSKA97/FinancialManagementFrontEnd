import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, tap, timer } from 'rxjs';
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

    // A single source of truth for all user details
    private currentUserDetailsSubject = new BehaviorSubject<UserDetails | null>(null);

    // Public observables derived from the single source of truth
    public currentUserDetails$ = this.currentUserDetailsSubject.asObservable();
    public currentUser$ = this.currentUserDetails$.pipe(map(details => details?.name ?? null));
    public currentUserEmail$ = this.currentUserDetails$.pipe(map(details => details?.email ?? null));

    // An observable that updates the "expires in" message every minute
    public sessionExpiresIn$: Observable<string> = timer(0, 60000).pipe(
        switchMap(() => {
            const details = this.currentUserDetailsSubject.value;
            if (!details) return of('N/A');

            const now = Math.floor(Date.now() / 1000);
            const expiresInSeconds = details.exp - now;
            const expiresInMinutes = Math.round(expiresInSeconds / 60);

            if (expiresInMinutes <= 0) return of('Expired');
            return of(`${expiresInMinutes} minutes`);
        })
    );

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
                    this.loadUserFromToken(); // Load user details after login
                }
            })
        );
    }

    logout(): void {
        if (this.isBrowser) {
            localStorage.removeItem('authToken');
            this.currentUserDetailsSubject.next(null); // Clear user details on logout
        }
    }

    private loadUserFromToken(): void {
        const token = this.getToken();
        if (token) {
            const decodedToken: any = jwtDecode(token);
            const userDetails: UserDetails = {
                name: decodedToken.sub, // 'sub' is the standard claim for username
                email: decodedToken.email,
                exp: decodedToken.exp
            };
            this.currentUserDetailsSubject.next(userDetails);
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
}