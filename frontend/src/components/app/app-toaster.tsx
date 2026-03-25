import { Toaster } from "sonner";

import { useAppPreferences } from "@/hooks/useAppPreferences";

export const AppToaster = () => {
  const { preferences } = useAppPreferences();

  return (
    <Toaster
      position={preferences.language === "ar" ? "top-left" : "top-right"}
      richColors
      expand
      closeButton
      toastOptions={{
        duration: 3200,
        style: {
          borderRadius: "20px",
          border: "1px solid hsl(var(--border))",
          background: "hsla(var(--card), 0.94)",
          color: "hsl(var(--card-foreground))",
          backdropFilter: "blur(18px)",
          boxShadow: "0 20px 60px -30px hsl(var(--shadow-color) / 0.38)"
        }
      }}
      dir={preferences.language === "ar" ? "rtl" : "ltr"}
    />
  );
};
