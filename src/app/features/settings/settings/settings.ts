import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Theme } from '../../../core/services/theme';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, RouterLink, CardModule, InputTextModule, ButtonModule, ToggleButtonModule],
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
    console.log('Save profile:', this.profile);
  }

  logout() {
    this.authService.logout();
  }
}
