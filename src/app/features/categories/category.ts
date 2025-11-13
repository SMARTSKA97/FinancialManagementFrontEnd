import { Injectable } from '@angular/core';
import { ApiResponse, GenericApi } from '../../core/services/generic-api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccountCategory {
  id: number;
  name: string;
}

export interface TransactionCategory {
  id: number;
  name: string;
  isTransferCategory: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Category {
  private accountCategoryEndpoint = 'AccountCategories';
  private transactionCategoryEndpoint = 'TransactionCategories';

  constructor(private apiService: GenericApi) { }

  // --- Account Category Methods ---

  getAccountCategories(): Observable<AccountCategory[]> {
    return this.apiService.get<AccountCategory[]>(this.accountCategoryEndpoint).pipe(
      map(response => response.result || [])
    );
  }

  upsertAccountCategory(categoryData: { id?: number, name: string }): Observable<AccountCategory> {
    return this.apiService.upsert<AccountCategory>(this.accountCategoryEndpoint, categoryData).pipe(
      map(response => response.result)
    );
  }

  deleteAccountCategory(id: number): Observable<boolean> {
    return this.apiService.delete<boolean>(this.accountCategoryEndpoint, id).pipe(
      map(response => response.result)
    );
  }

  // --- Transaction Category Methods ---

  getTransactionCategories(): Observable<TransactionCategory[]> {
    return this.apiService.get<TransactionCategory[]>(this.transactionCategoryEndpoint).pipe(
      map(response => response.result || [])
    );
  }

  upsertTransactionCategory(categoryData: { id?: number, name: string, isTransferCategory?: boolean }): Observable<TransactionCategory> {
    return this.apiService.upsert<TransactionCategory>(this.transactionCategoryEndpoint, categoryData).pipe(
      map(response => response.result)
    );
  }

  deleteTransactionCategory(id: number): Observable<boolean> {
    return this.apiService.delete<boolean>(this.transactionCategoryEndpoint, id).pipe(
      map(response => response.result)
    );
  }
}
