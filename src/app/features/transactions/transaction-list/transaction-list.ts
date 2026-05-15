import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Transaction } from '../transaction';
import { ColumnDefinition, DataTable } from '../../../shared/components/data-table/data-table';
import { TransactionForm } from '../transaction-form/transaction-form';
import { TransactionSwitchForm } from '../transaction-switch-form/transaction-switch-form';
import { AccountSummary } from '../../dashboard/dashboard';
import { DashboardService } from '../../dashboard/dashboard';
import { AccountState } from '../../../core/state/account-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/layout/breadcrumb.service';
import { sharedPrimeModules } from '../../../shared/prime-imports';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-transaction-list',
  imports: [
    CommonModule,
    DataTable,
    FormsModule,
    StatCard,
    ...sharedPrimeModules
  ],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
  providers: [DialogService, MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionList implements OnInit {
  private route = inject(ActivatedRoute);
  private transactionService = inject(Transaction);
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private accountState = inject(AccountState);
  private notificationService = inject(NotificationService);
  private breadcrumbService = inject(BreadcrumbService);

  transactions = signal<Transaction[]>([]);
  isLoading = signal(false);
  accountId = signal<number | null>(null);
  ref: DynamicDialogRef | undefined;
  summary = signal<AccountSummary | null>(null);
  totalRecords = signal(0);
  rows = signal(10);
  lastLazyLoadEvent: any;
  ready = signal(false);

  // Filters
  searchTerm = signal('');
  selectedDate = signal(new Date());

  constructor() {
    this.breadcrumbService.refresh$.subscribe(() => {
      this.loadData(this.lastLazyLoadEvent);
    });
  }

  transactionColumns: ColumnDefinition[] = [
    { field: 'date', header: 'Date', isDate: true, sortable: true },
    { field: 'description', header: 'Description', sortable: true },
    { field: 'categoryName', header: 'Category', sortable: true },
    { field: 'amount', header: 'Amount', isCurrency: true, isTransaction: true, sortable: true },
  ];

  async ngOnInit(): Promise<void> {
    const params = await firstValueFrom(this.route.paramMap);
    const id = Number(params.get('id'));
    if (!id || isNaN(id)) {
      return;
    }
    this.accountId.set(id);
    this.ready.set(true);
  }

  async loadData(event?: any): Promise<void> {
    this.isLoading.set(true);
    if (event) this.lastLazyLoadEvent = event;

    try {
      if (this.accountId() === null) {
        const params = await firstValueFrom(this.route.paramMap);
        const id = Number(params.get('id'));
        if (!id || isNaN(id)) {
          this.notificationService.showError('Invalid account.');
          return;
        }
        this.accountId.set(id);
      }

      const pageNumber = event ? (event.first / event.rows + 1) : 1;
      const pageSize = event ? event.rows : this.rows();
      const sortBy = event?.sortField || 'date';
      const sortOrder = event?.sortOrder === 1 ? 'asc' : 'desc';

      // --- FETCH BOTH DATASETS IN PARALLEL ---
      const [paginatedResult, summaryData] = await Promise.all([
        firstValueFrom(this.transactionService.getTransactionsForAccount(this.accountId()!, {
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          globalSearch: this.searchTerm(),
          month: this.selectedDate().getMonth() + 1,
          year: this.selectedDate().getFullYear()
        })),
        firstValueFrom(this.dashboardService.getAccountSummary(this.accountId()!))
      ]);

      this.transactions.set(paginatedResult.data);
      this.totalRecords.set(paginatedResult.totalRecords);
      this.summary.set(summaryData);

      // Update Breadcrumbs
      const accountName = this.accountState.accounts().find(a => a.id === this.accountId())?.name || 'Account';
      this.breadcrumbService.setItems([
        { label: 'Accounts', routerLink: '/app/accounts' },
        { label: accountName },
        { label: 'Transactions' }
      ]);

      // Sync balance with AccountState (Single Source of Truth)
      const accountInState = this.accountState.accounts().find(a => a.id === this.accountId());
      const s = this.summary();
      if (accountInState && s) {
        s.currentBalance = accountInState.balance;
        this.summary.set({ ...s });
      }
    } catch (err) {
    } finally {
      this.isLoading.set(false);
    }
  }

  onLazyLoad(event: any): void {
    if (this.accountId() === null) return; // Guard against early calls
    this.loadData(event);
  }

  onFilterChange(): void {
    this.loadData(this.lastLazyLoadEvent);
  }

  async showTransactionForm(transactionToEdit?: Transaction): Promise<void> {
    const isEditMode = !!transactionToEdit;
    this.ref = this.dialogService.open(TransactionForm, {
      header: isEditMode ? 'Edit Transaction' : 'Add a New Transaction',
      width: '400px',
      modal: true,
      closable: true,
      data: {
        transaction: transactionToEdit,
        currentAccountId: this.accountId() // Pass the current account ID to the form
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
          await firstValueFrom(this.transactionService.deleteTransaction(this.accountId()!, transaction.id));
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
      data: { currentAccountId: this.accountId() }
    });

    const result = await firstValueFrom(this.ref.onClose);

    if (result && result.destinationAccountId) {
      try {
        await firstValueFrom(this.transactionService.switchAccount(this.accountId()!, transaction.id, result.destinationAccountId));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Transaction switched successfully' });
        await this.accountState.refresh();
        await this.loadData();
      } catch (err: any) {
        this.notificationService.showError('Failed to switch transaction target');
      }
    }
  }
}

