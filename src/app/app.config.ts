import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXsrfConfiguration, HttpClient } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
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
import { of, switchMap } from 'rxjs';

function initializeApp(auth: Auth, sessionSync: SessionSyncService, http: HttpClient, idleTimer: IdleTimerService) {
  return () => sessionSync.checkLockState().pipe(
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
            next: () => { }, // console.log('[CSRF] Anti-forgery token fetched'),
            error: (err) => console.error('[CSRF] Failed to fetch token:', err)
          });

          // Start idle timer if user is authenticated
          if (sessionRestored && auth.isLoggedIn()) {
            idleTimer.startMonitoring();
            // console.log('[App] Idle timer started for authenticated user');
          }

          return of(true);
        })
      );
    })
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
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
      deps: [Auth, SessionSyncService, HttpClient, IdleTimerService],
      multi: true
    }
  ]
};
