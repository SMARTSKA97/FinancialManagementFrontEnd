import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // If the user is already logged in, redirect them away from public pages
    router.navigate(['/app/dashboard']);
    return false;
  }

  // If not logged in, allow access to the public page (login/register)
  return true;
};
