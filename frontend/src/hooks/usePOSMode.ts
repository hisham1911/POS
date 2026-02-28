import { useState, useEffect } from 'react';

type POSMode = 'standard' | 'compact' | 'touch';

export function usePOSMode() {
  const [mode, setModeState] = useState<POSMode>(() => {
    const saved = localStorage.getItem('pos-mode');
    return (saved as POSMode) || 'standard';
  });

  const setMode = (newMode: POSMode) => {
    setModeState(newMode);
    localStorage.setItem('pos-mode', newMode);
  };

  useEffect(() => {
    localStorage.setItem('pos-mode', mode);
  }, [mode]);

  return { mode, setMode };
}
