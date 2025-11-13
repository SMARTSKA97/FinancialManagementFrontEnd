import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Account } from '../../accounts/account';
import { firstValueFrom } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-transaction-switch-form',
  imports: [SelectModule,ButtonModule,ReactiveFormsModule],
  templateUrl: './transaction-switch-form.html',
  styleUrl: './transaction-switch-form.scss'
})
export class TransactionSwitchForm implements OnInit {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private accountService = inject(Account);

  switchForm: FormGroup;
  filteredAccounts: Account[] = [];
  currentAccountId: number;

  constructor() {
    this.currentAccountId = this.config.data.currentAccountId;
    this.switchForm = this.fb.group({
      destinationAccountId: [null, Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    const accountsResult = await firstValueFrom(this.accountService.getAccounts({ pageNumber: 1, pageSize: 999 }));
    // Populate the dropdown with all accounts EXCEPT the one we are in
    this.filteredAccounts = accountsResult.data.filter(a => a.id !== this.currentAccountId);
  }

  onSubmit(): void {
    if (this.switchForm.valid) {
      this.ref.close(this.switchForm.value); // Return { destinationAccountId: 123 }
    }
  }
}