import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Award01,
  BankNote01,
  BarChartSquare02,
  Calculator,
  Clock,
  CreditCard01,
  CurrencyDollar,
  Grid01,
  Package,
  Receipt,
  ShoppingBag01,
  Star01,
  SwitchHorizontal01,
  SwitchVertical01,
  Truck01,
  UserCheck01,
  Users01,
} from "@untitledui/icons";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bgColor: string;
}

const reportCategories = {
  sales: {
    title: "تقارير المبيعات والمالية",
    icon: CurrencyDollar,
    reports: [
      {
        id: "daily",
        title: "التقرير اليومي",
        description: "ملخص المبيعات والطلبات والورديات اليومية",
        icon: BarChartSquare02,
        path: "/reports/daily",
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        id: "sales",
        title: "تقرير المبيعات",
        description: "تحليل شامل للمبيعات حسب الفترة الزمنية",
        icon: ShoppingBag01,
        path: "/reports/sales",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        id: "profit-loss",
        title: "الأرباح والخسائر",
        description: "تقرير مالي شامل للإيرادات والمصروفات والأرباح",
        icon: TrendingUp,
        path: "/reports/profit-loss",
        color: "text-success",
        bgColor: "bg-success/10",
      },
      {
        id: "expenses",
        title: "تقرير المصروفات",
        description: "تحليل تفصيلي للمصروفات حسب الفئة وطريقة الدفع",
        icon: Receipt,
        path: "/reports/expenses",
        color: "text-danger",
        bgColor: "bg-danger/10",
      },
    ] as ReportCard[],
  },
  inventory: {
    title: "تقارير المخزون",
    icon: Grid01,
    reports: [
      {
        id: "inventory",
        title: "تقرير المخزون",
        description: "حالة المخزون الحالية والمنتجات المنخفضة",
        icon: Package,
        path: "/reports/inventory",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
      {
        id: "transfer-history",
        title: "تاريخ التحويلات",
        description: "سجل تحويلات المخزون بين الفروع",
        icon: SwitchHorizontal01,
        path: "/reports/transfer-history",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
      },
    ] as ReportCard[],
  },
  customers: {
    title: "تقارير العملاء",
    icon: Users01,
    reports: [
      {
        id: "top-customers",
        title: "أفضل العملاء",
        description: "العملاء الأكثر شراءً وإنفاقاً",
        icon: Users01,
        path: "/reports/customers/top",
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
      },
      {
        id: "customer-debts",
        title: "ديون العملاء",
        description: "المستحقات والديون المتأخرة للعملاء",
        icon: AlertTriangle,
        path: "/reports/customers/debts",
        color: "text-warning",
        bgColor: "bg-warning/10",
      },
      {
        id: "customer-activity",
        title: "نشاط العملاء",
        description: "تحليل سلوك العملاء ومعدل الاحتفاظ",
        icon: Activity,
        path: "/reports/customers/activity",
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
      },
    ] as ReportCard[],
  },
  employees: {
    title: "تقارير الموظفين",
    icon: UserCheck01,
    reports: [
      {
        id: "cashier-performance",
        title: "أداء الكاشير",
        description: "تحليل أداء الكاشير من حيث المبيعات والورديات",
        icon: UserCheck01,
        path: "/reports/employees/cashier-performance",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
      },
      {
        id: "shifts",
        title: "تفاصيل الورديات",
        description: "تقرير تفصيلي بجميع الورديات وأوقاتها ومبيعاتها",
        icon: Clock,
        path: "/reports/employees/shifts",
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
      },
      {
        id: "sales-by-employee",
        title: "المبيعات حسب الموظف",
        description: "مقارنة أداء الموظفين في المبيعات",
        icon: BankNote01,
        path: "/reports/employees/sales",
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
      },
    ] as ReportCard[],
  },
  products: {
    title: "تقارير المنتجات",
    icon: Package,
    reports: [
      {
        id: "product-movement",
        title: "حركة المنتجات",
        description: "تتبع حركة المنتجات من مبيعات ومشتريات وتحويلات",
        icon: SwitchVertical01,
        path: "/reports/products/movement",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
      },
      {
        id: "profitability",
        title: "المنتجات الأكثر ربحية",
        description: "ترتيب المنتجات حسب الربحية وهامش الربح",
        icon: Star01,
        path: "/reports/products/profitability",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      },
      {
        id: "slow-moving",
        title: "المنتجات الراكدة",
        description: "المنتجات بطيئة الحركة والمخزون المتراكم",
        icon: TrendingDown,
        path: "/reports/products/slow",
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
      },
      {
        id: "cogs",
        title: "تكلفة البضاعة المباعة",
        description: "تحليل تكاليف البضاعة المباعة وهوامش الربح",
        icon: Calculator,
        path: "/reports/products/cogs",
        color: "text-slate-500",
        bgColor: "bg-slate-500/10",
      },
    ] as ReportCard[],
  },
  suppliers: {
    title: "تقارير الموردين",
    icon: Truck01,
    reports: [
      {
        id: "supplier-purchases",
        title: "مشتريات الموردين",
        description: "تفاصيل المشتريات والفواتير لكل مورد",
        icon: Truck01,
        path: "/reports/suppliers/purchases",
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
      },
      {
        id: "supplier-debts",
        title: "ديون الموردين",
        description: "المستحقات والديون المتأخرة للموردين",
        icon: CreditCard01,
        path: "/reports/suppliers/debts",
        color: "text-danger",
        bgColor: "bg-danger/10",
      },
      {
        id: "supplier-performance",
        title: "أداء الموردين",
        description: "تقييم أداء الموردين من حيث الالتزام والجودة",
        icon: Award01,
        path: "/reports/suppliers/performance",
        color: "text-fuchsia-500",
        bgColor: "bg-fuchsia-500/10",
      },
    ] as ReportCard[],
  },
};

export const ReportsDashboardPage = () => {
  const navigate = useNavigate();

  const handleReportClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChartSquare02 className="size-6 text-primary" />
              </div>
              مركز التقارير
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              الوصول السريع إلى كافة تقارير وتحليلات المؤسسة لتتبع الأداء واتخاذ القرارات
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        {Object.entries(reportCategories).map(([key, category]) => (
          <section key={key} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <category.icon className="size-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                {category.title}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.reports.map((report) => (
                <Card
                  key={report.id}
                  className="group cursor-pointer overflow-hidden border border-border/60 bg-card/70 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onClick={() => handleReportClick(report.path)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleReportClick(report.path);
                    }
                  }}
                >
                  <div className="flex h-full flex-col p-6 text-center">
                    <div
                      className={`mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-border/50 transition-transform duration-300 group-hover:scale-110 ${report.bgColor}`}
                    >
                      <report.icon className={`size-7 ${report.color}`} />
                    </div>
                    
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {report.title}
                    </h3>
                    
                    <p className="mb-6 flex-1 text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    
                    <Button
                      variant="outline"
                      className="mt-auto w-full justify-center border-primary/20 bg-card/65 text-foreground transition group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary"
                    >
                      فتح التقرير
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Tips Section */}
        <Card className="mt-10 overflow-hidden border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4 p-6 sm:items-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BarChartSquare02 className="size-6" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-bold text-foreground">
                نصيحة للمديرين
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                يمكنك استخدام الفلاتر في كل تقرير لتخصيص البيانات حسب الفترة الزمنية
                أو الفرع. جميع التقارير تدعم التصدير إلى CSV حيثما كان ذلك متاحاً.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
