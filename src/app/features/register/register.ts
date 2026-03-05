import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
import { MessageService } from 'primeng/api';
import { StepperModule } from 'primeng/stepper';
import { InputOtpModule } from 'primeng/inputotp';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule, DatePickerModule, ToastModule, StepperModule, InputOtpModule],
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
  isSubmitting = false;
  isVerifying = false;
  otpSent = false;

  activeStep = 1;
  otpValue = '';

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], [this.emailUniqueValidator.bind(this)]],
      userName: ['', Validators.required, [this.usernameUniqueValidator.bind(this)]],
      password: ['', [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // --- Async Validators for Live Verification ---
  emailUniqueValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) return of(null);
    return timer(500).pipe(
      switchMap(() => this.authService.checkEmail(control.value)),
      map(res => res.isSuccess && res.value === true ? null : { emailTaken: true }),
      catchError(() => of(null))
    );
  }

  usernameUniqueValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) return of(null);
    return timer(500).pipe(
      switchMap(() => this.authService.checkUsername(control.value)),
      map(res => res.isSuccess && res.value === true ? null : { usernameTaken: true }),
      catchError(() => of(null))
    );
  }

  // --- Stepper Navigation ---
  nextStep() {
    if (this.activeStep === 1) {
      if (this.registerForm.get('name')?.valid && this.registerForm.get('dateOfBirth')?.valid) {
        this.activeStep = 2;
      } else {
        this.registerForm.get('name')?.markAsTouched();
        this.registerForm.get('dateOfBirth')?.markAsTouched();
      }
    } else if (this.activeStep === 2) {
      if (this.registerForm.get('email')?.valid && this.registerForm.get('userName')?.valid) {
        this.activeStep = 3;
      } else {
        this.registerForm.get('email')?.markAsTouched();
        this.registerForm.get('userName')?.markAsTouched();
      }
    }
  }

  prevStep() {
    if (this.activeStep > 1) {
      this.activeStep--;
    }
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  };

  // --- Password Hint Helpers ---
  hasMinLength(pwd: string): boolean { return pwd?.length >= 12; }
  hasUpper(pwd: string): boolean { return /[A-Z]/.test(pwd || ''); }
  hasLower(pwd: string): boolean { return /[a-z]/.test(pwd || ''); }
  hasNumber(pwd: string): boolean { return /\d/.test(pwd || ''); }
  hasSpecial(pwd: string): boolean { return /[@$!%*?&]/.test(pwd || ''); }

  // --- Step 3: Send OTP ---
  sendOtp(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.otpSent = true;
          this.activeStep = 4;
          this.notificationService.showSuccess('Verification code sent to your email!');
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
          const detail = err.error?.detail || err.error?.message || 'An unknown error occurred.';
          this.notificationService.showError(detail);
        }
        this.cdr.markForCheck();
      }
    });
  }

  // --- Step 4: Verify OTP ---
  verifyOtp(): void {
    if (!this.otpValue || this.otpValue.length < 6) {
      this.notificationService.showError('Please enter the 6-digit verification code.');
      return;
    }

    this.isVerifying = true;
    this.cdr.markForCheck();

    const email = this.registerForm.get('email')?.value;

    this.authService.verifyRegistration({ email, otp: this.otpValue }).subscribe({
      next: (response) => {
        this.isVerifying = false;
        if (response.isSuccess) {
          this.notificationService.showSuccess('Account created successfully! Please login.');
          this.router.navigate(['/login']);
        } else {
          const msg = response.error?.description || 'Verification failed.';
          this.notificationService.showError(msg);
        }
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.isVerifying = false;
        const detail = err.error?.detail || err.error?.message || 'Verification failed.';
        this.notificationService.showError(detail);
        this.cdr.markForCheck();
      }
    });
  }

  private processValidationErrors(errors: any) {
    if (Array.isArray(errors)) {
      const message = errors.join('\n');
      this.notificationService.showError(message, 'Validation Error');
    } else if (typeof errors === 'object' && errors !== null) {
      for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
          let formControlName = key.charAt(0).toLowerCase() + key.slice(1);
          const control = this.registerForm.get(formControlName);

          if (control) {
            const errorMessages = errors[key].join(' ');
            control.setErrors({ serverError: errorMessages });
          } else {
            const msg = errors[key].join(' ');
            this.notificationService.showError(msg, 'Validation Error');
          }
        }
      }
    } else {
      this.notificationService.showError('An unexpected validation error occurred.');
    }
  }
}
