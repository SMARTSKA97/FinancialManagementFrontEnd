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
  constructor(private http: HttpClient) { }

  // Generic method for the new /search endpoints
  search<T>(endpoint: string, queryParams: any): Observable<ApiResponse<PaginatedResult<T>>> {
    return this.http.post<ApiResponse<PaginatedResult<T>>>(`${endpoint}/search`, queryParams);
  }

  // POST .../<endpoint>/upsert
  upsert<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${endpoint}/upsert`, data);
  }

  // DELETE .../<endpoint>/<id>
  delete<T>(endpoint: string, id: number): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${endpoint}/${String(id)}`);
  }

  // GET .../<endpoint>
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${endpoint}`);
  }
}
