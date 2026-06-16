/**
 * Authentication Helper for Roadmap module
 * Maps local frontend session state to compatibility layer expected by ported UI components.
 *
 * NOTE: We only check `aws_sgb_rec_user` (same as AuthWrapper.getSession) so that
 * both guards are consistent. Checking `accessToken` separately caused an
 * infinite redirect loop: AuthWrapper admitted the user but this helper did not.
 */
export const getAuthSession = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, role: null, user: null };
  }

  const userStr = localStorage.getItem('aws_sgb_rec_user');

  if (!userStr) {
    return { isAuthenticated: false, role: null, user: null };
  }

  try {
    const user = JSON.parse(userStr);
    // Normalize role: keep 'enthusiasts' as-is so LayoutShell selector works,
    // but also expose 'enthusiast' (without s) for legacy UI checks.
    const rawRole: string = (user.role ?? 'enthusiasts').toLowerCase().trim();
    return {
      isAuthenticated: true,
      role: rawRole,          // e.g. 'core' | 'crew' | 'enthusiasts'
      user,
    };
  } catch {
    return { isAuthenticated: false, role: null, user: null };
  }
};
