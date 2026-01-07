import { inject, Injectable } from '@angular/core';
import { GenericApi, PaginatedResult } from '../../core/services/generic-api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- TRANSACTION INTERFACES & ENUMS ---
export enum TransactionType {
  Income,
  Expense
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: Date;
  type: TransactionType;
  accountId: number;
  categoryName?: string;
}


@Injectable({
  providedIn: 'root'
})
export class Transaction {
  constructor(private apiService: GenericApi) { }

  // --- Transaction Methods ---

  getTransactionsForAccount(accountId: number, queryParams: any): Observable<PaginatedResult<Transaction>> {
    const endpoint = `accounts/${accountId}/transactions`;
    return this.apiService.search<Transaction>(endpoint, queryParams).pipe(
      map(response => response.value)
    );
  }

  upsertTransaction(accountId: number, transactionData: Partial<Transaction>): Observable<Transaction> {
    const endpoint = `accounts/${accountId}/transactions`;
    return this.apiService.upsert<Transaction>(endpoint, transactionData).pipe(
      map(response => response.value)
    );
  }

  deleteTransaction(accountId: number, transactionId: number): Observable<boolean> {
    const endpoint = `accounts/${accountId}/transactions`;
    return this.apiService.delete<boolean>(endpoint, transactionId).pipe(
      map(response => response.value)
    );
  }

  createTransfer(sourceAccountId: number, transferData: any): Observable<boolean> {
    const endpoint = `accounts/${sourceAccountId}/transactions/transfer`;
    return this.apiService.post<boolean>(endpoint, transferData).pipe(
      map(response => response.value)
    );
  }

  switchAccount(currentAccountId: number, transactionId: number, destinationAccountId: number): Observable<boolean> {
    const endpoint = `accounts/${currentAccountId}/transactions/${transactionId}/switch-account`;
    return this.apiService.post<boolean>(endpoint, { destinationAccountId }).pipe(
      map(response => response.value)
    );
  }
}
