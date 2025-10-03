import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private baseUrl = environment.apiBaseUrl.replace(/\/+$/, ''); // Use your API's port

  constructor(private http: HttpClient) { }

  private join(endpoint: string, suffix = ''): string {
    const clean = endpoint.replace(/^\/+/, '');         // no leading slash
    const tail  = suffix ? `/${suffix.replace(/^\/+/, '')}` : '';
    return `${this.baseUrl}/${clean}${tail}`;
  }

  // Generic method for the new /search endpoints
  search<T>(endpoint: string, queryParams: any): Observable<ApiResponse<PaginatedResult<T>>> {
    return this.http.post<ApiResponse<PaginatedResult<T>>>(this.join(endpoint, 'search'), queryParams);
  }

  // POST .../<endpoint>/upsert
  upsert<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.join(endpoint, 'upsert'), data);
  }

  // DELETE .../<endpoint>/<id>
  delete<T>(endpoint: string, id: number): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.join(endpoint, String(id)));
  }

  // GET .../<endpoint>
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(this.join(endpoint));
  }
}
