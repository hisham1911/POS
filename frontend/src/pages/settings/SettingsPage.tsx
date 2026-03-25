import { Building05, CheckCircle, Printer, Settings01, Sliders04 } from "@untitledui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  useGetCurrentTenantQuery,
  useUpdateCurrentTenantMutation,
  useUploadLogoMutation
} from "@/api/branchesApi";
import { useGetSystemInfoQuery, useHealthQuery } from "@/api/systemApi";
import { ImageUploadField } from "@/components/app/image-upload-field";
import { LanguagePill } from "@/components/app/language-pill";
import { wallpaperPresets } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsPanels, TabsTrigger } from "@/components/ui/tabs";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { usePOSMode } from "@/hooks/usePOSMode";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { setTaxSettings } from "@/store/slices/cartSlice";
import type { UpdateTenantRequest } from "@/types/tenant.types";
import { toast } from "sonner";

const settingsSchema = z.object({
  name: z.string().min(2),
  nameEn: z.string().optional(),
  currency: z.string().min(2),
  timezone: z.string().min(2),
  taxRate: z.coerce.number().min(0).max(100),
  isTaxEnabled: z.boolean(),
  allowNegativeStock: z.boolean(),
  receiptPaperSize: z.string(),
  receiptCustomWidth: z.coerce.number().min(180).max(420),
  receiptShowBranchName: z.boolean(),
  receiptShowCashier: z.boolean(),
  receiptShowCustomerName: z.boolean(),
  receiptShowLogo: z.boolean(),
  receiptShowThankYou: z.boolean(),
  receiptFooterMessage: z.string().optional(),
  receiptPhoneNumber: z.string().optional(),
  printRoutingMode: z.enum(["BranchOnly", "BranchWithFallback", "AllDevices", "Disabled"]),
  autoPrintOnSale: z.boolean(),
  autoPrintOnDebtPayment: z.boolean(),
  autoPrintDailyReports: z.boolean(),
  logoUrl: z.string().optional()
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const themeCards = [
  { id: "light", labelKey: "settings.appearance.light", preview: "linear-gradient(145deg, #f8fafc 0%, #ffffff 42%, #eef5ff 100%)" },
  { id: "dark", labelKey: "settings.appearance.dark", preview: "linear-gradient(145deg, #101827 0%, #182132 42%, #1f3454 100%)" },
  { id: "ocean", labelKey: "settings.appearance.ocean", preview: "linear-gradient(145deg, #eef8fb 0%, #e6f5f8 42%, #ebf2fb 100%)" },
  { id: "desert", labelKey: "settings.appearance.desert", preview: "linear-gradient(145deg, #fbf6ef 0%, #f4e6d8 42%, #eef0e7 100%)" },
  { id: "custom", labelKey: "settings.appearance.custom", preview: "linear-gradient(145deg, #e9f7f0 0%, #f9f2e4 42%, #edf4ff 100%)" }
] as const;

const wallpaperLabelMap: Record<string, string> = {
  "confetti-forest": "themes.confettiForest",
  "beach-glow": "themes.beachGlow",
  "midnight-splash": "themes.midnightSplash",
  oasis: "themes.oasis",
  "citrus-party": "themes.citrusParty",
  "desert-dusk": "themes.desertDusk",
  "berry-fizz": "themes.berryFizz",
  "minty-paper": "themes.mintyPaper",
  "violet-night": "themes.violetNight",
  "sunset-foam": "themes.sunsetFoam"
};

export default function SettingsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { preferences, setTheme, setWallpaperPreset, setCustomWallpaper, setSidebarImage, setAvatarImage, setUseArabicNumerals, updateCustomTheme } =
    useAppPreferences();
  const { mode, setMode } = usePOSMode();
  const { data: tenantData } = useGetCurrentTenantQuery();
  const { data: systemData } = useGetSystemInfoQuery();
  const { data: healthData, isError: healthError } = useHealthQuery();
  const [updateTenant, { isLoading: isSaving }] = useUpdateCurrentTenantMutation();
  const [uploadLogo] = useUploadLogoMutation();
  const [activeTab, setActiveTab] = useState(0);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      currency: "EGP",
      timezone: "Africa/Cairo",
      taxRate: 14,
      isTaxEnabled: true,
      allowNegativeStock: false,
      receiptPaperSize: "80mm",
      receiptCustomWidth: 280,
      receiptShowBranchName: true,
      receiptShowCashier: true,
      receiptShowCustomerName: true,
      receiptShowLogo: true,
      receiptShowThankYou: true,
      receiptFooterMessage: "",
      receiptPhoneNumber: "",
      printRoutingMode: "BranchWithFallback",
      autoPrintOnSale: true,
      autoPrintOnDebtPayment: true,
      autoPrintDailyReports: false,
      logoUrl: ""
    }
  });

  useEffect(() => {
    const tenant = tenantData?.data;
    if (!tenant) return;

    form.reset({
      name: tenant.name,
      nameEn: tenant.nameEn || "",
      currency: tenant.currency,
      timezone: tenant.timezone,
      taxRate: tenant.taxRate,
      isTaxEnabled: tenant.isTaxEnabled,
      allowNegativeStock: tenant.allowNegativeStock,
      receiptPaperSize: tenant.receiptPaperSize || "80mm",
      receiptCustomWidth: tenant.receiptCustomWidth ?? 280,
      receiptShowBranchName: tenant.receiptShowBranchName ?? true,
      receiptShowCashier: tenant.receiptShowCashier ?? true,
      receiptShowCustomerName: tenant.receiptShowCustomerName ?? true,
      receiptShowLogo: tenant.receiptShowLogo ?? true,
      receiptShowThankYou: tenant.receiptShowThankYou ?? true,
      receiptFooterMessage: tenant.receiptFooterMessage || "",
      receiptPhoneNumber: tenant.receiptPhoneNumber || "",
      printRoutingMode: tenant.printRoutingMode || "BranchWithFallback",
      autoPrintOnSale: tenant.autoPrintOnSale ?? true,
      autoPrintOnDebtPayment: tenant.autoPrintOnDebtPayment ?? true,
      autoPrintDailyReports: tenant.autoPrintDailyReports ?? false,
      logoUrl: tenant.logoUrl || ""
    });
  }, [form, tenantData]);

  const values = form.watch();
  const receiptWidth =
    values.receiptPaperSize === "80mm"
      ? 302
      : values.receiptPaperSize === "58mm"
        ? 219
        : values.receiptCustomWidth;

  const onSubmit = form.handleSubmit(async (data) => {
    const payload: UpdateTenantRequest = {
      name: data.name,
      currency: data.currency,
      timezone: data.timezone,
      taxRate: data.taxRate,
      isTaxEnabled: data.isTaxEnabled,
      allowNegativeStock: data.allowNegativeStock,
      receiptPaperSize: data.receiptPaperSize,
      receiptCustomWidth: data.receiptCustomWidth,
      receiptShowBranchName: data.receiptShowBranchName,
      receiptShowCashier: data.receiptShowCashier,
      receiptShowCustomerName: data.receiptShowCustomerName,
      receiptShowLogo: data.receiptShowLogo,
      receiptShowThankYou: data.receiptShowThankYou,
      printRoutingMode: data.printRoutingMode,
      autoPrintOnSale: data.autoPrintOnSale,
      autoPrintOnDebtPayment: data.autoPrintOnDebtPayment,
      autoPrintDailyReports: data.autoPrintDailyReports,
      nameEn: data.nameEn || undefined,
      receiptFooterMessage: data.receiptFooterMessage || undefined,
      receiptPhoneNumber: data.receiptPhoneNumber || undefined,
      logoUrl: data.logoUrl || undefined
    };

    const result = await updateTenant(payload).unwrap();

    if (result.success) {
      dispatch(
        setTaxSettings({
          taxRate: data.taxRate,
          isTaxEnabled: data.isTaxEnabled,
          allowNegativeStock: data.allowNegativeStock
        })
      );
      toast.success(t("settings.save"));
    }
  });

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="orbit-badge">
              <Settings01 className="size-4 text-primary" />
              {t("settings.title")}
            </div>
            <h1 className="mt-4 text-balance">{t("settings.title")}</h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              {t("settings.subtitle")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: t("settings.appearance.themeSection"), icon: <Sliders04 className="size-5 text-primary" /> },
              { title: t("settings.business.title"), icon: <Building05 className="size-5 text-primary" /> },
              { title: t("settings.receipt.title"), icon: <Printer className="size-5 text-primary" /> }
            ].map((item) => (
              <div key={item.title} className="frost-card rounded-[calc(var(--radius)+0.05rem)] p-4">
                <div className="inline-flex rounded-2xl bg-primary/12 p-2">{item.icon}</div>
                <p className="mt-4 font-semibold text-foreground">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <form onSubmit={onSubmit} className="space-y-6">
        <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
          <TabsList>
            <TabsTrigger>{t("settings.tabs.appearance")}</TabsTrigger>
            <TabsTrigger>{t("settings.tabs.business")}</TabsTrigger>
            <TabsTrigger>{t("settings.tabs.receipt")}</TabsTrigger>
          </TabsList>

          <TabsPanels className="mt-6">
            <TabsContent className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.appearance.themeSection")}</CardTitle>
                    <CardDescription>{t("settings.appearance.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {themeCards.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          className={cn(
                            "wallpaper-tile p-3 text-start",
                            preferences.themeId === theme.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )}
                          onClick={() => setTheme(theme.id)}
                        >
                          <div
                            className="mesh-preview h-24 rounded-[calc(var(--radius)+0.05rem)]"
                            style={{
                              backgroundImage:
                                theme.id === "custom"
                                  ? `linear-gradient(140deg, ${preferences.customTheme.primary}33, ${preferences.customTheme.accent}44, ${preferences.customTheme.background})`
                                  : theme.preview
                            }}
                          />
                          <p className="mt-3 font-semibold text-foreground">{t(theme.labelKey)}</p>
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { key: "primary", label: t("settings.appearance.primary") },
                        { key: "accent", label: t("settings.appearance.accent") },
                        { key: "background", label: t("settings.appearance.background") },
                        { key: "surface", label: t("settings.appearance.surface") }
                      ].map((item) => (
                        <label key={item.key} className="surface-outline flex items-center justify-between rounded-2xl px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">{item.label}</span>
                          <input
                            type="color"
                            value={preferences.customTheme[item.key as keyof typeof preferences.customTheme] as string}
                            onChange={(event) =>
                              updateCustomTheme({
                                [item.key]: event.target.value
                              })
                            }
                            className="h-10 w-14 cursor-pointer rounded-xl border-0 bg-transparent"
                          />
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.appearance.languageSection")}</CardTitle>
                    <CardDescription>{t("layout.changeLanguage")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="surface-outline rounded-2xl p-4">
                      <LanguagePill />
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{t("settings.appearance.numerals")}</p>
                          <p className="text-sm text-muted-foreground">{t("common.language")}</p>
                        </div>
                        <Switch
                          checked={preferences.useArabicNumerals}
                          onCheckedChange={setUseArabicNumerals}
                        />
                      </div>
                    </div>

                    <ImageUploadField
                      label={t("common.avatar")}
                      description={t("settings.appearance.uploadAvatar")}
                      value={preferences.avatarImage}
                      onChange={(result) => setAvatarImage(result?.dataUrl || null)}
                      actionLabel={t("settings.appearance.uploadAvatar")}
                      clearLabel={t("settings.appearance.clearAvatar")}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.appearance.wallpaperSection")}</CardTitle>
                  <CardDescription>{t("common.wallpaper")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {wallpaperPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className="wallpaper-tile p-3 text-start"
                        data-active={preferences.wallpaperId === preset.id && !preferences.customWallpaper}
                        onClick={() => setWallpaperPreset(preset.id)}
                      >
                        <div className="mesh-preview h-28 rounded-[calc(var(--radius)+0.05rem)]" style={{ backgroundImage: preset.backgroundImage }} />
                        <p className="mt-3 font-semibold text-foreground">{t(wallpaperLabelMap[preset.id])}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-3">
                    <ImageUploadField
                      label={t("common.wallpaper")}
                      description={t("settings.appearance.uploadWallpaper")}
                      value={preferences.customWallpaper}
                      onChange={(result) => setCustomWallpaper(result?.dataUrl || null)}
                      actionLabel={t("settings.appearance.uploadWallpaper")}
                      clearLabel={t("settings.appearance.clearWallpaper")}
                    />
                    <ImageUploadField
                      label={t("common.sidebar")}
                      description={t("settings.appearance.uploadSidebar")}
                      value={preferences.sidebarImage}
                      onChange={(result) => setSidebarImage(result?.dataUrl || null)}
                      actionLabel={t("settings.appearance.uploadSidebar")}
                      clearLabel={t("settings.appearance.clearSidebar")}
                    />
                    <ImageUploadField
                      label={t("common.logo")}
                      description={t("common.logo")}
                      value={values.logoUrl || null}
                      onChange={async (result) => {
                        if (!result) {
                          form.setValue("logoUrl", "");
                          return;
                        }

                        const payload = new FormData();
                        payload.append("file", result.file);
                        const uploadResult = await uploadLogo(payload).unwrap();
                        if (uploadResult.success && uploadResult.data?.logoUrl) {
                          form.setValue("logoUrl", uploadResult.data.logoUrl);
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.business.title")}</CardTitle>
                    <CardDescription>{t("settings.business.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label>{t("settings.business.storeName")}</Label>
                      <Input {...form.register("name")} />
                    </div>
                    <div>
                      <Label>{t("settings.business.storeNameEn")}</Label>
                      <Input {...form.register("nameEn")} />
                    </div>
                    <div>
                      <Label>{t("settings.business.currency")}</Label>
                      <Select {...form.register("currency")}>
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                        <option value="SAR">SAR</option>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("settings.business.timezone")}</Label>
                      <Select {...form.register("timezone")}>
                        <option value="Africa/Cairo">Africa/Cairo</option>
                        <option value="Asia/Riyadh">Asia/Riyadh</option>
                        <option value="UTC">UTC</option>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("settings.business.taxRate")}</Label>
                      <Input type="number" step="0.01" {...form.register("taxRate")} />
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: "isTaxEnabled", label: t("settings.business.enableTax") },
                        { key: "allowNegativeStock", label: t("settings.business.allowNegativeStock") }
                      ].map((item) => (
                        <div key={item.key} className="surface-outline flex items-center justify-between rounded-2xl px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">{item.label}</span>
                          <Switch
                            checked={Boolean(values[item.key as keyof SettingsFormValues])}
                            onCheckedChange={(checked) =>
                              form.setValue(item.key as keyof SettingsFormValues, checked as never)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("settings.business.posMode")}</CardTitle>
                      <CardDescription>{t("settings.business.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { id: "cashier", title: t("settings.business.cashierMode"), body: t("settings.business.cashierModeBody") },
                        { id: "standard", title: t("settings.business.standardMode"), body: t("settings.business.standardModeBody") }
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setMode(option.id as "cashier" | "standard")}
                          className={cn(
                            "surface-outline w-full rounded-[calc(var(--radius)+0.05rem)] p-4 text-start transition",
                            mode === option.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">{option.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{option.body}</p>
                            </div>
                            {mode === option.id ? <CheckCircle className="size-5 text-primary" /> : null}
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("settings.business.networkTitle")}</CardTitle>
                      <CardDescription>{t("settings.business.networkBody")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="surface-outline rounded-2xl px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-foreground">{systemData?.data?.url || "http://localhost:3000"}</p>
                          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {healthData?.success && !healthError ? t("common.active") : t("common.inactive")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{systemData?.data?.lanIp || "127.0.0.1"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.receipt.title")}</CardTitle>
                    <CardDescription>{t("settings.receipt.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label>{t("settings.receipt.paperSize")}</Label>
                      <Select {...form.register("receiptPaperSize")}>
                        <option value="80mm">80mm</option>
                        <option value="58mm">58mm</option>
                        <option value="custom">{t("settings.receipt.customWidth")}</option>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("settings.receipt.customWidth")}</Label>
                      <Input type="number" {...form.register("receiptCustomWidth")} />
                    </div>
                    <div>
                      <Label>{t("settings.receipt.footer")}</Label>
                      <Input {...form.register("receiptFooterMessage")} />
                    </div>
                    <div>
                      <Label>{t("settings.receipt.phone")}</Label>
                      <Input {...form.register("receiptPhoneNumber")} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>{t("settings.receipt.printMode")}</Label>
                      <Select {...form.register("printRoutingMode")}>
                        <option value="BranchOnly">BranchOnly</option>
                        <option value="BranchWithFallback">BranchWithFallback</option>
                        <option value="AllDevices">AllDevices</option>
                        <option value="Disabled">Disabled</option>
                      </Select>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      {[
                        { key: "receiptShowBranchName", label: t("settings.receipt.showBranch") },
                        { key: "receiptShowCashier", label: t("settings.receipt.showCashier") },
                        { key: "receiptShowCustomerName", label: t("settings.receipt.showCustomer") },
                        { key: "receiptShowLogo", label: t("settings.receipt.showLogo") },
                        { key: "receiptShowThankYou", label: t("settings.receipt.showThanks") },
                        { key: "autoPrintOnSale", label: t("settings.receipt.autoSale") },
                        { key: "autoPrintOnDebtPayment", label: t("settings.receipt.autoDebt") },
                        { key: "autoPrintDailyReports", label: t("settings.receipt.autoDaily") }
                      ].map((item) => (
                        <div key={item.key} className="surface-outline flex items-center justify-between rounded-2xl px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">{item.label}</span>
                          <Switch
                            checked={Boolean(values[item.key as keyof SettingsFormValues])}
                            onCheckedChange={(checked) =>
                              form.setValue(item.key as keyof SettingsFormValues, checked as never)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("common.preview")}</CardTitle>
                    <CardDescription>{t("settings.receipt.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mesh-preview flex justify-center rounded-[calc(var(--radius)+0.05rem)] bg-background/70 p-5">
                      <div
                        className="rounded-[1.3rem] border border-dashed border-border bg-white px-4 py-5 shadow-soft"
                        style={{ width: `${receiptWidth}px`, maxWidth: "100%" }}
                      >
                        {values.receiptShowLogo && values.logoUrl ? (
                          <img src={values.logoUrl} alt={t("common.logo")} className="mx-auto mb-3 h-10 object-contain" />
                        ) : null}
                        {values.receiptShowBranchName ? (
                          <p className="text-center text-sm font-bold text-foreground">{values.name || t("common.appName")}</p>
                        ) : null}
                        <p className="mt-2 text-center text-xs text-muted-foreground">{t("settings.receipt.title")}</p>
                        <div className="my-3 h-px bg-border" />
                        {values.receiptShowCashier ? <p className="text-xs text-foreground">{t("settings.receipt.previewCashier")}</p> : null}
                        {values.receiptShowCustomerName ? <p className="mt-1 text-xs text-foreground">{t("settings.receipt.previewCustomer")}</p> : null}
                        <div className="mt-3 space-y-1 text-xs text-foreground">
                          <div className="flex items-center justify-between">
                            <span>{t("settings.receipt.previewItem")}</span>
                            <span>{values.currency} 120</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{t("settings.receipt.previewTax")}</span>
                            <span>{values.taxRate}%</span>
                          </div>
                        </div>
                        <div className="my-3 h-px bg-border" />
                        <div className="flex items-center justify-between text-sm font-bold text-foreground">
                          <span>{t("settings.receipt.previewTotal")}</span>
                          <span>{values.currency} 136.8</span>
                        </div>
                        {values.receiptShowThankYou ? <p className="mt-4 text-center text-xs text-muted-foreground">{t("settings.receipt.previewThanks")}</p> : null}
                        {values.receiptFooterMessage ? <p className="mt-2 text-center text-xs text-muted-foreground">{values.receiptFooterMessage}</p> : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </TabsPanels>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" size="lg" isLoading={isSaving}>
            {t("settings.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
