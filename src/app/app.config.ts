import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXsrfConfiguration, HttpClient } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { statusInterceptor } from './core/interceptors/status-interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Auth } from './core/services/auth';
import { firstValueFrom } from 'rxjs';

import { SessionSyncService } from './core/services/session-sync.service';
import { IdleTimerService } from './core/services/idle-timer.service';
import { environment } from '../environments/environment';
import { from, of, switchMap } from 'rxjs';
import { BackendStatusService } from './core/services/backend-status.service';

function initializeApp(
  auth: Auth,
  sessionSync: SessionSyncService,
  http: HttpClient,
  idleTimer: IdleTimerService,
  backendStatus: BackendStatusService
) {
  return () => from(backendStatus.ensureBackendReady()).pipe(
    switchMap(() => sessionSync.checkLockState().pipe(
      switchMap(isLocked => {
        if (isLocked) {
          return of(true); // Skip session restore if locked
        }

        // Restore session if available
        return auth.restoreSession().pipe(
          switchMap(sessionRestored => {
            // Fetch CSRF token on app startup
            const csrfUrl = `${environment.apiBaseUrl}/antiforgery/token`;
            http.get(csrfUrl).subscribe({
              next: () => { },
              error: (err) => { }
            });

            // Start idle timer if user is authenticated
            if (sessionRestored && auth.isLoggedIn()) {
              idleTimer.startMonitoring();
            }

            return of(true);
          })
        );
      })
    ))
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, statusInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    provideAnimationsAsync(),
    MessageService,
    DialogService,
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [Auth, SessionSyncService, HttpClient, IdleTimerService, BackendStatusService],
      multi: true
    }
  ]
};
