import { Eye, EyeOff, LogIn01, Mail01, ShieldTick, Stars02, Translate01, Zap } from "@untitledui/icons";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguagePill } from "@/components/app/language-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1460px] flex-col gap-5 lg:flex-row lg:items-stretch">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-panel relative flex flex-1 flex-col justify-between overflow-hidden px-6 py-7 sm:px-8 lg:px-12"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-caption">{t("login.eyebrow")}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-secondary via-primary to-accent text-xl font-black text-white shadow-card">
                  TP
                </div>
                <div>
                  <p className="font-display text-2xl font-black">{t("common.appName")}</p>
                  <p className="text-sm text-muted-foreground">{t("dashboard.heroEyebrow")}</p>
                </div>
              </div>
            </div>

            <LanguagePill />
          </div>

          <div className="relative z-10 my-10 max-w-2xl">
            <h1 className="text-balance text-foreground">{t("login.title")}</h1>
            <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              {t("login.subtitle")}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { icon: Zap, label: t("login.highlightsSpeed") },
                { icon: Stars02, label: t("login.highlightsTheme") },
                { icon: Translate01, label: t("login.highlightsRtl") }
              ].map((item) => (
                <div key={item.label} className="surface-outline rounded-[calc(var(--radius)+0.05rem)] p-4">
                  <div className="inline-flex rounded-2xl bg-primary/12 p-2 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-outline max-w-xl rounded-[calc(var(--radius)+0.15rem)] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-secondary/18 p-2 text-secondary-foreground">
                <ShieldTick className="size-5" />
              </div>
              <p className="text-sm text-muted-foreground">{t("login.quote")}</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="glass-panel relative w-full max-w-xl self-center px-6 py-7 sm:px-8 lg:max-w-[34rem] xl:min-w-[460px]"
        >
          <div className="space-y-2">
            <p className="section-caption">{t("common.appName")}</p>
            <h2 className="text-3xl font-black text-foreground">{t("login.submit")}</h2>
            <p className="text-sm text-muted-foreground">{t("layout.goodEvening")}</p>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              login({ email, password });
            }}
          >
            <div>
              <label className="mb-2 inline-flex text-sm font-semibold text-foreground">
                {t("login.emailLabel")}
              </label>
              <div className="relative">
                <Mail01 className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  className="ps-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 inline-flex text-sm font-semibold text-foreground">
                {t("login.passwordLabel")}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="pe-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="interactive-ring absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="xl"
              className="w-full"
              isLoading={isLoggingIn}
              rightIcon={<LogIn01 className="size-4" />}
            >
              {t("login.submit")}
            </Button>
          </form>

          {import.meta.env.DEV ? (
            <div className="surface-outline mt-6 rounded-[calc(var(--radius)+0.05rem)] p-4">
              <p className="font-semibold text-foreground">{t("login.credentials")}</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">{t("login.admin")}:</span>{" "}
                  admin@kasserpro.com / Admin@123
                </p>
                <p>
                  <span className="font-semibold text-foreground">{t("login.cashier")}:</span>{" "}
                  ahmed@kasserpro.com / 123456
                </p>
              </div>
            </div>
          ) : null}
        </motion.section>
      </div>
    </div>
  );
}
