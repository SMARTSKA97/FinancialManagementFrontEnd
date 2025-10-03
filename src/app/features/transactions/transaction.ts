import { inject, Injectable } from '@angular/core';
import { GenericApi } from '../../core/services/generic-api';
import { map, Observable } from 'rxjs';

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

  getTransactionsForAccount(accountId: number): Observable<Transaction[]> {
    const endpoint = `accounts/${accountId}/transactions`;
    // We use the 'map' operator to extract the 'result' from the ApiResponse
    return this.apiService.get<Transaction[]>(endpoint).pipe(
      map(response => response.result || [])
    );
  }

  // Use the new 'upsert' method for both create and update
  upsertTransaction(accountId: number, transactionData: any): Observable<Transaction> {
    const endpoint = `accounts/${accountId}/transactions/upsert`;
    return this.apiService.upsert<Transaction>(endpoint, transactionData).pipe(
      map(response => response.result)
    );
  }

  deleteTransaction(accountId: number, transactionId: number): Observable<boolean> {
    const endpoint = `accounts/${accountId}/transactions`;
    return this.apiService.delete<boolean>(endpoint, transactionId).pipe(
      map(response => response.result)
    );
  }
}
