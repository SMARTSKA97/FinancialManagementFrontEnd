import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidationService {

    getErrorMessage(control: AbstractControl | null): string {
        if (!control || !control.errors || !control.touched) {
            return '';
        }

        const errors = control.errors;

        if (errors['required']) {
            return 'This field is required';
        }

        if (errors['min']) {
            return `Value must be at least ${errors['min'].min}`;
        }

        if (errors['max']) {
            return `Value must be at most ${errors['max'].max}`;
        }

        if (errors['email']) {
            return 'Invalid email address';
        }

        if (errors['minlength']) {
            return `Minimum length is ${errors['minlength'].requiredLength} characters`;
        }

        return 'Invalid field';
    }
}
