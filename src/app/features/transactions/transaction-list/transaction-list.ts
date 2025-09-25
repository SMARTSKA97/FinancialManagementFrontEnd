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
  private transaction = inject(Transaction);
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
  ];


  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    this.isLoading = true;
    try {
      // 1. Wait for the route parameters to be available
      const params = await firstValueFrom(this.route.paramMap);
      const id = Number(params.get('id'));

      if (!id || isNaN(id)) {
        console.error('Invalid account ID from URL.');
        this.transactions = [];
        return;
      }
      this.accountId = id;

      // 2. Wait for the API call to complete
      const data = await firstValueFrom(this.transaction.getTransactionsForAccount(this.accountId));
      this.transactions = data;

    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      // 3. This block runs after success or failure, guaranteeing the spinner hides
      this.isLoading = false;
      // 4. Manually trigger the UI update
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
        if (isEditMode) {
          await firstValueFrom(this.transaction.updateTransaction(this.accountId!, transactionToEdit.id, result));
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Transaction updated'});
        } else {
          await firstValueFrom(this.transaction.createTransaction(this.accountId!, result));
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Transaction added'});
        }
        this.loadTransactions();
      } catch (err) {
        console.error('Failed to save transaction', err);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to save transaction'});
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
          await firstValueFrom(this.transaction.deleteTransaction(this.accountId!, transaction.id));
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Transaction deleted'});
          this.loadTransactions();
        } catch (err) {
          console.error('Failed to delete transaction', err);
          this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to delete transaction'});
        }
      }
    });
  }
}

