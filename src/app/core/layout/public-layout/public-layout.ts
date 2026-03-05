import { Component, computed, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { Theme } from '../../services/theme';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss'
})
export class PublicLayout {
  public authService = inject(Auth);
  public themeService = inject(Theme);

  // Compute if user is logged in
  isLoggedIn = computed(() => {
    return !!this.authService.currentUser();
  });
}
