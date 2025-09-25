import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { GenericApi } from './generic-api';

@Injectable({
  providedIn: 'root'
})
export class GenericCrud <T extends { id: number }> {
  private _items = new BehaviorSubject<T[]>([]);
  private _isLoading = new BehaviorSubject<boolean>(false);

  public items$ = this._items.asObservable();
  public isLoading$ = this._isLoading.asObservable();

  private apiService = inject(GenericApi);

  async load(endpoint: string): Promise<void> {
    this._isLoading.next(true);
    try {
      const items = await firstValueFrom(this.apiService.get<T[]>(endpoint));
      this._items.next(items);
    } finally {
      this._isLoading.next(false);
    }
  }

  async create(endpoint: string, itemData: Omit<T, 'id'>): Promise<void> {
    const newItem = await firstValueFrom(this.apiService.post<T>(endpoint, itemData));
    this._items.next([...this._items.value, newItem]);
  }

  async update(endpoint: string, item: T): Promise<void> {
    await firstValueFrom(this.apiService.put<void>(`${endpoint}/${item.id}`, item));
    const updatedItems = this._items.value.map(i => i.id === item.id ? item : i);
    this._items.next(updatedItems);
  }

  async delete(endpoint: string, item: T): Promise<void> {
    await firstValueFrom(this.apiService.delete<void>(`${endpoint}/${item.id}`));
    this._items.next(this._items.value.filter(i => i.id !== item.id));
  }
}