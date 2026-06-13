/**
 * RBAC Role definitions for the EventRegistration platform.
 * Three roles are supported:
 *  - core       → Admins / organizers → redirected to /core/dashboard
 *  - crew       → Volunteers / helpers → redirected to /crew/dashboard
 *  - enthusiasts → Regular attendees  → redirected to /events
 */
export type RoleName = 'core' | 'crew' | 'enthusiasts';

export const CORE_ROLES: RoleName[] = ['core'];
export const CREW_ROLES: RoleName[] = ['crew'];
export const ENTHUSIAST_ROLES: RoleName[] = ['enthusiasts'];

/** Returns the default redirect path for a given role */
export function getRoleRedirect(role: RoleName): string {
  switch (role) {
    case 'core':
      return '/core/dashboard';
    case 'crew':
      return '/crew/dashboard';
    case 'enthusiasts':
    default:
      return '/events';
  }
}
