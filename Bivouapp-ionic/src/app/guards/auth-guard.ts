import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../environment/environment';

export const authGuard: CanActivateFn = async (route, state) => {
  if (environment.bypassAuth) return true; // ← dev mode

  const authService = inject(AuthService);
  const router = inject(Router);
  const session = await authService.getSession();
  return session ? true : router.createUrlTree(['/sign-in']);
};
