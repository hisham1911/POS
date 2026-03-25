import { ChevronRight, LogOut01, Menu01, SearchLg, Settings01, XClose } from "@untitledui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { CommandPalette } from "@/components/app/command-palette";
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

  const sidebar = (
    <aside
      className={cn(
        "glass-panel-dark hidden h-[calc(100vh-2rem)] shrink-0 overflow-hidden border border-white/10 text-white xl:flex",
        collapsed ? "w-[96px]" : "w-[308px]"
      )}
      style={{
        backgroundImage: "var(--sidebar-image)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="flex h-full w-full flex-col bg-slate-950/55 backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-secondary via-primary to-accent text-lg font-black text-white shadow-soft">
              TP
            </div>
            {!collapsed ? (
              <div>
                <p className="font-display text-xl font-black">{t("common.appName")}</p>
                <p className="text-sm text-white/70">{t("layout.workspace")}</p>
              </div>
            ) : null}
          </div>

          <Button
            variant="glass"
            className={cn("mt-4 w-full justify-center bg-white/10 text-white hover:bg-white/15", collapsed && "px-0")}
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
                  <p className="px-3 text-[11px] uppercase tracking-[0.28em] text-white/45">
                    {section.key === "workspace"
                      ? t("layout.workspace")
                      : section.key === "manage"
                        ? t("common.appearance")
                        : t("roles.SystemOwner")}
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
                          ? "bg-white/18 text-white shadow-soft"
                          : "text-white/72 hover:bg-white/10 hover:text-white"
                      )
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition",
                            isActive ? "bg-white/16" : "bg-white/8 group-hover:bg-white/12"
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
                                isActive ? "translate-x-0 opacity-100 rtl:-translate-x-0" : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 rtl:-translate-x-1 rtl:group-hover:-translate-x-0"
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

        <div className="border-t border-white/10 p-4">
          <div className={cn("flex items-center gap-3 rounded-[1.4rem] bg-white/8 p-3", collapsed && "justify-center")}>
            <Avatar className="h-12 w-12 border-white/15 bg-white/10">
              {preferences.avatarImage ? (
                <AvatarImage src={preferences.avatarImage} alt={user?.name} />
              ) : (
                <AvatarFallback className="bg-white/10 text-white">
                  {userInitials || "TP"}
                </AvatarFallback>
              )}
            </Avatar>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user?.name}</p>
                <p className="truncate text-xs text-white/65">
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
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 scale-105 blur-xl"
          style={{
            backgroundImage: "var(--wallpaper-image)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      </div>

      <div className={cn("mx-auto flex min-h-screen max-w-[1600px] gap-4 p-4", isRtl ? "xl:flex-row-reverse" : "xl:flex-row")}>
        {sidebar}

        <div className="relative flex min-w-0 flex-1 flex-col gap-4">
          <header className="glass-panel sticky top-4 z-20 flex flex-col gap-4 px-4 py-4 sm:px-5">
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
                <Badge variant="outline" className="rounded-2xl bg-white/70 px-3 py-2 text-foreground">
                  {timeLabel}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <BranchSelector />
              <DropdownMenu>
                <DropdownMenuTrigger className="frost-card flex items-center gap-3 rounded-[1.35rem] px-3 py-2">
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
              initial={{ x: isRtl ? -32 : 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isRtl ? -32 : 32, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "absolute top-4 h-[calc(100vh-2rem)] w-[88vw] max-w-[320px]",
                isRtl ? "left-4" : "right-4"
              )}
            >
              <div className="glass-panel-dark flex h-full flex-col overflow-hidden text-white">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <div>
                    <p className="font-display text-xl font-black">{t("common.appName")}</p>
                    <p className="text-sm text-white/65">{t("layout.workspace")}</p>
                  </div>
                  <Button
                    variant="glass"
                    size="icon"
                    className="bg-white/10 text-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <XClose className="size-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-3 py-4">
                  <div className="space-y-6">
                    {sections.map((section) => (
                      <div key={section.key} className="space-y-2">
                        <p className="px-3 text-[11px] uppercase tracking-[0.28em] text-white/45">
                          {section.key === "workspace"
                            ? t("layout.workspace")
                            : section.key === "manage"
                              ? t("common.appearance")
                              : t("roles.SystemOwner")}
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
                                  ? "bg-white/18 text-white shadow-soft"
                                  : "text-white/72 hover:bg-white/10 hover:text-white"
                              )
                            }
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
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

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
};
