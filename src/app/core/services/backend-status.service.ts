import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, firstValueFrom, of, tap, timeout } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BackendStatusService {
    private http = inject(HttpClient);
    private readonly healthUrl = `${environment.apiBaseUrl}/health/version`;

    isReady = signal(false);
    isWakingUp = signal(false);
    isFailed = signal(false);
    lastError = signal<string | null>(null);

    /**
     * Pings the backend to ensure it's awake.
     * If the backend is on Render's free tier, this might take 30+ seconds.
     */
    async ensureBackendReady(): Promise<boolean> {
        if (this.isReady()) return true;

        this.isWakingUp.set(true);
        const maxRetries = 15; // Total wait approx 45-60 seconds
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                attempts++;

                await firstValueFrom(
                    this.http.get(this.healthUrl).pipe(
                        timeout(5000) // 5s timeout for each ping
                    )
                );

                this.isReady.set(true);
                this.isWakingUp.set(false);
                return true;
            } catch (err) {

                // Wait 3 seconds before next retry
                if (attempts < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }

        this.isWakingUp.set(false);
        this.isFailed.set(true);
        this.lastError.set('Backend server is not responding. Please ensure the server is running and try again.');
        return false;
    }

    retry() {
        this.isFailed.set(false);
        this.isWakingUp.set(true);
        this.ensureBackendReady();
    }
}
