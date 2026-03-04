import { useState, useEffect } from "react";

export type POSMode = "cashier" | "standard";

const POS_MODE_KEY = "pos_mode";

export const usePOSMode = () => {
  const [mode, setModeState] = useState<POSMode>(() => {
    const saved = localStorage.getItem(POS_MODE_KEY);
    return (saved as POSMode) || "cashier";
  });

  const setMode = (newMode: POSMode) => {
    setModeState(newMode);
    localStorage.setItem(POS_MODE_KEY, newMode);
  };

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === POS_MODE_KEY && e.newValue) {
        setModeState(e.newValue as POSMode);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { mode, setMode };
};
