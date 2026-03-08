import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Budget, UpsertBudgetRequest, BudgetProgress } from '../models/budget.model';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiBaseUrl}/budgets`;

    getAll(): Observable<Budget[]> {
        return this.http.get<Budget[]>(this.apiUrl);
    }

    getProgress(date?: string): Observable<BudgetProgress[]> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', date);
        }
        return this.http.get<BudgetProgress[]>(`${this.apiUrl}/progress`, { params });
    }

    upsert(request: UpsertBudgetRequest): Observable<Budget> {
        return this.http.post<Budget>(this.apiUrl, request);
    }

    update(id: number, request: UpsertBudgetRequest): Observable<Budget> {
        return this.http.put<Budget>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    }
}
