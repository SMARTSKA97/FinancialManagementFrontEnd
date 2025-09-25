import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm {

  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // If data was passed (i.e., we are editing), pre-fill the form
    if (this.config.data) {
      this.categoryForm.patchValue(this.config.data);
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.ref.close(this.categoryForm.value);
    }
  }
}
