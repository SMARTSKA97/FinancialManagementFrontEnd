import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BackendStatusService } from '../services/backend-status.service';
import { finalize, tap, timer } from 'rxjs';

/**
 * Interceptor that tracks if the backend is taking too long to respond.
 * If a request takes more than 2 seconds, we assume the backend might be
 * spinning up or under heavy load, and we update the status accordingly.
 */
export const statusInterceptor: HttpInterceptorFn = (req, next) => {
    const backendStatus = inject(BackendStatusService);

    // Skip status check for health check itself to avoid recursion or noise
    if (req.url.includes('/health/version')) {
        return next(req);
    }

    // Start a timer that sets isWakingUp to true after 2 seconds of inactivity
    const loadingTimer = timer(2000).subscribe(() => {
        if (!backendStatus.isReady()) {
            // Only set if we haven't already marked it as ready today
            // Actually, Render spins down after 15 mins, so we should allow it to toggle back.
        }
        backendStatus.isWakingUp.set(true);
    });

    return next(req).pipe(
        tap((event) => {
            if (event instanceof HttpResponse) {
                backendStatus.isReady.set(true);
                backendStatus.isWakingUp.set(false);
            }
        }),
        finalize(() => {
            loadingTimer.unsubscribe();
        })
    );
};
