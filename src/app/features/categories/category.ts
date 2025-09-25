import { Injectable } from '@angular/core';
import { GenericApi } from '../../core/services/generic-api';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Category {
  createCategory(categoryData: { name: string }): Observable<Category> {
    return this.apiService.post<Category>(this.endpoint, categoryData);
  }
  private endpoint = 'categories';
  constructor(private apiService: GenericApi) { }

  getCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>(this.endpoint);
  }
}
