import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './core/services/theme';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SessionSyncService } from './core/services/session-sync.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, DialogModule, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private themeService = inject(Theme);
  private sessionSync = inject(SessionSyncService);
  protected readonly title = signal('Financial Management App');

  isSessionLocked = signal(false);

  constructor() {
    this.sessionSync.state$.subscribe(state => {
      this.isSessionLocked.set(state === 'locked');
    });
  }

  takeOverSession() {
    this.sessionSync.takeOver();
    this.isSessionLocked.set(false);
  }

  closeTab() {
    window.close();
    // Fallback if window.close() is blocked
    window.location.href = 'about:blank';
  }
}
