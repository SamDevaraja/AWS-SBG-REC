/**
 * Auth Service Compatibility Shim for Roadmap Module
 * Provides logout functionality compatible with the ported roadmap UI components.
 */
export const authService = {
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('aws_sgb_rec_user');
    }
  },
};
