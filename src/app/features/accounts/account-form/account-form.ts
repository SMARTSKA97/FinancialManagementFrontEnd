import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-account-form',
  imports: [CommonModule,ReactiveFormsModule,InputTextModule,InputNumberModule,ButtonModule],
  templateUrl: './account-form.html',
  styleUrl: './account-form.scss'
})
export class AccountForm {
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // If data was passed for editing, patch the form
    if (this.config.data) {
      this.accountForm.patchValue(this.config.data);
    }
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      // Close the dialog and pass the form data back to the component that opened it
      this.ref.close(this.accountForm.value);
    }
  }
}
