import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction, TransactionService, TransactionPageResult, TransactionQueryParams } from '../transaction';
import { ColumnDefinition, DataTable } from '../../../shared/components/data-table/data-table';
import { firstValueFrom } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TransactionForm } from '../transaction-form/transaction-form';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

interface MonthOption {
  label: string;
  value: number;
}

interface YearOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-transactions-page',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    PaginatorModule,
    ProgressSpinnerModule,
    DataTable,
    MultiSelectModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './transactions-page.html',
  styleUrl: './transactions-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsPage implements OnInit {
  private transactionService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService); // Added
  private messageService = inject(MessageService); // Added
  private confirmationService = inject(ConfirmationService); // Added
  private router = inject(Router); // Added

  // --- Filter state ---
  months: MonthOption[] = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  years: YearOption[] = [];
  selectedMonth: number;
  selectedYear: number;
  selectedCategory: string | null = null;
  globalSearch: string = '';
  categoryOptions: { label: string; value: string }[] = [];

  // --- Data state ---
  transactions: Transaction[] = [];
  totalRecords = 0;
  pageSize = 15;
  currentPage = 1;
  isLoading = false;

  // --- Summary ---
  balanceBF = 0;
  totalIncome = 0;
  totalExpenses = 0;
  totalSavings = 0;
  closingBalance = 0;

  // --- Table columns ---
  transactionColumns: ColumnDefinition[] = [
    { field: 'date', header: 'Date', isDate: true },
    { field: 'accountName', header: 'Account' },
    { field: 'description', header: 'Description' },
    { field: 'categoryName', header: 'Category' },
    { field: 'amount', header: 'Amount', isCurrency: true, isTransaction: true },
  ];

  constructor() {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1; // JS months are 0-based
    this.selectedYear = now.getFullYear();

    // Build year range: 5 years back, 1 year forward
    const currentYear = now.getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
      this.years.push({ label: y.toString(), value: y });
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  onMonthChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  onYearChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  clearCategoryFilter(): void {
    this.selectedCategory = null;
    this.currentPage = 1;
    this.loadData();
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const filters: { [key: string]: string } = {
        month: this.selectedMonth.toString(),
        year: this.selectedYear.toString(),
      };

      if (this.selectedCategory) {
        filters['categoryName'] = this.selectedCategory;
      }

      const queryParams: TransactionQueryParams = {
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        filters,
        globalSearch: this.globalSearch
      };

      const result = await firstValueFrom(this.transactionService.getAllTransactions(queryParams));

      // Update transaction data
      this.transactions = result.transactions.data;
      this.totalRecords = result.transactions.totalRecords;

      // Update summary
      this.balanceBF = result.balanceBroughtForward;
      this.totalIncome = result.totalIncome;
      this.totalExpenses = result.totalExpenses;
      this.totalSavings = result.totalSavings;
      this.closingBalance = this.balanceBF + this.totalSavings;

      // Update categories
      this.categoryOptions = result.availableCategories.map(c => ({ label: c, value: c }));

    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  // --- Actions ---

  goToBulkAdd() {
    this.router.navigate(['/app/bulk-transaction-add']);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadData();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadData();
  }

  editTransaction(transaction: Transaction) {
    const ref = this.dialogService.open(TransactionForm, {
      header: 'Edit Transaction',
      width: '50vw',
      data: { 
        transaction: transaction,
        currentAccountId: transaction.accountId 
      }
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Transaction updated successfully' });
        this.loadData();
      }
    });
  }

  deleteTransaction(transaction: Transaction) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this transaction: "${transaction.description}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.transactionService.deleteTransaction(transaction.accountId, transaction.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Transaction deleted successfully' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete transaction' });
          }
        });
      }
    });
  }
}
