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

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,RouterLink,CardModule,InputTextModule,PasswordModule,ButtonModule,DatePickerModule],
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
      // Mark all fields as touched to show validation errors
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          console.log('Registration successful');
          this.router.navigate(['/login']);
        } else {
          // Display backend validation errors
          this.messageService.add({severity:'error', summary: 'Error', detail: response.message || 'Registration failed'});
          console.error('Registration failed', response.errors);
        }
      },
      error: (err) => {
        this.messageService.add({severity:'error', summary: 'Error', detail: 'An unknown error occurred.'});
        console.error('Registration failed', err);
      }
    });
  }
}
