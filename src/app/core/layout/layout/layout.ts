import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { Auth, UserDetails } from '../../services/auth';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { environment } from '../../../../environments/environment';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover'; 


@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, DrawerModule, ButtonModule, MenuModule, AvatarModule, PopoverModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})

export class Layout implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  sidebarVisible = false;
  appVersion: string | undefined;
   userDetails: UserDetails | null = null;
  userInitials: string = '';
  sessionExpires: string | null = null;
  navItems: MenuItem[];

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
          {
            label: 'Toggle Dark Mode', icon: 'pi pi-sun', command: () => { this.toggleDarkMode(); this.sidebarVisible = false; }
          }
        ]
      }
    ];
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(details => {
      this.userDetails = details;
      if (details) {
        // Create initials from the name
        this.userInitials = details.name.substring(0, 2).toUpperCase();
        // Format the expiry date from the UNIX timestamp
        const expiryDate = new Date(details.exp * 1000); // exp is in seconds
        this.sessionExpires = expiryDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      } else {
        this.userInitials = '';
        this.sessionExpires = null;
      }
    });
  }
  
  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.sidebarVisible = false;
  }
}
