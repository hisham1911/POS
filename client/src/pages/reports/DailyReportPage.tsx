import { useState } from "react";
import {
  Calendar,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Receipt,
  Package,
  CreditCard,
  Banknote,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/common/Card";
import { formatCurrency } from "@/utils/formatters";
import { useGetDailyReportQuery } from "@/api/reportsApi";

export const DailyReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data, isLoading, isError, error } = useGetDailyReportQuery(selectedDate);
  const report = data?.data;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <span className="mr-2 text-gray-600">جاري تحميل التقرير...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">فشل في تحميل التقرير</p>
          <p className="text-gray-500 text-sm mt-2">
            {(error as any)?.data?.message || "حدث خطأ غير متوقع"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">التقرير اليومي</h1>
          <p className="text-gray-500 mt-1">
            {report?.branchName || "ملخص المبيعات والإحصائيات"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">الطلبات المكتملة</p>
              <p className="text-2xl font-bold text-gray-800">
                {report?.completedOrders || 0}
              </p>
              <p className="text-xs text-gray-400">
                من {report?.totalOrders || 0} طلب
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(report?.totalSales || 0)}
              </p>
              <p className="text-xs text-gray-400">
                صافي: {formatCurrency(report?.netSales || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">المرتجعات</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(report?.totalRefunds || 0)}
              </p>
              <p className="text-xs text-gray-400">إجمالي المرتجعات</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">الضرائب</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(report?.totalTax || 0)}
              </p>
              <p className="text-xs text-gray-400">14% VAT</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <Banknote className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">نقدي</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(report?.totalCash || 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">بطاقة</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(report?.totalCard || 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">فوري</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(report?.totalFawry || 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">الخصومات</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(report?.totalDiscount || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Payment Method */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            المبيعات حسب طريقة الدفع
          </h3>
          <div className="space-y-4">
            {[
              { label: "نقدي", value: report?.totalCash || 0, color: "bg-green-500" },
              { label: "بطاقة", value: report?.totalCard || 0, color: "bg-blue-500" },
              { label: "فوري", value: report?.totalFawry || 0, color: "bg-orange-500" },
            ].map((item) => {
              const total = report?.totalSales || 1;
              const percentage = (item.value / total) * 100;
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Hourly Sales */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            المبيعات بالساعة
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {report?.hourlySales?.length ? (
              report.hourlySales.map((hourData) => (
                <div
                  key={hourData.hour}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <span className="text-gray-600">
                    {hourData.hour.toString().padStart(2, "0")}:00
                  </span>
                  <div className="text-left">
                    <span className="font-medium text-gray-800">
                      {formatCurrency(hourData.sales)}
                    </span>
                    <span className="text-gray-400 text-sm mr-2">
                      ({hourData.orderCount} طلب)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">لا توجد بيانات</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          أعلى المنتجات مبيعاً
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-right font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">المنتج</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">الكمية</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {report?.topProducts?.length ? (
                report.topProducts.map((product, index) => (
                  <tr key={product.productId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="font-medium">{product.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.quantitySold}</td>
                    <td className="px-4 py-3 font-semibold text-primary-600">
                      {formatCurrency(product.totalSales)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    لا توجد منتجات مباعة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DailyReportPage;
