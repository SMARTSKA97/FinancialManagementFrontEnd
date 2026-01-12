import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ValidationService } from '../../../core/services/validation.service';
import { GenericCrud } from '../../../core/services/generic-crud';
import { NotificationService } from '../../../core/services/notification.service';
import { FormField } from '../../../shared/components/form-field/form-field';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, CheckboxModule, FormField],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm implements OnInit {
  categoryForm: FormGroup;
  isTransactionCategory = false; // To know when to show the checkbox
  isSubmitting: boolean = false;

  validationService = inject(ValidationService);
  private crudService = inject(GenericCrud<any>);
  private notificationService = inject(NotificationService);

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

  async onSubmit(): Promise<void> {
    if (this.categoryForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const payload = this.categoryForm.getRawValue(); // Use getRawValue() to get disabled fields
      // Use endpoint from config, or default if missing? 
      // ResourcePage passes it.
      const endpoint = this.config.data.endpoint;

      if (!endpoint) {
        this.notificationService.showError('Configuration Error: No endpoint provided', 'Error');
        this.isSubmitting = false;
        return;
      }

      try {
        await this.crudService.upsert(endpoint, payload);
        this.notificationService.showSuccess('Category saved');
        this.ref.close(true);
      } catch (err: any) {
        this.notificationService.showError(err.message || 'Failed to save category');
        this.isSubmitting = false;
      }
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }
}
