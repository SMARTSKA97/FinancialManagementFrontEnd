import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const token = authService.getAccessToken();
    if (token) {
      const decodedToken: any = JSON.parse(atob(token.split('.')[1]));
      const expiry = decodedToken.exp * 1000;
      if (expiry > Date.now()) {
        return true; // Token exists and is not expired, allow access
      }
    }
  }

  // Ensure this correctly navigates to the login page
  authService.logout();
  router.navigate(['/login']);
  return false;
};
