import { inject, Injectable } from '@angular/core';
import { GenericApi } from './generic-api';
import { RecurringTransaction, UpsertRecurringTransactionRequest } from '../models/recurring-transaction.model';

@Injectable({
    providedIn: 'root'
})
export class RecurringTransactionService {
    private api = inject(GenericApi);
    private endpoint = 'RecurringTransactions';

    getRecurringTransactions() {
        return this.api.get<RecurringTransaction[]>(this.endpoint);
    }

    upsertRecurringTransaction(request: UpsertRecurringTransactionRequest, id?: number) {
        const url = id ? `${this.endpoint}/upsert?id=${id}` : `${this.endpoint}/upsert`;
        return this.api.post<RecurringTransaction>(url, request);
    }

    deleteRecurringTransaction(id: number) {
        return this.api.post<boolean>(`${this.endpoint}/delete`, { id });
    }
}
