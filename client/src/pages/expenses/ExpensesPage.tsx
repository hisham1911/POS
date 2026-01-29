import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Download, Eye, Edit, Trash2, Check, X, DollarSign } from 'lucide-react';
import { useGetExpensesQuery, useDeleteExpenseMutation } from '../../api/expensesApi';
import { useGetExpenseCategoriesQuery } from '../../api/expenseCategoriesApi';
import type { ExpenseStatus, ExpenseFilters } from '../../types/expense.types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';

export function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({
    pageNumber: 1,
    pageSize: 20,
  });

  const { data: expensesResponse, isLoading, error } = useGetExpensesQuery(filters);
  const { data: categoriesResponse } = useGetExpenseCategoriesQuery();
  const [deleteExpense] = useDeleteExpenseMutation();

  const expenses = expensesResponse?.data?.items || [];
  const totalCount = expensesResponse?.data?.totalCount || 0;
  const totalPages = expensesResponse?.data?.totalPages || 1;
  const categories = categoriesResponse?.data || [];

  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      try {
        await deleteExpense(id).unwrap();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    const badges = {
      Draft: 'bg-gray-100 text-gray-800',
      Approved: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      Draft: 'مسودة',
      Approved: 'معتمد',
      Paid: 'مدفوع',
      Rejected: 'مرفوض',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-600">حدث خطأ في تحميل المصروفات</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المصروفات</h1>
          <p className="text-gray-600 mt-1">إدارة مصروفات الشركة</p>
        </div>
        <Link to="/expenses/new">
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            مصروف جديد
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              <option value="Draft">مسودة</option>
              <option value="Approved">معتمد</option>
              <option value="Paid">مدفوع</option>
              <option value="Rejected">مرفوض</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => handleFilterChange('fromDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => handleFilterChange('toDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم المصروف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التصنيف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.expenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.categoryName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {expense.amount.toFixed(2)} جنيه
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.expenseDate).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(expense.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link to={`/expenses/${expense.id}`}>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      {expense.status === 'Draft' && (
                        <>
                          <Link to={`/expenses/${expense.id}/edit`}>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              عرض {expenses.length} من {totalCount} مصروف
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.pageNumber! - 1)}
                disabled={filters.pageNumber === 1}
              >
                السابق
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                صفحة {filters.pageNumber} من {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.pageNumber! + 1)}
                disabled={filters.pageNumber === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
