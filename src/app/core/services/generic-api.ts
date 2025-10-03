import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  result: T;
  apiResponseStatus: number; // 0 = Success, 1 = Warning, 2 = Error
  message: string;
  errors?: string[];
}

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
  private baseUrl = 'https://localhost:7123/api'; // Use your API's port

  constructor(private http: HttpClient) { }

  // Generic method for the new /search endpoints
  search<T>(endpoint: string, queryParams: any): Observable<ApiResponse<PaginatedResult<T>>> {
    return this.http.post<ApiResponse<PaginatedResult<T>>>(`${this.baseUrl}/${endpoint}/search`, queryParams);
  }

  // Generic method for the new /upsert endpoints
  upsert<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/upsert`, data);
  }

  delete<T>(endpoint: string, id: number): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  // Generic get for simple, non-paginated data (like categories)
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
  }
}
