import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, CheckboxModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm implements OnInit {
  categoryForm: FormGroup;
  isTransactionCategory = false; // To know when to show the checkbox

  constructor(
    private fb: FormBuilder, 
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.categoryForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      isTransferCategory: [false] // Add the new form control
    });
  }

  ngOnInit(): void {
    // Check if we are editing a Transaction Category
    if (this.config.data?.endpoint === 'TransactionCategories') {
      this.isTransactionCategory = true;
    }
    
    // Patch the form if we are in edit mode
    if (this.config.data?.itemToEdit) {
      this.categoryForm.patchValue(this.config.data.itemToEdit);
    }

    // If not a transaction category, disable the transfer checkbox
    if (!this.isTransactionCategory) {
      this.categoryForm.get('isTransferCategory')?.disable();
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.ref.close(this.categoryForm.getRawValue()); // Use getRawValue() to get disabled fields
    }
  }
}
