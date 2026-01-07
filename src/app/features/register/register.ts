import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../core/services/auth';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../core/services/notification.service';
import { MessageService } from 'primeng/api'; // Required for ToastModule to work in template, even if we use NotificationService

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule, DatePickerModule, ToastModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  registerForm: FormGroup;
  isSubmitting: boolean = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  };

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    // Exclude confirmPassword from the DTO sent to the backend
    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.notificationService.showSuccess('Registration successful! Please login.');
          this.router.navigate(['/login']);
        } else {
          const msg = response.error?.description || 'Registration failed.';
          this.notificationService.showError(msg);
        }
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (err.status === 400 && err.error?.errors) {
          this.processValidationErrors(err.error.errors);
          this.notificationService.showError('Please fix the validation errors.');
        } else {
          // ProblemDetails uses 'detail'
          const detail = err.error?.detail || err.error?.message || 'An unknown error occurred.';
          this.notificationService.showError(detail);
        }
        this.cdr.markForCheck();
      }
    });
  }

  private processValidationErrors(errors: any) {
    if (Array.isArray(errors)) {
      // Handle array of strings (e.g., ["Username '...' is already taken."])
      const message = errors.join('\n');
      this.notificationService.showError(message, 'Validation Error');
    } else if (typeof errors === 'object' && errors !== null) {
      // Handle object (e.g., { "UserName": ["..."] })
      for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
          let formControlName = key.charAt(0).toLowerCase() + key.slice(1);
          const control = this.registerForm.get(formControlName);

          if (control) {
            const errorMessages = errors[key].join(' ');
            control.setErrors({ serverError: errorMessages });
          } else {
            // If we can't map it to a control, show it as a toast
            const msg = errors[key].join(' ');
            this.notificationService.showError(msg, 'Validation Error');
          }
        }
      }
    } else {
      // Fallback
      this.notificationService.showError('An unexpected validation error occurred.');
    }
  }
}

