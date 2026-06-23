/**
 * Auth Service Compatibility Shim for Roadmap Module
 * Provides logout functionality compatible with the ported roadmap UI components.
 */
export const authService = {
  logout: (askConfirmation: boolean = false): boolean => {
    if (typeof window !== 'undefined') {
      if (!askConfirmation || window.confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('aws_sgb_rec_user');
        return true;
      }
    }
    return false;
  },
};

