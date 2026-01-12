import { inject, Injectable, signal } from '@angular/core';
import { GenericApi } from '../services/generic-api';
import { firstValueFrom } from 'rxjs';
import { DashboardSummary, SpendingByCategory } from '../../features/dashboard/dashboard';

@Injectable({
    providedIn: 'root'
})
export class DashboardState {
    private api = inject(GenericApi);
    private endpoint = 'Dashboard';

    // State
    private _summary = signal<DashboardSummary | null>(null);
    private _spending = signal<SpendingByCategory[]>([]);
    private _isLoading = signal<boolean>(false);

    // Public
    public summary = this._summary.asReadonly();
    public spending = this._spending.asReadonly();
    public isLoading = this._isLoading.asReadonly();

    constructor() {
        this.load();
    }

    async load(): Promise<void> {
        this._isLoading.set(true);
        try {
            const summaryReq = this.api.get<DashboardSummary>(`${this.endpoint}/summary`);
            const spendingReq = this.api.get<SpendingByCategory[]>(`${this.endpoint}/spending-by-category`);

            const [summaryRes, spendingRes] = await Promise.all([
                firstValueFrom(summaryReq),
                firstValueFrom(spendingReq)
            ]);

            this._summary.set(summaryRes.value);
            this._spending.set(spendingRes.value || []);

        } catch (err) {
            console.error('Failed to load dashboard state', err);
        } finally {
            this._isLoading.set(false);
        }
    }

    refresh() {
        return this.load();
    }
}
