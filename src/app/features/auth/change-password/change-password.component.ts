import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Auth, ChangePasswordDto } from '../../../core/services/auth';
import { HttpErrorResponse } from '@angular/common/http';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, ToastModule],
  templateUrl: './change-password.component.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--surface-ground);
    }
    ::ng-deep .p-password input {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup;
  isSubmitting = false;

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const dto: ChangePasswordDto = {
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword
    };

    this.authService.changePassword(dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully. You will be logged out.' });
          setTimeout(() => this.authService.logout(), 2000);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error?.description || 'Failed to change password' });
        }
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'An error occurred' });
        this.cdr.markForCheck();
      }
    });
  }
}
