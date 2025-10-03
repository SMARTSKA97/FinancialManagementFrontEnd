import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, DrawerModule, ButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  private auth = inject(Auth);
  private router = inject(Router);
  sidebarVisible = false;
  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
    this.sidebarVisible = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.sidebarVisible = false;
  }

  navigateToAccounts() {
    this.router.navigate(['/accounts']);
    this.sidebarVisible = false;
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
    this.sidebarVisible = false;
  }
}
