import { create } from 'zustand';

/**
 * Client-side auth UI state only (NM-0295): e.g. show "phiên đã hết hạn" after a 401. It never holds a token (R-08);
 * the identity itself comes from useSession().
 */
type AuthState = {
  sessionExpired: boolean;
  markSessionExpired: () => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  sessionExpired: false,
  markSessionExpired: () => set({ sessionExpired: true }),
  reset: () => set({ sessionExpired: false }),
}));
