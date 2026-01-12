import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Transaction } from '../transaction';
import { ColumnDefinition, DataTable } from '../../../shared/components/data-table/data-table';
import { asyncScheduler, filter, finalize, firstValueFrom, observeOn, switchMap, tap } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TransactionForm } from '../transaction-form/transaction-form';
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccountSummary } from '../../dashboard/dashboard';
import { DashboardService } from '../../dashboard/dashboard';
import { TransactionSwitchForm } from '../transaction-switch-form/transaction-switch-form';
import { AccountState } from '../../../core/state/account-state.service';

@Component({
  selector: 'app-transaction-list',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, ProgressSpinnerModule, DataTable, ToastModule, ConfirmDialogModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
  providers: [DialogService, MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionList implements OnInit {
  private route = inject(ActivatedRoute);
  private transactionService = inject(Transaction);
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private accountState = inject(AccountState);

  transactions: Transaction[] = [];
  isLoading = false;
  accountId: number | null = null;
  ref: DynamicDialogRef | undefined;
  summary: AccountSummary | null = null;

  transactionColumns: ColumnDefinition[] = [
    { field: 'date', header: 'Date', isDate: true },
    { field: 'description', header: 'Description' },
    { field: 'categoryName', header: 'Category' },
    { field: 'amount', header: 'Amount', isCurrency: true, isTransaction: true },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      const params = await firstValueFrom(this.route.paramMap);
      const id = Number(params.get('id'));

      if (!id || isNaN(id)) {
        console.error('Invalid account ID from URL.');
        this.transactions = [];
        return;
      }
      this.accountId = id;

      // --- FETCH BOTH DATASETS IN PARALLEL ---
      const [paginatedResult, summaryData] = await Promise.all([
        firstValueFrom(this.transactionService.getTransactionsForAccount(this.accountId, { pageNumber: 1, pageSize: 50 })),
        firstValueFrom(this.dashboardService.getAccountSummary(this.accountId))
      ]);

      this.transactions = paginatedResult.data;
      this.summary = summaryData;

      // Sync balance with AccountState (Single Source of Truth)
      const accountInState = this.accountState.accounts().find(a => a.id === this.accountId);
      if (accountInState && this.summary) {
        this.summary.currentBalance = accountInState.balance;
      }

    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async showTransactionForm(transactionToEdit?: Transaction): Promise<void> {
    const isEditMode = !!transactionToEdit;
    this.ref = this.dialogService.open(TransactionForm, {
      header: isEditMode ? 'Edit Transaction' : 'Add a New Transaction',
      width: '400px',
      modal: true,

      data: {
        transaction: transactionToEdit,
        currentAccountId: this.accountId // Pass the current account ID to the form
      }
    });

    const result = await firstValueFrom(this.ref.onClose);
    if (result) {
      this.loadData();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Operation successful' });
    }
  }

  deleteTransaction(transaction: Transaction): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this transaction?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await firstValueFrom(this.transactionService.deleteTransaction(this.accountId!, transaction.id));
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Transaction deleted' });
          await this.accountState.refresh();
          await this.loadData();
        } catch (err) {
          console.error('Failed to delete transaction', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete transaction' });
        }
      }
    });
  }

  async showSwitchAccountForm(transaction: Transaction): Promise<void> {
    this.ref = this.dialogService.open(TransactionSwitchForm, {
      header: 'Switch Transaction Account',
      width: '400px',
      modal: true,

      data: { currentAccountId: this.accountId }
    });

    const result = await firstValueFrom(this.ref.onClose);

    if (result && result.destinationAccountId) {
      try {
        await firstValueFrom(this.transactionService.switchAccount(this.accountId!, transaction.id, result.destinationAccountId));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Transaction switched successfully' });
        await this.accountState.refresh();
        await this.loadData();
      } catch (err: any) {
        console.error('Failed to switch transaction', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to switch transaction' });
      }
    }
  }
}
