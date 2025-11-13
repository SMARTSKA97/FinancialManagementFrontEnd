import { ChangeDetectorRef, Component, inject, Injectable } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Auth } from '../../core/services/auth';
import { Router } from '@angular/router';
import { Account } from '../accounts/account';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ColumnDefinition, DataTable } from '../../shared/components/data-table/data-table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AccountForm } from '../accounts/account-form/account-form';
import { asyncScheduler, filter, finalize, map, Observable, observeOn, switchMap, tap } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GenericApi } from '../../core/services/generic-api';
import { environment } from '../../../environments/environment';
export interface AccountSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
}

export interface DashboardSummary {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface SpendingByCategory {
  categoryName: string;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  private endpoint = 'Dashboard';

  constructor(private apiService: GenericApi) { }

  getSummary(): Observable<DashboardSummary> {
    return this.apiService.get<DashboardSummary>(`${this.endpoint}/summary`).pipe(
      map(response => response.result)
    );
  }

  getSpendingByCategory(): Observable<SpendingByCategory[]> {
    return this.apiService.get<SpendingByCategory[]>(`${this.endpoint}/spending-by-category`).pipe(
      map(response => response.result || [])
    );
  }
  
  getAccountSummary(accountId: number): Observable<AccountSummary> {
    return this.apiService.get<AccountSummary>(`${this.endpoint}/account-summary/${accountId}`).pipe(
      map(response => response.result)
    );
  }
}
