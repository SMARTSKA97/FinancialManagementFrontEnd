import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { firstValueFrom } from 'rxjs';
import { GenericApi } from '../../../core/services/generic-api';
import { ValidationService } from '../../../core/services/validation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormField } from '../../../shared/components/form-field/form-field';
import { RecurrenceFrequency } from '../../../core/models/recurring-transaction.model';
import { CommonModule } from '@angular/common';
import { GenericCrud } from '../../../core/services/generic-crud';

@Component({
    selector: 'app-recurring-transaction-form',
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, SelectModule, InputNumberModule, InputTextModule, DatePickerModule, CheckboxModule, FormField],
    templateUrl: './recurring-transaction-form.html',
    styleUrl: './recurring-transaction-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecurringTransactionForm implements OnInit {
    recurringForm: FormGroup;
    isSubmitting = signal(false);
    accounts = signal<any[]>([]);
    categories = signal<any[]>([]);

    frequencies = [
        { label: 'Daily', value: RecurrenceFrequency.Daily },
        { label: 'Weekly', value: RecurrenceFrequency.Weekly },
        { label: 'Monthly', value: RecurrenceFrequency.Monthly },
        { label: 'Yearly', value: RecurrenceFrequency.Yearly }
    ];

    types = [
        { label: 'Expense', value: 1 },
        { label: 'Income', value: 0 }
    ];

    validationService = inject(ValidationService);
    private apiService = inject(GenericApi);
    private notificationService = inject(NotificationService);
    private crudService = inject(GenericCrud<any>);
    private cdr = inject(ChangeDetectorRef);
    private fb = inject(FormBuilder);
    public ref = inject(DynamicDialogRef);
    public config = inject(DynamicDialogConfig);

    constructor() {
        this.recurringForm = this.fb.group({
            id: [null],
            accountId: [null, Validators.required],
            transactionCategoryId: [null],
            description: ['', Validators.required],
            amount: [null, [Validators.required, Validators.min(0.01)]],
            type: [1, Validators.required],
            frequency: [RecurrenceFrequency.Monthly, Validators.required],
            startDate: [new Date(), Validators.required],
            endDate: [null],
            isActive: [true]
        });
    }

    async ngOnInit(): Promise<void> {
        try {
            const [accountsRes, categoriesRes] = await Promise.all([
                firstValueFrom(this.apiService.post<any>('Accounts/search', { pageNumber: 1, pageSize: 100 })),
                firstValueFrom(this.apiService.post<any>('TransactionCategories/search', { pageNumber: 1, pageSize: 100 }))
            ]);

            if (accountsRes.isSuccess) this.accounts.set(accountsRes.value.data);
            if (categoriesRes.isSuccess) this.categories.set(categoriesRes.value.data);
            this.cdr.markForCheck();
        } catch (err) {
            this.notificationService.showError('Failed to prepare form.');
            // The original instruction had `this.notifService.showError` but the injected service is `this.notificationService`.
            // Assuming `notificationService` is the correct one based on the imports and injection.
        }

        if (this.config.data?.itemToEdit) {
            const item = { ...this.config.data.itemToEdit };
            if (item.startDate) item.startDate = new Date(item.startDate);
            if (item.endDate) item.endDate = new Date(item.endDate);
            this.recurringForm.patchValue(item);
        }
    }

    async onSubmit(): Promise<void> {
        if (this.recurringForm.valid && !this.isSubmitting()) {
            this.isSubmitting.set(true);
            const payload = this.recurringForm.getRawValue();
            const endpoint = 'RecurringTransactions';

            try {
                await this.crudService.upsert(endpoint, payload);
                this.notificationService.showSuccess('Recurring transaction saved');
                this.ref.close(true);
            } catch (err: any) {
                this.notificationService.showError(err.message || 'Error occurred');
                this.isSubmitting.set(false);
            }
        } else {
            this.recurringForm.markAllAsTouched();
        }
    }
}
