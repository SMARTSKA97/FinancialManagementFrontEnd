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
  private endpoint = 'Accounts';

  constructor(private apiService: GenericApi) { }

  /**
   * Fetches a paginated list of accounts using the new '/search' endpoint.
   */
  getAccounts(queryParams: any): Observable<PaginatedResult<Account>> {
    console.log(`Calling search endpoint for: ${this.endpoint}`);
    // Use the 'search' method and map the result from the ApiResult
    return this.apiService.search<Account>(this.endpoint, queryParams).pipe(
      map(response => response.value)
    );
  }

  /**
   * Creates or updates an account using the new '/upsert' endpoint.
   */
  upsertAccount(accountData: any): Observable<Account> {
    // Use the generic 'upsert' method
    return this.apiService.upsert<Account>(this.endpoint, accountData).pipe(
      map(response => response.value)
    );
  }

  /**
   * Deletes an account by its ID.
   */
  deleteAccount(accountId: number): Observable<boolean> {
    return this.apiService.delete<boolean>(this.endpoint, accountId).pipe(
      map(response => response.value)
    );
  }
} 
