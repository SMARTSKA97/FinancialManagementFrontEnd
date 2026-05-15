import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue, CreateIssueDto } from '../models/issue.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class IssueService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/issues`;

    getIssues(status?: string, sort: string = 'pain'): Observable<Issue[]> {
        let params = new HttpParams().set('sort', sort);
        if (status) params = params.set('status', status);
        return this.http.get<Issue[]>(this.apiUrl, { params });
    }

    checkSimilar(title: string, description: string): Observable<Issue[]> {
        return this.http.post<Issue[]>(`${this.apiUrl}/check-similar`, { title, description });
    }

    createIssue(issue: CreateIssueDto): Observable<number> {
        return this.http.post<number>(this.apiUrl, issue);
    }

    seedTaxonomy(): Observable<any> {
        return this.http.post(`${this.apiUrl}/seed`, {});
    }

    getTaxonomies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/taxonomy`);
    }
}
