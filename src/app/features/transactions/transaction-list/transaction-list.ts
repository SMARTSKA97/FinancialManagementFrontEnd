import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-transaction-list',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, ProgressSpinnerModule, DataTable, ToastModule, ConfirmDialogModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
  providers: [DialogService, MessageService, ConfirmationService]
})
export class TransactionList implements OnInit {

  private route = inject(ActivatedRoute);
  // Correctly inject TransactionService
  private transactionService = inject(Transaction);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);

  transactions: Transaction[] = [];
  isLoading = false;
  accountId: number | null = null;
  ref: DynamicDialogRef | undefined;

  transactionColumns: ColumnDefinition[] = [
    { field: 'date', header: 'Date', isDate: true },
    { field: 'description', header: 'Description' },
    { field: 'amount', header: 'Amount', isCurrency: true, isTransaction: true },
    { field: 'categoryName', header: 'Category' }
  ];

  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
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

      this.transactions = await firstValueFrom(this.transactionService.getTransactionsForAccount(this.accountId));

    } catch (err) {
      console.error('Failed to load transactions', err);
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
      data: transactionToEdit
    });

    const result = await firstValueFrom(this.ref.onClose);
    if (result) {
      try {
        // Use the single 'upsertTransaction' method for both create and update
        await firstValueFrom(this.transactionService.upsertTransaction(this.accountId!, result));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Transaction ${isEditMode ? 'updated' : 'added'}` });
        this.loadTransactions();
      } catch (err) {
        console.error('Failed to save transaction', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save transaction' });
      }
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
          this.loadTransactions();
        } catch (err) {
          console.error('Failed to delete transaction', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete transaction' });
        }
      }
    });
  }
}

