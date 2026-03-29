import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Transaction, TransactionService } from '../transaction';
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
import { NotificationService } from '../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-transaction-list',
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink, 
    CardModule, 
    ButtonModule, 
    ProgressSpinnerModule, 
    DataTable, 
    ToastModule, 
    ConfirmDialogModule,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    TooltipModule
  ],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
  providers: [DialogService, MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionList implements OnInit {
  private route = inject(ActivatedRoute);
  private transactionService = inject(TransactionService);
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private accountState = inject(AccountState);
  private notificationService = inject(NotificationService);

  transactions: Transaction[] = [];
  isLoading = false;
  accountId: number | null = null;
  ref: DynamicDialogRef | undefined;
  summary: AccountSummary | null = null;
  totalRecords = 0;
  rows = 10;
  lastLazyLoadEvent: any;
  private lastQueryKey: string | null = null;
  ready = false;

  // Filter state
  selectedDate: Date = new Date();
  selectedCategory: string | null = null;
  globalSearch: string = '';
  categoryOptions: { label: string; value: string }[] = [];

  transactionColumns: ColumnDefinition[] = [
    { field: 'date', header: 'Date', isDate: true, sortable: true },
    { field: 'description', header: 'Description', sortable: true },
    { field: 'categoryName', header: 'Category', sortable: true },
    { field: 'amount', header: 'Amount', isCurrency: true, isTransaction: true, sortable: true },
  ];

  async ngOnInit(): Promise<void> {
    this.selectedDate.setDate(1); // canonical start of month
    const params = await firstValueFrom(this.route.paramMap);
    const id = Number(params.get('id'));
    if (!id || isNaN(id)) {
      return;
    }
    this.accountId = id;
    
    // Load categories
    const result = await firstValueFrom(this.transactionService.getAllTransactions({ pageNumber: 1, pageSize: 1, filters: {} }));
    this.categoryOptions = result.availableCategories.map(c => ({ label: c, value: c }));

    this.ready = true;
    this.cdr.markForCheck();
  }

  async loadData(event?: any): Promise<void> {
    if (this.isLoading) return;
    if (this.accountId === null) return;

    // 1. Determine current state
    const pageNumber = event ? (event.first / event.rows + 1) : (this.lastLazyLoadEvent ? (this.lastLazyLoadEvent.first / this.lastLazyLoadEvent.rows + 1) : 1);
    const pageSize = event ? event.rows : (this.lastLazyLoadEvent ? this.lastLazyLoadEvent.rows : this.rows);
    const sortBy = event?.sortField || this.lastLazyLoadEvent?.sortField || 'date';
    const sortOrder = event?.sortOrder === 1 ? 'asc' : (event?.sortOrder === -1 ? 'desc' : (this.lastLazyLoadEvent?.sortOrder === 1 ? 'asc' : 'desc'));

    const filters: { [key: string]: string } = {
      month: (this.selectedDate.getMonth() + 1).toString(),
      year: this.selectedDate.getFullYear().toString(),
    };
    if (this.selectedCategory) {
      filters['categoryName'] = this.selectedCategory;
    }

    const startOfMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1, 0, 0, 0);
    const endOfMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);

    // 2. Create a unique key for this query to prevent infinite loops
    const currentQueryKey = JSON.stringify({
      accountId: this.accountId,
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
      filters,
      globalSearch: this.globalSearch,
      // Date range for summary is derived from selectedDate which is in filters
    });

    if (this.lastQueryKey === currentQueryKey && this.transactions.length > 0) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      this.lastQueryKey = currentQueryKey;
      if (event) this.lastLazyLoadEvent = event;

      // --- FETCH BOTH DATASETS IN PARALLEL ---
      const [paginatedResult, summaryData] = await Promise.all([
        firstValueFrom(this.transactionService.getTransactionsForAccount(this.accountId, {
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          filters,
          globalSearch: this.globalSearch || ''
        })),
        firstValueFrom(this.dashboardService.getAccountSummary(this.accountId, startOfMonth, endOfMonth))
      ]);

      this.transactions = paginatedResult.data;
      this.totalRecords = paginatedResult.totalRecords;
      this.summary = summaryData;

    } catch (err) {
      console.error('Failed to load account transactions', err);
      this.lastQueryKey = null; // Allow retry on error
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onDateChange(event: any): void {
    if (event) {
      this.selectedDate = event;
      this.loadData();
    }
  }

  onCategoryChange(): void {
    this.loadData();
  }

  onSearch(): void {
    this.loadData();
  }

  clearSearch(): void {
    this.globalSearch = '';
    this.onSearch();
  }

  onLazyLoad(event: any): void {
    if (this.accountId === null) return; // Guard against early calls
    this.loadData(event);
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
          this.notificationService.showError('Failed to delete transaction');
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
        this.notificationService.showError('Failed to switch transaction target');
      }
    }
  }
}

