import { useState } from "react";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Loading } from "@/components/common/Loading";
import {
  useGetBranchesQuery,
  useDeleteBranchMutation,
} from "@/api/branchesApi";
import { BranchFormModal } from "@/components/branches/BranchFormModal";
import type { Branch } from "@/types/branch.types";
import { formatDateTime } from "@/utils/formatters";
import { toast } from "react-hot-toast";
import clsx from "clsx";

export const BranchesPage = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();

  const { data: branchesData, isLoading } = useGetBranchesQuery();
  const [deleteBranch, { isLoading: isDeleting }] = useDeleteBranchMutation();

  const branches = branchesData?.data || [];

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowFormModal(true);
  };

  const handleDelete = async (branch: Branch) => {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف الفرع "${branch.name}"؟\n\nملاحظة: لن يتم حذف البيانات المرتبطة بهذا الفرع.`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteBranch(branch.id).unwrap();
      if (result.success) {
        toast.success("تم حذف الفرع بنجاح");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "فشل في حذف الفرع");
    }
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setSelectedBranch(undefined);
  };

  if (isLoading) {
    return <Loading />;
  }

  const activeBranches = branches.filter((b) => b.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الفروع</h1>
          </div>
          <p className="text-gray-600">
            إدارة جميع فروع المؤسسة والتحكم في بيانات كل فرع
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => setShowFormModal(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة فرع جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-100">
            <p className="text-sm text-gray-600">إجمالي الفروع</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {branches.length}
            </p>
          </Card>
          <Card className="border-green-100">
            <p className="text-sm text-gray-600">الفروع النشطة</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {activeBranches}
            </p>
          </Card>
        </div>

        {branches.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              لا توجد فروع
            </h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة فرع جديد لمؤسستك</p>
            <Button
              variant="primary"
              onClick={() => setShowFormModal(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة فرع جديد
            </Button>
          </Card>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                      اسم الفرع
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                      الكود
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                      العنوان
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                      الهاتف
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                      الحالة
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                      تاريخ الإنشاء
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {branch.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {branch.code}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {branch.address || "—"}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {branch.phone || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={clsx(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            branch.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {branch.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDateTime(branch.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(branch)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                          </button>
                          <button
                            onClick={() => handleDelete(branch)}
                            disabled={isDeleting}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showFormModal && (
          <BranchFormModal branch={selectedBranch} onClose={handleCloseModal} />
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 نصائح إدارة الفروع
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>الفرع:</strong> كل فرع يمثل موقع عمل منفصل بإدارة خزينة
                وعمليات خاصة بها
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>الكود:</strong> رقم فريد يميز الفرع عن الفروع الأخرى
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>البيانات:</strong> احرص على إدخال بيانات صحيحة وكاملة
                (عنوان وهاتف)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>الحالة:</strong> يمكن تفعيل أو تعطيل الفرع حسب الحاجة
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>التحديث:</strong> جميع البيانات المحفوظة يمكن تعديلها
                لاحقاً
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
