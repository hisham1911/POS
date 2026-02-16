import { useEffect, useState, useCallback } from 'react';
import { useUpdateShiftActivityMutation } from '../api/shiftsApi';
import { Shift } from '../types/shift.types';

interface InactivityMonitorOptions {
  shift: Shift | null;
  enabled: boolean;
  onInactivityAlert: () => void;
}

const INACTIVITY_THRESHOLD_HOURS = 12;
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
const SNOOZE_DURATION_HOURS = 1;

export function useInactivityMonitor({
  shift,
  enabled,
  onInactivityAlert,
}: InactivityMonitorOptions) {
  const [snoozedUntil, setSnoozedUntil] = useState<Date | null>(null);
  const [updateActivity] = useUpdateShiftActivityMutation();

  const checkInactivity = useCallback(() => {
    if (!shift || !enabled || shift.isClosed) return;

    // Check if snoozed
    if (snoozedUntil && new Date() < snoozedUntil) {
      return;
    }

    // Check inactivity hours
    if (shift.inactiveHours >= INACTIVITY_THRESHOLD_HOURS) {
      onInactivityAlert();
    }
  }, [shift, enabled, snoozedUntil, onInactivityAlert]);

  // Check inactivity every minute
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(checkInactivity, CHECK_INTERVAL_MS);
    
    // Check immediately on mount
    checkInactivity();

    return () => clearInterval(interval);
  }, [enabled, checkInactivity]);

  // Update activity on user actions
  const recordActivity = useCallback(async () => {
    if (!shift || shift.isClosed) return;

    try {
      await updateActivity(shift.id);
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }, [shift, updateActivity]);

  // Snooze alert for 1 hour
  const snooze = useCallback(() => {
    const snoozeTime = new Date();
    snoozeTime.setHours(snoozeTime.getHours() + SNOOZE_DURATION_HOURS);
    setSnoozedUntil(snoozeTime);
  }, []);

  return {
    recordActivity,
    snooze,
    inactiveHours: shift?.inactiveHours || 0,
    isInactive: (shift?.inactiveHours || 0) >= INACTIVITY_THRESHOLD_HOURS,
  };
}
