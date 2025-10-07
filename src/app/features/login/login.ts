import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../core/services/auth';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers:[MessageService]
})
export class Login {
  loginForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private messageService: MessageService
  ) {
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
    this.auth.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.router.navigate(['/accounts']);
        } else {
          this.messageService.add({severity:'error', summary: 'Login Failed', detail: response.message});
        }
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        // Handle 400 Bad Request and other errors
        const detail = err.error?.message || 'An unknown error occurred.';
        this.messageService.add({severity:'error', summary: 'Error', detail: detail});
        this.isSubmitting = false;
      }
    });
  }
}
