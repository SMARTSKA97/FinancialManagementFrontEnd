import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { GenericApi, PaginatedResult } from './generic-api';

@Injectable({
  providedIn: 'root'
})
export class GenericCrud<T extends { id: number }> {
  private readonly _items = new BehaviorSubject<T[]>([]);
  private readonly _isLoading = new BehaviorSubject<boolean>(false);
  private readonly _pagination = new BehaviorSubject<Omit<PaginatedResult<T>, 'data'> | null>(null);

  public readonly items$ = this._items.asObservable();
  public readonly isLoading$ = this._isLoading.asObservable();
  public readonly pagination$ = this._pagination.asObservable();

  private apiService = inject(GenericApi);

  async search(endpoint: string, queryParams: any): Promise<void> {
    this._isLoading.next(true);
    try {
      const response = await firstValueFrom(this.apiService.search<T>(endpoint, queryParams));
      if (response.apiResponseStatus === 0 && response.result) {
        this._items.next(response.result.data);
        const { data, ...pagination } = response.result;
        this._pagination.next(pagination);
      } else {
        this._items.next([]);
        this._pagination.next(null);
        throw new Error(response.message || 'Failed to load data.');
      }
    } finally {
      this._isLoading.next(false);
    }
  }

  async getAll(endpoint: string): Promise<void> {
    this._isLoading.next(true);
    try {
      const response = await firstValueFrom(this.apiService.get<T[]>(endpoint));
      if (response.apiResponseStatus === 0 && response.result) {
        this._items.next(response.result);
      } else {
        this._items.next([]);
        throw new Error(response.message || 'Failed to load data.');
      }
    } finally {
      this._isLoading.next(false);
    }
  }

  async upsert(endpoint: string, itemData: T | Omit<T, 'id'>): Promise<void> {
    const response = await firstValueFrom(this.apiService.upsert<T>(endpoint, itemData));
    if (response.apiResponseStatus === 0 && response.result) {
      const savedItem = response.result;
      const currentItems = this._items.value;
      const existingIndex = 'id' in itemData ? currentItems.findIndex(i => i.id === itemData.id) : -1;

      if (existingIndex > -1) {
        currentItems[existingIndex] = savedItem;
        this._items.next([...currentItems]);
      } else {
        this._items.next([...currentItems, savedItem]);
      }
    } else {
      throw new Error(response.message || 'Save operation failed.');
    }
  }

  async delete(endpoint: string, item: T): Promise<void> {
    const response = await firstValueFrom(this.apiService.delete<boolean>(endpoint, item.id));
    if (response.apiResponseStatus === 0) {
      this._items.next(this._items.value.filter(i => i.id !== item.id));
    } else {
      throw new Error(response.message || 'Delete operation failed.');
    }
  }
}