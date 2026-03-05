import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Auth, ForgotPasswordDto } from '../../../core/services/auth';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, ToastModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private authService = inject(Auth);
    private messageService = inject(MessageService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);

    form: FormGroup;
    isSubmitting = false;

    constructor() {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit() {
        if (this.form.invalid || this.isSubmitting) return;

        this.isSubmitting = true;
        this.cdr.markForCheck();

        const dto: ForgotPasswordDto = { email: this.form.value.email };

        this.authService.forgotPassword(dto).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'If an account exists, a reset link has been sent.' });
                // Navigate to reset password page carrying over the email
                this.router.navigate(['/reset-password'], { queryParams: { email: this.form.value.email } });
                this.form.reset();
                this.cdr.markForCheck();
            },
            error: (err: HttpErrorResponse) => {
                this.isSubmitting = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred.' });
                this.cdr.markForCheck();
            }
        });
    }
}
