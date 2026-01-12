import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AccountCategory, Category } from '../../categories/category';
import { firstValueFrom } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ValidationService } from '../../../core/services/validation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormField } from '../../../shared/components/form-field/form-field';
import { AccountState } from '../../../core/state/account-state.service';

@Component({
  selector: 'app-account-form',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, ButtonModule, SelectModule, FormField],
  templateUrl: './account-form.html',
  styleUrl: './account-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountForm {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private categoryService = inject(Category);
  public validationService = inject(ValidationService);
  private accountState = inject(AccountState);
  private notificationService = inject(NotificationService);

  accountForm: FormGroup;
  accountCategories = signal<AccountCategory[]>([]);
  currentFilter = signal<string>('');
  isSubmitting = signal<boolean>(false);

  constructor() {
    this.accountForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      accountCategoryId: [null, Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    const categories = await firstValueFrom(this.categoryService.getAccountCategories());
    if (categories) {
      this.accountCategories.set(categories);
    }

    const data = this.config.data;
    if (data && data.itemToEdit) {
      const item = data.itemToEdit;
      const category = this.accountCategories().find(c => c.name === item.accountCategoryName);
      this.accountForm.patchValue({
        ...item,
        accountCategoryId: category ? category.id : null
      });
    }
  }

  filterCategories(event: { filter: string }): void {
    this.currentFilter.set(event.filter);
  }

  isNewCategory(): boolean {
    const filter = this.currentFilter().trim().toLowerCase();
    if (!filter) {
      return false;
    }
    return !this.accountCategories().some(c => c.name.toLowerCase() === filter);
  }

  async addNewCategory(): Promise<void> {
    const newCategoryName = this.currentFilter().trim();
    if (newCategoryName) {
      try {
        const newCategory = await firstValueFrom(this.categoryService.upsertAccountCategory({ name: newCategoryName }));
        if (newCategory) {
          this.accountCategories.update(categories => [...categories, newCategory]);
          this.accountForm.get('accountCategoryId')?.setValue(newCategory.id);
          this.currentFilter.set('');
        }
      } catch (err) {
        console.error("Failed to create new category", err);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.accountForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      // accountForm.value might need processing?
      // existing logic: this.ref.close(this.accountForm.value);
      // So value structure is correct.

      const payload = this.accountForm.value;
      const endpoint = this.config.data.endpoint;

      try {
        await this.accountState.addAccount(payload);
        this.notificationService.showSuccess('Account saved');
        this.ref.close(true); // Signal success
      } catch (err: any) {
        this.notificationService.showError(err.message || 'Failed to save account');
        this.isSubmitting.set(false);
      }
    } else {
      this.accountForm.markAllAsTouched();
    }
  }
}

