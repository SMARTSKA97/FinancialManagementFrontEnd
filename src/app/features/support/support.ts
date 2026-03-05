import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AccountCategory, Category } from '../categories/category';
import { firstValueFrom } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from "primeng/select";
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { GenericApi } from '../../core/services/generic-api';

@Component({
  selector: 'app-support',
  imports: [CardModule, ButtonModule, SelectModule, ToastModule, ReactiveFormsModule, EditorModule, InputTextModule],
  templateUrl: './support.html',
  styleUrl: './support.scss',
  providers: [MessageService]
})
export class Support {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private apiService = inject(GenericApi);

  supportForm: FormGroup;
  submissionTypes: any[];
  isSubmitting = false;


  constructor() {
    this.supportForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      type: [null, Validators.required],
      description: ['', Validators.required]
    });

    this.submissionTypes = [
      { label: 'Report a Bug', value: 'bug' },
      { label: 'Suggest a Feature', value: 'feature' },
      { label: 'Ask a Question', value: 'question' }
    ];
  }

  async onSubmit(): Promise<void> {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      // Use the standard 'upsert' method instead of 'post'
      const response = await firstValueFrom(this.apiService.upsert('Feedback', this.supportForm.value));

      if (response.isSuccess) {
        this.messageService.add({
          severity: 'success',
          summary: 'Submitted',
          detail: 'Thank you for your feedback!'
        });
        this.supportForm.reset();
      } else {
        throw new Error(response.error?.description || 'Submission failed');
      }
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not submit feedback. Please try again later.'
      });
    } finally {
      this.isSubmitting = false;
    }
  }
}
