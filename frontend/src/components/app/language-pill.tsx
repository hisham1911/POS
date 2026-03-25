import { motion } from "framer-motion";

import { useAppPreferences } from "@/hooks/useAppPreferences";

export const LanguagePill = () => {
  const { preferences, setLanguage } = useAppPreferences();

  return (
    <div className="floating-pill">
      {[
        { id: "en", label: "EN" },
        { id: "ar", label: "عر" }
      ].map((option) => {
        const active = preferences.language === option.id;

        return (
          <motion.button
            key={option.id}
            type="button"
            layout
            onClick={() => setLanguage(option.id as "en" | "ar")}
            className={active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
};
