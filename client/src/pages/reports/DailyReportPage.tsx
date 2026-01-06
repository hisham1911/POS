import { useState } from "react";
import { Calendar, TrendingUp, ShoppingBag, DollarSign, Receipt, Package } from "lucide-react";
import { Card } from "@/components/common/Card";
import { formatCurrency } from "@/utils/formatters";

// Mock data for reports
const mockReportData = {
  date: new Date().toISOString().split("T")[0],
  totalOrders: 45,
  totalSales: 4500,
  totalTax: 675,
  netProfit: 1200,
  cashSales: 2800,
  cardSales: 1700,
  topProducts: [
    { name: "كابتشينو", quantity: 45, total: 765 },
    { name: "قهوة أمريكية", quantity: 38, total: 570 },
    { name: "لاتيه", quantity: 32, total: 576 },
    { name: "برجر كلاسيك", quantity: 25, total: 875 },
    { name: "بيتزا مارغريتا", quantity: 20, total: 900 },
  ],
  salesByCategory: [
    { name: "المشروبات", percentage: 40, total: 1800 },
    { name: "الوجبات السريعة", percentage: 35, total: 1575 },
    { name: "الحلويات", percentage: 15, total: 675 },
    { name: "المقبلات", percentage: 10, total: 450 },
  ],
};

export const DailyReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(mockReportData.date);
  const report = mockReportData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">التقرير اليومي</h1>
          <p className="text-gray-500 mt-1">ملخص المبيعات والإحصائيات</p>
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
              <p className="text-sm text-gray-500">الطلبات</p>
              <p className="text-2xl font-bold text-gray-800">{report.totalOrders}</p>
              <p className="text-xs text-success-500">+12% من أمس</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">المبيعات</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(report.totalSales)}</p>
              <p className="text-xs text-success-500">+8% من أمس</p>
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
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(report.totalTax)}</p>
              <p className="text-xs text-gray-400">15% VAT</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">صافي الربح</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(report.netProfit)}</p>
              <p className="text-xs text-success-500">+15% من أمس</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Payment Method */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">المبيعات حسب طريقة الدفع</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">نقدي</span>
                <span className="font-medium">{formatCurrency(report.cashSales)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(report.cashSales / report.totalSales) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">بطاقة</span>
                <span className="font-medium">{formatCurrency(report.cardSales)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(report.cardSales / report.totalSales) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Sales by Category */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">المبيعات حسب التصنيف</h3>
          <div className="space-y-3">
            {report.salesByCategory.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">{category.name}</span>
                  <span className="font-medium">{category.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">أعلى المنتجات مبيعاً</h3>
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
              {report.topProducts.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.quantity}</td>
                  <td className="px-4 py-3 font-semibold text-primary-600">
                    {formatCurrency(product.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DailyReportPage;
