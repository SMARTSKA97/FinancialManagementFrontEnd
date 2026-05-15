import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Theme } from '../../../core/services/theme';
import { Auth } from '../../../core/services/auth';
import { sharedPrimeModules } from '../../../shared/prime-imports';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, RouterLink, ...sharedPrimeModules],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  private themeService = inject(Theme);
  private authService = inject(Auth);
  private isBrowser: boolean;

  isDarkMode: boolean;
  isCompact: boolean;

  profile = {
    name: '',
    email: ''
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
    this.isCompact = this.isBrowser ? localStorage.getItem('compactView') === 'true' : false;

    const name = this.authService.currentUser();
    const email = this.authService.currentUserEmail();
    if (name) this.profile.name = name;
    if (email) this.profile.email = email;

    // Apply compact class on init if needed
    if (this.isBrowser && this.isCompact) {
      document.body.classList.add('compact-view');
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleCompact() {
    if (!this.isBrowser) return;
    if (this.isCompact) {
      document.body.classList.add('compact-view');
      localStorage.setItem('compactView', 'true');
    } else {
      document.body.classList.remove('compact-view');
      localStorage.setItem('compactView', 'false');
    }
  }

  saveProfile() {
  }

  logout() {
    this.authService.logout();
  }
}
