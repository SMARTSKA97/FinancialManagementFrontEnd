import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GenericApi, PaginatedResult } from '../../core/services/generic-api';
import { environment } from '../../../environments/environment';

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
  private endpoint = environment.apiBaseUrl+'/accounts';

  constructor(private apiService: GenericApi) { }

  // Use the new 'search' method for paginated data
  getAccounts(queryParams: any): Observable<PaginatedResult<Account>> {
    return this.apiService.search<Account>(this.endpoint, queryParams).pipe(
      map(response => response.result)
    );
  }

  // Use the new 'upsert' method for both create and update
  upsertAccount(accountData: any): Observable<Account> {
    return this.apiService.upsert<Account>(this.endpoint, accountData).pipe(
      map(response => response.result)
    );
  }

  deleteAccount(accountId: number): Observable<boolean> {
    return this.apiService.delete<boolean>(this.endpoint, accountId).pipe(
      map(response => response.result)
    );
  }
} 
