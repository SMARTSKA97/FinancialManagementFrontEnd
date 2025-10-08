import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../core/services/auth';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,RouterLink,CardModule,InputTextModule,PasswordModule,ButtonModule,DatePickerModule, ToastModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers:[MessageService]
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private messageService = inject(MessageService);

  registerForm: FormGroup;
  isSubmitting: boolean = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.router.navigate(['/login']);
        } else {
          // This handles cases where the API returns a 200 OK but with a failure message
          this.messageService.add({severity:'error', summary: 'Registration Failed', detail: response.message});
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (err.status === 400 && err.error?.errors) {
          // This is a validation error from our backend
          this.processValidationErrors(err.error.errors);
        } else {
          // This is a different kind of error (network, server crash, etc.)
          this.messageService.add({severity:'error', summary: 'Error', detail: 'An unknown error occurred.'});
        }
      }
    });
  }

  private processValidationErrors(errors: any) {
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        const formControlName = key.charAt(0).toLowerCase() + key.slice(1);
        const control = this.registerForm.get(formControlName);
        
        if (control) {
          const errorMessages = errors[key].join(' ');
          control.setErrors({ serverError: errorMessages });
        }
      }
    }
  }
}
