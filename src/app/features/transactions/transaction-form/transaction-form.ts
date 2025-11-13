import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Transaction, TransactionType } from '../transaction';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Category, TransactionCategory } from '../../categories/category';
import { firstValueFrom } from 'rxjs';
import { Account } from '../../accounts/account';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-transaction-form',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule,ButtonModule, DatePickerModule, SelectModule,ToastModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionForm implements OnInit {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private categoryService = inject(Category);
  private transactionService = inject(Transaction);
  private accountService = inject(Account);
  private messageService = inject(MessageService);

  transactionForm: FormGroup;
  transactionTypes: any[];
  categories: TransactionCategory[] = [];
  accounts: Account[] = []; // For the transfer dropdown
  currentFilter: string = '';
  
  isEditMode = false;
  isTransfer = false;
  currentAccountId: number;

  constructor() {
    // Get data passed from the parent component
    this.currentAccountId = this.config.data.currentAccountId;
    const transactionData = this.config.data.transaction;
    this.isEditMode = !!transactionData;

    this.transactionForm = this.fb.group({
      id: [null],
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      type: [TransactionType.Expense, Validators.required],
      transactionCategoryId: [null],
      destinationAccountId: [null] // Control for the transfer dropdown
    });

    this.transactionTypes = [
      { label: 'Expense', value: TransactionType.Expense },
      { label: 'Income', value: TransactionType.Income }
    ];

    // Patch form if we are in edit mode
    if (this.isEditMode) {
      this.transactionForm.patchValue(transactionData);
      this.transactionForm.patchValue({ date: new Date(transactionData.date) });
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    // Fetch categories and all accounts in parallel
    const [categories, accounts] = await Promise.all([
      firstValueFrom(this.categoryService.getTransactionCategories()),
      firstValueFrom(this.accountService.getAccounts({ pageNumber: 1, pageSize: 999 }))
    ]);
    
    this.categories = categories;
    // Filter out the current account from the list
    this.accounts = accounts.data.filter(a => a.id !== this.currentAccountId);

    // After data is loaded, check if we are editing a transfer
    if (this.isEditMode) {
      const transactionData = this.config.data.transaction;
      const category = this.categories.find(c => c.name === transactionData.categoryName);
      if (category) {
        this.transactionForm.patchValue({ transactionCategoryId: category.id });
        // Manually trigger the check
        this.checkIfTransfer(category.id);
      }
    }
  }

  // --- THIS IS THE CORE TRANSFER LOGIC ---
  onCategoryChange(event: { value: number }): void {
    this.checkIfTransfer(event.value);
  }

  checkIfTransfer(categoryId: number | null): void {
    console.log(categoryId);
    
    const category = this.categories.find(c => c.id === categoryId);
    this.isTransfer = category?.isTransferCategory || false;

    console.log(category,this.isTransfer);
    

    const typeControl = this.transactionForm.get('type');
    const destAccountControl = this.transactionForm.get('destinationAccountId');

    if (this.isTransfer) {
      // If it's a transfer, force type to Expense and make "Transfer to" required
      typeControl?.setValue(TransactionType.Expense);
      typeControl?.disable();
      destAccountControl?.setValidators([Validators.required]);
    } else {
      // If it's not a transfer, re-enable type and remove "Transfer to" requirement
      typeControl?.enable();
      destAccountControl?.clearValidators();
    }
    destAccountControl?.updateValueAndValidity();
  }
  
  // --- (Add-on-the-fly category logic) ---
  isNewCategory(): boolean {
    const filter = this.currentFilter.trim().toLowerCase();
    if (!filter) return false;
    return !this.categories.some(c => c.name.toLowerCase() === filter);
  }

  async addNewCategory(): Promise<void> {
    const newCategoryName = this.currentFilter.trim();
    if (newCategoryName) {
      try {
        const newCategory = await firstValueFrom(this.categoryService.upsertTransactionCategory({ name: newCategoryName }));
        this.categories = [...this.categories, newCategory];
        this.transactionForm.get('transactionCategoryId')?.setValue(newCategory.id);
        this.currentFilter = '';
      } catch (err) {
        console.error("Failed to create new category", err);
      }
    }
  }

  filterCategories(event: { filter: string }): void {
    this.currentFilter = event.filter;
  }

  // --- UPDATED SUBMIT LOGIC ---
  async onSubmit(): Promise<void> {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formValue = this.transactionForm.getRawValue();

    try {
      if (this.isTransfer) {
        // --- Call the new TRANSFER service method ---
        const transferData = {
          description: formValue.description,
          amount: formValue.amount,
          date: formValue.date,
          destinationAccountId: formValue.destinationAccountId,
          transactionCategoryId: formValue.transactionCategoryId
        };
        await firstValueFrom(this.transactionService.createTransfer(this.currentAccountId, transferData));
      } else {
        // --- Call the normal UPSERT service method ---
        const transactionData = {
          id: formValue.id,
          description: formValue.description,
          amount: formValue.amount,
          date: formValue.date,
          type: formValue.type,
          transactionCategoryId: formValue.transactionCategoryId
        };
        await firstValueFrom(this.transactionService.upsertTransaction(this.currentAccountId, transactionData));
      }
      this.ref.close(true); // Close the dialog and signal success
    } catch (err: any) {
      console.error('Failed to save', err);
      this.messageService.add({severity:'error', summary: 'Error', detail: err.error?.message || 'Failed to save transaction'});
    }
  }
}