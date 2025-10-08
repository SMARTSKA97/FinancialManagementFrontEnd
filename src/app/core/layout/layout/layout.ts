import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { Auth } from '../../services/auth';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { environment } from '../../../../environments/environment';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { Theme } from '../../services/theme';
import { map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';


@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, DrawerModule, ButtonModule, MenuModule, AvatarModule, PopoverModule,AsyncPipe],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})

export class Layout {
  public authService = inject(Auth);
  public themeService = inject(Theme); 
  private router = inject(Router);

  sidebarVisible = false;
  navItems: MenuItem[];
  appVersion: string;

  // Create an observable for the user's initials directly from the auth service
  userInitials$: Observable<string> = this.authService.currentUser$.pipe(
    map(name => name ? name.substring(0, 2).toUpperCase() : '')
  );


  constructor() {
    this.appVersion = environment.appVersion;
    this.navItems = [
      {
        label: 'Main',
        items: [
          { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard', command: () => { this.sidebarVisible = false; } },
          { label: 'Accounts', icon: 'pi pi-wallet', routerLink: '/accounts', command: () => { this.sidebarVisible = false; } },
        ],

      },
      {
        label: 'Settings',
        items: [
          { label: 'Account Categories', icon: 'pi pi-tags', routerLink: '/account-categories', disabled: true, command: () => { this.sidebarVisible = false; } },
          { label: 'Transaction Categories', icon: 'pi pi-tags', routerLink: '/transaction-categories', disabled: true, command: () => { this.sidebarVisible = false; } },
          // { label: 'Toggle Dark Mode', icon: 'pi pi-sun', command: () => { this.toggleDarkMode(); this.sidebarVisible = false; } },
          { label: 'Support', icon: 'pi pi-sun', routerLink: '/support', command: () => { this.sidebarVisible = false; } },

        ]
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
