import { Shift } from '../types/shift.types';

const STORAGE_KEY = 'kasserpro_active_shift';
const SAVE_INTERVAL_MS = 60 * 1000; // Save every minute

interface PersistedShift {
  shift: Shift;
  savedAt: string;
}

export class ShiftPersistence {
  private saveInterval: NodeJS.Timeout | null = null;

  /**
   * Start auto-saving shift state every minute
   */
  startAutoSave(getShift: () => Shift | null) {
    this.stopAutoSave();

    this.saveInterval = setInterval(() => {
      const shift = getShift();
      if (shift && !shift.isClosed) {
        this.save(shift);
      }
    }, SAVE_INTERVAL_MS);
  }

  /**
   * Stop auto-saving
   */
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  /**
   * Save shift to localStorage
   */
  save(shift: Shift) {
    try {
      const data: PersistedShift = {
        shift,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save shift to localStorage:', error);
    }
  }

  /**
   * Load shift from localStorage
   */
  load(): PersistedShift | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const parsed: PersistedShift = JSON.parse(data);
      
      // Validate data
      if (!parsed.shift || !parsed.savedAt) return null;
      
      // Check if shift is still open
      if (parsed.shift.isClosed) {
        this.clear();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load shift from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear saved shift
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear shift from localStorage:', error);
    }
  }

  /**
   * Check if there's a saved shift
   */
  hasSavedShift(): boolean {
    return this.load() !== null;
  }

  /**
   * Get time since last save
   */
  getTimeSinceLastSave(): number | null {
    const data = this.load();
    if (!data) return null;

    const savedAt = new Date(data.savedAt);
    const now = new Date();
    return now.getTime() - savedAt.getTime();
  }
}

// Singleton instance
export const shiftPersistence = new ShiftPersistence();
