import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  result: T;
  isSuccess: boolean;
  message: string;
  errors?: string[];
}

// This interface matches the PaginatedResult<T> from the backend
export interface PaginatedResult<T> {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class GenericApi {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { 
    if (!this.apiBaseUrl) {
      console.error("API Base URL is not set in environment file!");
    }
  }

  /**
   * Builds a safe, clean URL by joining segments.
   */
  private buildUrl(...segments: string[]): string {
    const fullPath = [this.apiBaseUrl, ...segments]
      .map(segment => segment.replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes
      .join('/');
    return fullPath;
  }

  /**
   * Performs a GET request for a simple list of items.
   */
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(this.buildUrl(endpoint));
  }

  search<T>(endpoint: string, queryParams: any): Observable<ApiResponse<PaginatedResult<T>>> {
    return this.http.post<ApiResponse<PaginatedResult<T>>>(this.buildUrl(endpoint, 'search'), queryParams);
  }

  upsert<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.buildUrl(endpoint, 'upsert'), data);
  }

  delete<T>(endpoint: string, id: number): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.buildUrl(endpoint, id.toString()));
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.buildUrl(endpoint), data);
  }
}
