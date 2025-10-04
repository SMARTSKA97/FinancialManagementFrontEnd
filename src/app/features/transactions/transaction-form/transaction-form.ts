import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TransactionType } from '../transaction';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Category, TransactionCategory } from '../../categories/category';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-transaction-form',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule,ButtonModule, DatePickerModule, SelectModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss'
})
export class TransactionForm implements OnInit {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  // Correctly inject the CategoryService
  private categoryService = inject(Category);

  transactionForm: FormGroup;
  transactionTypes: any[];
  // Use the correct type for categories
  categories: TransactionCategory[] = [];
  currentFilter: string = '';

  constructor() {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      type: [TransactionType.Expense, Validators.required],
      categoryId: [null]
    });

    this.transactionTypes = [
      { label: 'Expense', value: TransactionType.Expense },
      { label: 'Income', value: TransactionType.Income }
    ];
  }

  ngOnInit(): void {
    this.loadCategories();
    if (this.config.data) {
       const category = this.categories.find(c => c.name === this.config.data.categoryName);
      
      this.transactionForm.patchValue({
        ...this.config.data,
        date: new Date(this.config.data.date), // Ensure date is a Date object
        transactionCategoryId: category ? category.id : null
      });
    }
  }

  async loadCategories(): Promise<void> {
    // The service now returns the array directly
    const categories = await firstValueFrom(this.categoryService.getTransactionCategories());
    if (categories) {
        this.categories = categories;
    }
  }

  filterCategories(event: { filter: string }): void {
    this.currentFilter = event.filter;
  }

  isNewCategory(): boolean {
    const filter = this.currentFilter.trim().toLowerCase();
    if (!filter) {
      return false;
    }
    return !this.categories.some(c => c.name.toLowerCase() === filter);
  }

  async addNewCategory(): Promise<void> {
    const newCategoryName = this.currentFilter.trim();
    if (newCategoryName) {
      try {
        // Use the correct 'upsert' method
        const newCategory = await firstValueFrom(this.categoryService.upsertTransactionCategory({ name: newCategoryName }));
        if (newCategory) {
          this.categories = [...this.categories, newCategory];
          this.transactionForm.get('categoryId')?.setValue(newCategory.id);
          this.currentFilter = '';
        }
      } catch (err) {
        console.error("Failed to create new category", err);
      }
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.ref.close(this.transactionForm.value);
    }
  }
}