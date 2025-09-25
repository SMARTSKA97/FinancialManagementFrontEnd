import { inject, Injectable } from '@angular/core';
import { GenericApi } from '../../core/services/generic-api';
import { Observable } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class Transaction {
  private apiService = inject(GenericApi);

  getTransactionsForAccount(accountId: number): Observable<Transaction[]> {
    const endpoint = `accounts/${accountId}/transactions`;
    return this.apiService.get<Transaction[]>(endpoint);
  }

  createTransaction(accountId: number, transactionData: any): Observable<Transaction> {
    const endpoint = `accounts/${accountId}/transactions`;
    return this.apiService.post<Transaction>(endpoint, transactionData);
  }
  
  updateTransaction(accountId: number, transactionId: number, transactionData: any): Observable<void> {
    const endpoint = `accounts/${accountId}/transactions/${transactionId}`;
    return this.apiService.put<void>(endpoint, transactionData);
  }

  deleteTransaction(accountId: number, transactionId: number): Observable<void> {
    const endpoint = `accounts/${accountId}/transactions/${transactionId}`;
    return this.apiService.delete<void>(endpoint);
  }
}
