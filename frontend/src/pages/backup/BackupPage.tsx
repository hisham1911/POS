import { useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { toast } from "sonner";
import {
  useCreateBackupMutation,
  useListBackupsQuery,
  useRestoreBackupMutation,
  type BackupInfo,
} from "@/api/backupApi";
import clsx from "clsx";

export const BackupPage = () => {
  const { data: backupsData, isLoading, refetch } = useListBackupsQuery();
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);
  const [restoreDetails, setRestoreDetails] = useState<{
    migrationsApplied: number;
    requiresRestart: boolean;
    dataValidationIssuesFound: number;
  } | null>(null);

  const backups = backupsData || [];

  const handleCreateBackup = async () => {
    try {
      const result = await createBackup().unwrap();
      if (result.success) {
        toast.success("تم إنشاء النسخة الاحتياطية بنجاح");
        refetch();
      } else {
        toast.error(result.errorMessage || "فشل إنشاء النسخة الاحتياطية");
      }
    } catch (error) {
      toast.error("خطأ في إنشاء النسخة الاحتياطية");
      console.error(error);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) {
      toast.error("يرجى اختيار نسخة احتياطية");
      return;
    }

    try {
      const result = await restoreBackup({
        backupFileName: selectedBackup,
      }).unwrap();

      if (result.success) {
        setShowConfirmRestore(false);
        setSelectedBackup(null);
        
        // Show detailed success modal with migration & restart info
        setRestoreDetails({
          migrationsApplied: result.migrationsApplied || 0,
          requiresRestart: result.requiresRestart ?? true,
          dataValidationIssuesFound: result.dataValidationIssuesFound || 0,
        });
        setShowRestoreSuccess(true);
        
        if (result.migrationsApplied > 0) {
          toast.success(
            `تم استعادة النسخة الاحتياطية بنجاح وتطبيق ${result.migrationsApplied} تحديث على قاعدة البيانات`
          );
        } else {
          toast.success("تم استعادة النسخة الاحتياطية بنجاح");
        }
        
        refetch();
      } else {
        toast.error(
          result.errorMessage || "فشلت عملية الاستعادة"
        );
        if (result.maintenanceModeEnabled) {
          toast.error("النظام في وضع الصيانة - يرجى إعادة تشغيل التطبيق");
        }
        setShowConfirmRestore(false);
      }
    } catch (error) {
      toast.error("خطأ في استعادة النسخة الاحتياطية - يرجى إعادة تشغيل التطبيق");
      console.error(error);
      setShowConfirmRestore(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("ar-EG");
  };

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case "pre-migration":
        return "bg-blue-100 text-blue-800";
      case "pre-restore":
        return "bg-purple-100 text-purple-800";
      case "daily-scheduled":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonLabel = (reason: string): string => {
    switch (reason) {
      case "pre-migration":
        return "قبل الترقية";
      case "pre-restore":
        return "قبل الاستعادة";
      case "daily-scheduled":
        return "نسخة يومية";
      default:
        return "يدوية";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <HardDrive className="w-8 h-8" />
            إدارة النسخ الاحتياطية
          </h1>
          <p className="text-gray-600">
            قم بإنشاء واستعادة واستنساخ نسخ احتياطية من قاعدة البيانات
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12"
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                إنشاء نسخة احتياطية الآن
              </>
            )}
          </Button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">تنبيه مهم:</p>
              <p>تأكد من عمل نسخة احتياطية منتظمة يومياً</p>
            </div>
          </div>
        </div>

        {/* Backups List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              قائمة النسخ الاحتياطية
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              إجمالي النسخ: <span className="font-semibold">{backups.length}</span>
            </p>
          </div>

          {backups.length === 0 ? (
            <div className="p-8 text-center">
              <HardDrive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد نسخ احتياطية حالياً</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      اسم الملف
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      الحجم
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      التاريخ والوقت
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      الإجرائات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup: BackupInfo, index: number) => (
                    <tr
                      key={index}
                      className={clsx(
                        "border-b border-gray-200 hover:bg-gray-50 transition",
                        selectedBackup === backup.fileName && "bg-blue-50"
                      )}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        <div
                          className="cursor-pointer hover:underline"
                          onClick={() =>
                            setSelectedBackup(
                              selectedBackup === backup.fileName
                                ? null
                                : backup.fileName
                            )
                          }
                        >
                          {backup.fileName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(backup.sizeBytes)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(backup.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={clsx(
                            "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                            getReasonBadgeColor(backup.reason)
                          )}
                        >
                          {getReasonLabel(backup.reason)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setSelectedBackup(backup.fileName);
                            setShowConfirmRestore(true);
                          }}
                          disabled={isRestoring}
                          className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-50"
                          title="استعادة من هذه النسخة"
                        >
                          <Upload className="w-4 h-4" />
                          استعادة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmRestore && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  تأكيد الاستعادة
                </h3>
              </div>

              <p className="text-gray-600 mb-4">
                هل أنت متأكد من رغبتك في استعادة النسخة الاحتياطية؟
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-6">
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  ملف النسخة:
                </p>
                <p className="text-xs text-orange-700 font-mono break-all">
                  {selectedBackup}
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  ⚠️ سيتم إنشاء نسخة احتياطية من حالة النظام الحالية قبل الاستعادة
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmRestore(false);
                    setSelectedBackup(null);
                  }}
                  disabled={isRestoring}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleRestoreBackup}
                  disabled={isRestoring}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      جاري...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      نعم، استعادة الآن
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Success Modal */}
        {showRestoreSuccess && restoreDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  تمت الاستعادة بنجاح
                </h3>
              </div>

              <div className="space-y-3 mb-6">
                {restoreDetails.migrationsApplied > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      تحديث قاعدة البيانات:
                    </p>
                    <p className="text-sm text-blue-700">
                      تم تطبيق{" "}
                      <span className="font-bold">
                        {restoreDetails.migrationsApplied}
                      </span>{" "}
                      تحديث على الجداول تلقائياً.
                      <br />
                      النسخة الاحتياطية كانت من إصدار أقدم وتم ترقيتها بنجاح.
                    </p>
                  </div>
                )}

                {restoreDetails.migrationsApplied === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-700">
                      النسخة الاحتياطية من نفس إصدار قاعدة البيانات - لا يوجد تحديثات مطلوبة.
                    </p>
                  </div>
                )}

                {restoreDetails.dataValidationIssuesFound > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm font-semibold text-yellow-900 mb-1">
                      ⚠️ تنبيه: تم اكتشاف {restoreDetails.dataValidationIssuesFound} مشكلة أثناء التحقق
                    </p>
                    <p className="text-sm text-yellow-700">
                      قد تكون هناك بيانات قديمة لم تتطابق مع الإصدار الجديد.
                      <br />
                      تحقق من السجلات للمزيد من التفاصيل.
                    </p>
                  </div>
                )}

                {restoreDetails.dataValidationIssuesFound === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-700">
                      ✓ تم التحقق من سلامة البيانات بنجاح - لا توجد مشاكل
                    </p>
                  </div>
                )}

                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="text-sm font-semibold text-orange-900 mb-1">
                    ⚠️ يُنصح بإعادة تشغيل التطبيق
                  </p>
                  <p className="text-sm text-orange-700">
                    لضمان عمل التطبيق بشكل صحيح بعد الاستعادة، يُفضل إعادة تشغيل الخدمة.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <p className="text-sm text-gray-600">
                    تم إنشاء نسخة احتياطية من حالة النظام قبل الاستعادة (نسخة أمان).
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowRestoreSuccess(false);
                  setRestoreDetails(null);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                حسناً، فهمت
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              النسخ التلقائية
            </h3>
            <p className="text-sm text-blue-700">
              تُنشأ تلقائياً يومياً الساعة 2 صباحاً
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              الاحتفاظ
            </h3>
            <p className="text-sm text-green-700">
              آخر 14 نسخة يومية + 4 نسخ أسبوعية
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              الأمان
            </h3>
            <p className="text-sm text-purple-700">
              نسخة قبل الاستعادة تُنشأ تلقائياً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
