import { ChevronRight, LogOut01, Menu01, SearchLg, Settings01, XClose } from "@untitledui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { LanguagePill } from "@/components/app/language-pill";
import { BranchSelector } from "@/components/layout/BranchSelector";
import {
  getRouteMeta,
  getVisibleNavSections
} from "@/components/layout/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "tajerpro.sidebar.collapsed";
const CommandPalette = lazy(async () => ({
  default: (await import("@/components/app/command-palette")).CommandPalette
}));

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout, isAdmin, isSystemOwner } = useAuth();
  const { hasPermission } = usePermission();
  const { preferences } = useAppPreferences();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "true";
    } catch {
      return false;
    }
  });

  const isRtl = preferences.language === "ar";
  const sections = useMemo(
    () =>
      getVisibleNavSections({
        isAdmin,
        isSystemOwner,
        hasPermission
      }),
    [hasPermission, isAdmin, isSystemOwner]
  );
  const route = getRouteMeta(location.pathname);
  const userInitials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const locale =
    preferences.language === "ar" && preferences.useArabicNumerals
      ? "ar-EG-u-nu-arab"
      : preferences.language === "ar"
        ? "ar-EG"
        : "en-US";
  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const sectionLabels: Record<string, string> = {
    workspace: t("layout.workspace"),
    manage: t("layout.management"),
    owner: t("layout.ownerSpace")
  };

  const sidebar = (
    <aside
      className={cn(
        "glass-panel-dark hidden h-[calc(100vh-2rem)] shrink-0 overflow-hidden xl:sticky xl:top-4 xl:flex",
        collapsed ? "w-[96px]" : "w-[308px]"
      )}
      style={{
        backgroundImage: "var(--sidebar-image)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="flex h-full w-full flex-col bg-[linear-gradient(180deg,hsl(var(--sidebar-background)/0.88),hsl(var(--sidebar-background)/0.76))] backdrop-blur-xl">
        <div className="border-b border-[hsl(var(--sidebar-border)/0.65)] px-4 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] text-lg font-black text-white shadow-soft"
              style={{
                backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
              }}
            >
              TP
            </div>
            {!collapsed ? (
              <div>
                <p className="font-display text-xl font-black text-[hsl(var(--sidebar-foreground))]">{t("common.appName")}</p>
                <p className="text-sm text-[hsl(var(--sidebar-foreground)/0.68)]">{t("layout.workspace")}</p>
              </div>
            ) : null}
          </div>

          <Button
            variant="glass"
            className={cn(
              "mt-4 w-full justify-center border-[hsl(var(--sidebar-border)/0.65)] bg-[hsl(var(--sidebar-foreground)/0.08)] text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-foreground)/0.14)]",
              collapsed && "px-0"
            )}
            onClick={() => setCollapsed((current) => !current)}
          >
            <Menu01 className="size-4" />
            {!collapsed ? t("layout.quickActions") : null}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.key} className="space-y-2">
                {!collapsed ? (
                  <p className="px-3 text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--sidebar-foreground)/0.45)]">
                    {sectionLabels[section.key] ?? section.key}
                  </p>
                ) : null}

                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center rounded-[1.35rem] px-3 py-3 text-sm font-medium transition",
                        collapsed ? "justify-center" : "gap-3",
                        isActive
                          ? "bg-[hsl(var(--sidebar-foreground)/0.14)] text-[hsl(var(--sidebar-foreground))] shadow-soft"
                          : "text-[hsl(var(--sidebar-foreground)/0.72)] hover:bg-[hsl(var(--sidebar-foreground)/0.08)] hover:text-[hsl(var(--sidebar-foreground))]"
                      )
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition",
                            isActive
                              ? "bg-[hsl(var(--sidebar-foreground)/0.14)]"
                              : "bg-[hsl(var(--sidebar-foreground)/0.07)] group-hover:bg-[hsl(var(--sidebar-foreground)/0.1)]"
                          )}
                        >
                          <item.icon className="size-5" />
                        </span>
                        {!collapsed ? (
                          <>
                            <span className="flex-1">{t(`nav.${item.key}`)}</span>
                            <ChevronRight
                              className={cn(
                                "size-4 transition",
                                isRtl && "rotate-180",
                                isActive ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                              )}
                            />
                          </>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-[hsl(var(--sidebar-border)/0.65)] p-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-[1.4rem] bg-[hsl(var(--sidebar-foreground)/0.06)] p-3",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-12 w-12 border-[hsl(var(--sidebar-border)/0.55)] bg-[hsl(var(--sidebar-foreground)/0.08)]">
              {preferences.avatarImage ? (
                <AvatarImage src={preferences.avatarImage} alt={user?.name} />
              ) : (
                <AvatarFallback className="bg-[hsl(var(--sidebar-foreground)/0.08)] text-[hsl(var(--sidebar-foreground))]">
                  {userInitials || "TP"}
                </AvatarFallback>
              )}
            </Avatar>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate font-semibold text-[hsl(var(--sidebar-foreground))]">{user?.name}</p>
                <p className="truncate text-xs text-[hsl(var(--sidebar-foreground)/0.65)]">
                  {t(`roles.${user?.role}`)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="app-shell">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-3 p-3 sm:gap-4 sm:p-4 xl:flex-row">
        {sidebar}

        <div className="relative flex min-w-0 flex-1 flex-col gap-4">
          <header className="glass-panel sticky top-2 z-20 flex flex-col gap-4 px-4 py-4 sm:top-4 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="glass"
                  size="icon"
                  className="xl:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu01 className="size-4" />
                </Button>
                <div className="min-w-0">
                  <p className="section-caption">{t("layout.workspace")}</p>
                  <h2 className="truncate text-2xl font-black">
                    {t(`nav.${route.navKey}`)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t(route.descriptionKey)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="glass"
                  leftIcon={<SearchLg className="size-4" />}
                  onClick={() => setCommandOpen(true)}
                  className="hidden md:inline-flex"
                >
                  {t("layout.openPalette")}
                </Button>
                <LanguagePill />
                <Badge variant="outline" className="hidden rounded-2xl px-3 py-2 text-foreground sm:inline-flex">
                  {timeLabel}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <BranchSelector />
              <DropdownMenu>
                <DropdownMenuTrigger className="frost-card flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 sm:w-auto">
                  <Avatar className="h-11 w-11">
                    {preferences.avatarImage ? (
                      <AvatarImage src={preferences.avatarImage} alt={user?.name} />
                    ) : (
                      <AvatarFallback>{userInitials || "TP"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden text-start sm:block">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{t(`roles.${user?.role}`)}</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings01 className="size-4" />
                    {t("nav.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut01 className="size-4" />
                    {t("layout.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-h-[calc(100vh-9rem)]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-40 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: isRtl ? 32 : -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isRtl ? 32 : -32, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "absolute top-4 h-[calc(100vh-2rem)] w-[88vw] max-w-[320px]",
                isRtl ? "right-4" : "left-4"
              )}
            >
              <div className="glass-panel-dark flex h-full flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-[hsl(var(--sidebar-border)/0.65)] px-4 py-4">
                  <div>
                    <p className="font-display text-xl font-black text-[hsl(var(--sidebar-foreground))]">{t("common.appName")}</p>
                    <p className="text-sm text-[hsl(var(--sidebar-foreground)/0.65)]">{t("layout.workspace")}</p>
                  </div>
                  <Button
                    variant="glass"
                    size="icon"
                    className="border-[hsl(var(--sidebar-border)/0.65)] bg-[hsl(var(--sidebar-foreground)/0.08)] text-[hsl(var(--sidebar-foreground))]"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <XClose className="size-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-3 py-4">
                  <div className="space-y-6">
                    {sections.map((section) => (
                      <div key={section.key} className="space-y-2">
                        <p className="px-3 text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--sidebar-foreground)/0.45)]">
                          {sectionLabels[section.key] ?? section.key}
                        </p>
                        {section.items.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 rounded-[1.35rem] px-3 py-3 text-sm font-medium transition",
                                isActive
                                  ? "bg-[hsl(var(--sidebar-foreground)/0.14)] text-[hsl(var(--sidebar-foreground))] shadow-soft"
                                  : "text-[hsl(var(--sidebar-foreground)/0.72)] hover:bg-[hsl(var(--sidebar-foreground)/0.08)] hover:text-[hsl(var(--sidebar-foreground))]"
                              )
                            }
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--sidebar-foreground)/0.08)]">
                              <item.icon className="size-5" />
                            </span>
                            <span>{t(`nav.${item.key}`)}</span>
                          </NavLink>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {commandOpen ? (
        <Suspense fallback={null}>
          <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
};
