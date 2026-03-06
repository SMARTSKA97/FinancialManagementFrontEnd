import { inject, Injectable, signal } from '@angular/core';
import { GenericApi } from '../services/generic-api';
import { firstValueFrom } from 'rxjs';
import { DashboardSummary, SpendingByCategory } from '../../features/dashboard/dashboard';
import { DashboardInsightsDto } from '../models/dashboard-insights';

@Injectable({
    providedIn: 'root'
})
export class DashboardState {
    private api = inject(GenericApi);
    private endpoint = 'Dashboard';

    // State
    private _summary = signal<DashboardSummary | null>(null);
    private _spending = signal<SpendingByCategory[]>([]);
    private _insights = signal<DashboardInsightsDto | null>(null);
    private _isLoading = signal<boolean>(false);

    // Global Filter Date (Defaults to current Month/Year)
    private _selectedDate = signal<Date>(new Date());

    // Public
    public summary = this._summary.asReadonly();
    public spending = this._spending.asReadonly();
    public insights = this._insights.asReadonly();
    public isLoading = this._isLoading.asReadonly();
    public selectedDate = this._selectedDate.asReadonly();

    constructor() {
        this.load();
    }

    async load(): Promise<void> {
        this._isLoading.set(true);
        try {
            // Calculate Start & End of the selected Month
            const current = this._selectedDate();
            const start = new Date(Date.UTC(current.getFullYear(), current.getMonth(), 1));
            const end = new Date(Date.UTC(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999));

            const params = `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;

            const summaryReq = this.api.get<DashboardSummary>(`${this.endpoint}/summary${params}`);
            const spendingReq = this.api.get<SpendingByCategory[]>(`${this.endpoint}/spending-by-category${params}`);
            const insightsReq = this.api.get<DashboardInsightsDto>(`${this.endpoint}/insights${params}`);

            const [summaryRes, spendingRes, insightsRes] = await Promise.all([
                firstValueFrom(summaryReq),
                firstValueFrom(spendingReq),
                firstValueFrom(insightsReq)
            ]);

            this._summary.set(summaryRes.value);
            this._spending.set(spendingRes.value || []);
            this._insights.set(insightsRes.value);

        } catch (err) {
            console.error('Failed to load dashboard state', err);
        } finally {
            this._isLoading.set(false);
        }
    }

    updateDate(newDate: Date) {
        this._selectedDate.set(newDate);
        this.load();
    }

    refresh() {
        return this.load();
    }
}
