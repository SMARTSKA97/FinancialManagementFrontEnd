import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AccountCategory, Category } from '../../categories/category';
import { firstValueFrom } from 'rxjs';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-account-form',
  imports: [CommonModule,ReactiveFormsModule,InputTextModule,InputNumberModule,ButtonModule,SelectModule],
  templateUrl: './account-form.html',
  styleUrl: './account-form.scss'
})
export class AccountForm {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  // Correctly inject the CategoryService
  private categoryService = inject(Category);

  accountForm: FormGroup;
  accountCategories: AccountCategory[] = [];

  constructor() {
    this.accountForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      accountCategoryId: [null, Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    // The service now returns the array directly, so we don't need ".result"
    const categories = await firstValueFrom(this.categoryService.getAccountCategories());
    if (categories) {
      this.accountCategories = categories;
    }

    if (this.config.data) {
      this.accountForm.patchValue(this.config.data);
    }
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.ref.close(this.accountForm.value);
    }
  }
}
