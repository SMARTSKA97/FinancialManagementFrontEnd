import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericApi } from '../../core/services/generic-api';

export interface Account {
  id: number;
  name: string;
  balance: number;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class Account {
  private endpoint = 'Accounts';

  constructor(private api: GenericApi) { }

  getAccounts(): Observable<Account[]> {
    return this.api.get<Account[]>(this.endpoint);
  }

  createAccount(accountData: { name: string, balance: number }): Observable<Account> {
    return this.api.post<Account>(this.endpoint, accountData);
  }

  updateAccount(id: number, accountData: { name: string, balance: number }): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/${id}`, accountData);
  }

  deleteAccount(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
} 
