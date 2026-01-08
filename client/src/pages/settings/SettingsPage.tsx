import { useState, useEffect } from "react";
import { Settings, Percent, ToggleLeft, ToggleRight, Save, Building2, Package } from "lucide-react";
import { useGetCurrentTenantQuery, useUpdateCurrentTenantMutation } from "@/api/branchesApi";
import { useAppDispatch } from "@/store/hooks";
import { setTaxSettings } from "@/store/slices/cartSlice";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { toast } from "sonner";
import clsx from "clsx";

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const { data: tenantData, isLoading, refetch } = useGetCurrentTenantQuery();
  const [updateTenant, { isLoading: isUpdating }] = useUpdateCurrentTenantMutation();

  const tenant = tenantData?.data;

  // Form state
  const [taxRate, setTaxRate] = useState<number>(14);
  const [isTaxEnabled, setIsTaxEnabled] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [nameEn, setNameEn] = useState<string>("");
  const [currency, setCurrency] = useState<string>("EGP");
  const [timezone, setTimezone] = useState<string>("Africa/Cairo");
  const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(false);

  // Initialize form with tenant data
  useEffect(() => {
    if (tenant) {
      setTaxRate(tenant.taxRate);
      setIsTaxEnabled(tenant.isTaxEnabled);
      setName(tenant.name);
      setNameEn(tenant.nameEn || "");
      setCurrency(tenant.currency);
      setTimezone(tenant.timezone);
      setAllowNegativeStock(tenant.allowNegativeStock ?? false);
    }
  }, [tenant]);

  const handleSave = async () => {
    // Validate tax rate
    if (taxRate < 0 || taxRate > 100) {
      toast.error("نسبة الضريبة يجب أن تكون بين 0 و 100");
      return;
    }

    try {
      const result = await updateTenant({
        name,
        nameEn: nameEn || undefined,
        currency,
        timezone,
        taxRate,
        isTaxEnabled,
        allowNegativeStock,
      }).unwrap();

      if (result.success) {
        // Update cart tax settings globally
        dispatch(setTaxSettings({ taxRate, isTaxEnabled }));
        toast.success("تم حفظ الإعدادات بنجاح");
        refetch();
      } else {
        toast.error(result.message || "فشل في حفظ الإعدادات");
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إعدادات الشركة</h1>
            <p className="text-gray-500">إدارة إعدادات الضريبة والبيانات الأساسية</p>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="w-5 h-5 text-gray-500" />
            <span>بيانات الشركة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم الشركة (عربي)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="اسم الشركة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم الشركة (إنجليزي)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Company Name"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العملة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنطقة الزمنية
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Africa/Cairo">القاهرة (Africa/Cairo)</option>
                <option value="Asia/Riyadh">الرياض (Asia/Riyadh)</option>
                <option value="Asia/Dubai">دبي (Asia/Dubai)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tax Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Percent className="w-5 h-5 text-gray-500" />
            <span>إعدادات الضريبة</span>
          </div>

          {/* Tax Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">تفعيل الضريبة</p>
              <p className="text-sm text-gray-500">
                {isTaxEnabled 
                  ? "الضريبة مفعلة - سيتم احتساب الضريبة على جميع الطلبات" 
                  : "الضريبة معطلة - لن يتم احتساب أي ضريبة"}
              </p>
            </div>
            <button
              onClick={() => setIsTaxEnabled(!isTaxEnabled)}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                isTaxEnabled 
                  ? "bg-success-100 text-success-600" 
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {isTaxEnabled ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Tax Rate Input */}
          <div className={clsx(!isTaxEnabled && "opacity-50 pointer-events-none")}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نسبة الضريبة (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                disabled={!isTaxEnabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                placeholder="14"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                %
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              الضريبة المصرية الافتراضية: 14% (ضريبة القيمة المضافة)
            </p>
          </div>

          {/* Tax Preview */}
          {isTaxEnabled && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm font-medium text-primary-800 mb-2">معاينة الحساب (ضريبة مضافة):</p>
              <div className="text-sm text-primary-700 space-y-1">
                <p>• سعر المنتج (صافي بدون ضريبة): 100 ج.م</p>
                <p>• قيمة الضريبة ({taxRate}%): {(100 * taxRate / 100).toFixed(2)} ج.م</p>
                <p>• الإجمالي (شامل الضريبة): {(100 + 100 * taxRate / 100).toFixed(2)} ج.م</p>
              </div>
            </div>
          )}
        </div>

        {/* Inventory Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Package className="w-5 h-5 text-gray-500" />
            <span>إعدادات المخزون</span>
          </div>

          {/* Allow Negative Stock Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">السماح بالمخزون السالب (Sale below 0)</p>
              <p className="text-sm text-gray-500">
                {allowNegativeStock 
                  ? "مسموح - يمكن البيع حتى لو كان المخزون صفر أو سالب" 
                  : "غير مسموح - سيقوم النظام برفض البيع عند نفاد المخزون"}
              </p>
            </div>
            <button
              onClick={() => setAllowNegativeStock(!allowNegativeStock)}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                allowNegativeStock 
                  ? "bg-success-100 text-success-600" 
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {allowNegativeStock ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {!allowNegativeStock && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>تنبيه:</strong> عند إيقاف هذا الخيار، لن يتمكن الكاشير من إتمام عمليات البيع للمنتجات التي نفد مخزونها.
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            isLoading={isUpdating}
            disabled={isUpdating}
            rightIcon={<Save className="w-5 h-5" />}
          >
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
