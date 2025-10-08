import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../core/services/auth';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule, ToastModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loginForm: FormGroup;
  isSubmitting: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.router.navigate(['/accounts']);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: response.message });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        const detail = err.error?.message || 'An unknown error occurred.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
      }
    });
  }
}
