import { create } from 'zustand';
import type { AppMode } from './roles';

/**
 * UI-17 / US-01-009: which interface a CAREGIVER account is using. Only changes the UI, never permissions (the
 * gateway and services decide by JWT roles). Kept in memory only (no browser storage – R-17). NM-0295.
 */
type ModeState = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

export const useModeStore = create<ModeState>((set) => ({
  mode: 'customer',
  setMode: (mode) => set({ mode }),
}));
