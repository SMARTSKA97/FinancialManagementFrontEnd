import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

type TabMessage = 'PING' | 'PONG' | 'TAKE_OVER';

@Injectable({
    providedIn: 'root'
})
export class SessionSyncService implements OnDestroy {
    private channel: BroadcastChannel | null = null;
    private isBrowser: boolean;

    // State: 'checking' (initial), 'active' (I own the session), 'locked' (someone else owns it)
    private stateSubject = new BehaviorSubject<'checking' | 'active' | 'locked'>('checking');
    public state$ = this.stateSubject.asObservable();

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        if (this.isBrowser) {
            this.channel = new BroadcastChannel('app_session_sync');
            this.channel.onmessage = (event) => this.handleMessage(event.data);
        } else {
            this.stateSubject.next('active'); // Server-side is always active
        }
    }

    public checkLockState(): Observable<boolean> {
        if (!this.isBrowser) return of(false);

        // Send PING to ask if anyone is out there
        this.channel?.postMessage('PING');

        // Wait 500ms for a PONG
        return of(true).pipe(
            delay(500),
            map(() => {
                if (this.stateSubject.value === 'checking') {
                    // No PONG received, we are active
                    this.stateSubject.next('active');
                    return false; // Not locked
                }
                return this.stateSubject.value === 'locked';
            })
        );
    }

    public get isLocked(): boolean {
        return this.stateSubject.value === 'locked';
    }

    private handleMessage(msg: TabMessage) {
        const currentState = this.stateSubject.value;

        switch (msg) {
            case 'PING':
                if (currentState === 'active') {
                    // Someone else opened a tab. Tell them we are here.
                    this.channel?.postMessage('PONG');
                }
                break;

            case 'PONG':
                if (currentState === 'checking') {
                    // Someone else is already active. We must lock.
                    this.stateSubject.next('locked');
                }
                break;

            case 'TAKE_OVER':
                if (currentState === 'active') {
                    // The new tab is taking over. We must yield.
                    this.stateSubject.next('locked');
                    // Close this tab as per policy
                    window.close();
                    // Fallback if close is blocked
                    window.location.href = 'about:blank';
                }
                break;
        }
    }

    public takeOver() {
        this.stateSubject.next('active');
        this.channel?.postMessage('TAKE_OVER');
    }

    ngOnDestroy() {
        this.channel?.close();
    }
}
