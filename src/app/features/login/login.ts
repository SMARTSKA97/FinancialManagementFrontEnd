import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth, LoginUserDto } from '../../core/services/auth';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule, ToastModule, DialogModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  loginForm: FormGroup;
  isSubmitting: boolean = false;
  showConcurrentLoginModal: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: LoginUserDto = this.loginForm.value;
    this.performLogin(credentials);
  }

  performLogin(credentials: LoginUserDto): void {
    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.showConcurrentLoginModal = false;
          this.router.navigate(['/dashboard']);
        } else {
          // Check for Concurrent Login (Backend returns 200 OK with failure)
          if (response.error?.code === 'Auth.ConcurrentLogin') {
            this.showConcurrentLoginModal = true;
            this.cdr.markForCheck();
            return;
          }

          const msg = response.error?.description || 'Login failed';
          this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: msg });
        }
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;

        // Check for Concurrent Login Error
        if (err.status === 400) {
          console.error('Login Error Response:', err.error); // Debugging
          const errorBody = err.error;

          // Robust check for ConcurrentLogin flag
          let isConcurrent = false;

          // Check 1: Explicit "ConcurrentLogin" in errors array
          if (errorBody?.errors && Array.isArray(errorBody.errors)) {
            isConcurrent = errorBody.errors.includes('ConcurrentLogin');
          }

          // Check 2: Fallback to message text if errors array is missing or empty
          if (!isConcurrent && errorBody?.message) {
            isConcurrent = errorBody.message.includes('already logged in') || errorBody.message.includes('ConcurrentLogin');
          }

          if (isConcurrent) {
            this.showConcurrentLoginModal = true;
            this.cdr.markForCheck();
            return;
          }
        }

        const detail = err.error?.message || 'An unknown error occurred.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
        this.cdr.markForCheck();
      }
    });
  }

  confirmForceLogin(): void {
    const credentials: LoginUserDto = {
      ...this.loginForm.value,
      forceLogin: true
    };
    this.performLogin(credentials);
  }

  cancelForceLogin(): void {
    this.showConcurrentLoginModal = false;
    this.loginForm.reset();
    this.cdr.markForCheck();
  }
}
