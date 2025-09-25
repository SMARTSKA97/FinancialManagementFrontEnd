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
import { Category } from '../../categories/category';
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
  private categoryService = inject(Category);

  transactionForm: FormGroup;
  transactionTypes: any[];
  categories: Category[] = [];
  currentFilter: string = '';


  constructor() {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      type: [TransactionType.Expense, Validators.required]
    });

    this.transactionTypes = [
      { label: 'Expense', value: TransactionType.Expense },
      { label: 'Income', value: TransactionType.Income }
    ];

    this.transactionForm.addControl('categoryId', this.fb.control(null)); 
  }

  ngOnInit(): void {
    this.loadCategories();
    if (this.config.data) {
      this.transactionForm.patchValue(this.config.data);
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
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

  // This method is called when the user clicks the "Add New" button
  async addNewCategory(): Promise<void> {
    const newCategoryName = this.currentFilter.trim();
    if (newCategoryName) {
      try {
        const newCategory = await firstValueFrom(this.categoryService.createCategory({ name: newCategoryName }));
        this.categories = [...this.categories, newCategory];
        this.transactionForm.get('categoryId')?.setValue(newCategory.id);
        this.currentFilter = ''; // Clear the filter
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