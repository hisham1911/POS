import { useRef, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download01 as Download,
  Folder as FolderOpen,
  HardDrive,
  RefreshCcw01 as RefreshCw,
  Upload01 as Upload,
} from "@untitledui/icons";

import {
  type BackupInfo,
  useCreateBackupMutation,
  useDownloadBackupMutation,
  useListBackupsQuery,
  useRestoreBackupMutation,
  useRestoreFromUploadMutation,
} from "@/api/backupApi";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/Loading";
import { Portal } from "@/components/common/Portal";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const BackupPage = () => {
  const { data: backupsData, isLoading, refetch } = useListBackupsQuery();
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] =
    useRestoreBackupMutation();
  const [downloadBackup] = useDownloadBackupMutation();
  const [restoreFromUpload, { isLoading: isUploadRestoring }] =
    useRestoreFromUploadMutation();

  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [restoreDetails, setRestoreDetails] = useState<{
    migrationsApplied: number;
    requiresRestart: boolean;
    dataValidationIssuesFound: number;
  } | null>(null);

  // Upload / Import state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showConfirmUploadRestore, setShowConfirmUploadRestore] =
    useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadBackup = async (fileName: string) => {
    try {
      setDownloadingFile(fileName);
      const blob = await downloadBackup(fileName).unwrap();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success("تم تنزيل الملف بنجاح");
    } catch (error) {
      toast.error("فشل تنزيل الملف");
      console.error(error);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".db")) {
      toast.error("يجب اختيار ملف نسخة احتياطية بامتداد .db");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploadedFile(file);
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFromUpload = async () => {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const result = await restoreFromUpload(formData).unwrap();

      if (result.success) {
        setShowConfirmUploadRestore(false);
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        setRestoreDetails({
          migrationsApplied: result.migrationsApplied || 0,
          requiresRestart: result.requiresRestart ?? true,
          dataValidationIssuesFound: result.dataValidationIssuesFound || 0,
        });
        setShowRestoreSuccess(true);

        if (result.migrationsApplied > 0) {
          toast.success(
            `تم استعادة الملف المرفوع بنجاح وتطبيق ${result.migrationsApplied} تحديث على قاعدة البيانات`,
          );
        } else {
          toast.success("تم استعادة الملف المرفوع بنجاح");
        }
        refetch();
      } else {
        toast.error(
          result.errorMessage || "فشلت عملية الاستعادة من الملف المرفوع",
        );
        if (result.maintenanceModeEnabled) {
          toast.error("النظام في وضع الصيانة - يرجى إعادة تشغيل التطبيق");
        }
        setShowConfirmUploadRestore(false);
      }
    } catch (error) {
      toast.error("خطأ في استعادة الملف المرفوع - يرجى إعادة تشغيل التطبيق");
      console.error(error);
      setShowConfirmUploadRestore(false);
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

        setRestoreDetails({
          migrationsApplied: result.migrationsApplied || 0,
          requiresRestart: result.requiresRestart ?? true,
          dataValidationIssuesFound: result.dataValidationIssuesFound || 0,
        });
        setShowRestoreSuccess(true);

        if (result.migrationsApplied > 0) {
          toast.success(
            `تم استعادة النسخة الاحتياطية بنجاح وتطبيق ${result.migrationsApplied} تحديث على قاعدة البيانات`,
          );
        } else {
          toast.success("تم استعادة النسخة الاحتياطية بنجاح");
        }

        refetch();
      } else {
        toast.error(result.errorMessage || "فشلت عملية الاستعادة");
        if (result.maintenanceModeEnabled) {
          toast.error("النظام في وضع الصيانة - يرجى إعادة تشغيل التطبيق");
        }
        setShowConfirmRestore(false);
      }
    } catch (error) {
      toast.error(
        "خطأ في استعادة النسخة الاحتياطية - يرجى إعادة تشغيل التطبيق",
      );
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
        return "bg-blue-500/10 text-blue-500";
      case "pre-restore":
        return "bg-purple-500/10 text-purple-500";
      case "daily-scheduled":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
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
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <HardDrive className="size-8 text-primary" />
              إدارة النسخ الاحتياطية
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              قم بإنشاء النسخ الاحتياطية أو استعادة نسخة محفوظة من قاعدة البيانات للحفاظ على سلامة بيانات المؤسسة
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4 p-5">
          <div className="mb-4 flex items-center gap-2 text-foreground">
            <Download className="size-5 text-primary" />
            <h3 className="font-bold">إنشاء نسخة جديدة</h3>
          </div>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            أنشئ نسخة احتياطية فورية من قاعدة البيانات الحالية لضمان حفظ حالة النظام.
          </p>
          <Button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="w-full justify-center"
            size="lg"
            leftIcon={isCreating ? <RefreshCw className="size-5 animate-spin" /> : <Download className="size-5" />}
          >
            {isCreating ? "جاري الإنشاء..." : "إنشاء نسخة احتياطية الآن"}
          </Button>
        </Card>

        <Card className="lg:col-span-5 p-5">
          <div className="mb-4 flex items-center gap-2 text-foreground">
            <FolderOpen className="size-5 text-indigo-500" />
            <h3 className="font-bold">استيراد نسخة احتياطية من جهازك</h3>
          </div>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            اختر ملف بصيغة .db مسحوب مسبقاً لاستعادته في النظام.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".db"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div
              className="flex h-11 w-full items-center justify-start truncate rounded-xl border border-border bg-background/50 px-3 text-sm font-mono text-muted-foreground"
              title={uploadedFile ? uploadedFile.name : "لم يتم اختيار ملف بعد"}
              dir="ltr"
            >
              {uploadedFile
                ? `${uploadedFile.name} (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)`
                : "لم يتم اختيار ملف بعد"}
            </div>

            <div className="flex w-full sm:w-auto shrink-0 gap-2">
              <Button
                variant="outline"
                onClick={handleOpenFilePicker}
                className="flex-1 sm:flex-none"
              >
                اختيار
              </Button>
              <Button
                onClick={() => {
                  if (!uploadedFile) {
                    toast.error("يرجى اختيار ملف أولاً");
                    return;
                  }
                  setShowConfirmUploadRestore(true);
                }}
                disabled={!uploadedFile || isUploadRestoring}
                className="flex-1 sm:flex-none"
                leftIcon={<Upload className="size-4" />}
              >
                استعادة
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-center border-warning/30 bg-warning/5 p-5 lg:col-span-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-6 text-warning shrink-0" />
            <div>
              <p className="font-bold text-foreground">تنبيه مهم:</p>
              <p className="mt-1 text-sm font-medium text-warning">
                تأكد من عمل نسخة احتياطية منتظمة يومياً وتنزيلها للحفظ في مساحة خارجية
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">
              قائمة النسخ الاحتياطية
            </h2>
          </div>
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {backups.length} نسخة
          </span>
        </div>

        {backups.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <HardDrive className="mx-auto mb-4 size-12 opacity-50" />
            <p className="text-lg font-medium">لا توجد نسخ احتياطية مسجلة</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-right">اسم الملف</TableHeaderCell>
                  <TableHeaderCell className="text-right">الحجم</TableHeaderCell>
                  <TableHeaderCell className="text-right">التاريخ والوقت</TableHeaderCell>
                  <TableHeaderCell className="text-right">النوع</TableHeaderCell>
                  <TableHeaderCell className="text-center w-52">الإجراءات</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backups.map((backup: BackupInfo, index: number) => (
                  <TableRow
                    key={backup.fileName || index}
                    className={clsx(
                      "transition-colors",
                      selectedBackup === backup.fileName && "bg-primary/5 border-primary/20",
                    )}
                  >
                    <TableCell className="font-mono text-sm max-w-[280px]">
                      <div
                        className="cursor-pointer font-bold text-foreground hover:text-primary transition-colors truncate"
                        dir="ltr"
                        title={backup.fileName}
                        onClick={() =>
                          setSelectedBackup(
                            selectedBackup === backup.fileName
                              ? null
                              : backup.fileName,
                          )
                        }
                      >
                        {backup.fileName}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground font-medium">
                      <span dir="ltr">{formatFileSize(backup.sizeBytes)}</span>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground font-medium">
                      <span dir="ltr">{formatDate(backup.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={clsx(
                          "inline-block rounded-full px-2.5 py-1 text-xs font-bold leading-none",
                          getReasonBadgeColor(backup.reason),
                        )}
                      >
                        {getReasonLabel(backup.reason)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleDownloadBackup(backup.fileName)}
                          disabled={downloadingFile === backup.fileName}
                          className="h-8 gap-1.5 px-3 hover:bg-primary/10 hover:text-primary"
                        >
                          {downloadingFile === backup.fileName ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                          <span className="text-xs">تنزيل</span>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedBackup(backup.fileName);
                            setShowConfirmRestore(true);
                          }}
                          disabled={isRestoring}
                          className="h-8 gap-1.5 px-3 hover:bg-success/10 hover:text-success"
                        >
                          <Upload className="size-3.5" />
                          <span className="text-xs">استعادة</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal - restore from server backup */}
      {showConfirmRestore && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-right shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="size-6 text-warning" />
                <h3 className="text-lg font-bold text-foreground">
                  تأكيد الاستعادة
                </h3>
              </div>

              <p className="mb-6 font-medium text-muted-foreground">
                هل أنت متأكد من رغبتك في استعادة النسخة الاحتياطية المحددة؟ هذه العملية ستلغي البيانات الحالية.
              </p>

              <div className="mb-8 rounded-xl border border-warning/20 bg-warning/10 p-4">
                <p className="mb-2 text-sm font-bold text-foreground">
                  ملف النسخة المستهدفة:
                </p>
                <p className="font-mono text-sm font-medium text-warning break-all" dir="ltr">
                  {selectedBackup}
                </p>
                <p className="mt-4 text-xs font-semibold text-warning/80">
                  ⚠️ سيتم إنشاء نسخة احتياطية من حالة النظام الحالية لحمايتها قبل الاستعادة.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmRestore(false);
                    setSelectedBackup(null);
                  }}
                  disabled={isRestoring}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleRestoreBackup}
                  disabled={isRestoring}
                  className="flex-1 border-warning bg-warning text-warning-foreground hover:bg-warning/90"
                  leftIcon={isRestoring ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                >
                  {isRestoring ? "جاري..." : "نعم، استعادة الآن"}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Confirmation Modal - restore from uploaded file */}
      {showConfirmUploadRestore && uploadedFile && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-right shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="size-6 text-indigo-500" />
                <h3 className="text-lg font-bold text-foreground">
                  تأكيد الاستعادة من ملف خارجي
                </h3>
              </div>

              <p className="mb-6 font-medium text-muted-foreground">
                هل أنت متأكد من رغبتك في استعادة قاعدة البيانات من الملف المرفوع المختار؟ جميع البيانات الحالية ستتغير.
              </p>

              <div className="mb-8 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <p className="mb-2 text-sm font-bold text-foreground">
                  الملف المختار:
                </p>
                <p className="font-mono text-sm font-medium text-indigo-500 break-all" dir="ltr">
                  {uploadedFile.name}
                </p>
                <p className="font-mono mt-1 text-xs font-medium text-indigo-500/80">
                  الحجم: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="mt-4 text-xs font-semibold text-indigo-500/80">
                  ⚠️ سيتم إنشاء نسخة احتياطية من حالة النظام الحالية قبل الاستعادة
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmUploadRestore(false);
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={isUploadRestoring}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleRestoreFromUpload}
                  disabled={isUploadRestoring}
                  className="flex-1 border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600"
                  leftIcon={isUploadRestoring ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                >
                  {isUploadRestoring ? "جاري..." : "نعم، استعادة الآن"}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Restore Success Modal */}
      {showRestoreSuccess && restoreDetails && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-right shadow-2xl">
              <div className="mb-6 flex items-center justify-center pb-4 border-b border-border">
                <div className="flex size-16 items-center justify-center rounded-full bg-success/20 text-success">
                  <CheckCircle className="size-8" />
                </div>
              </div>
              <h3 className="mb-2 text-center text-2xl font-black text-foreground">
                تمت الاستعادة بنجاح
              </h3>

              <div className="my-6 space-y-3">
                {restoreDetails.migrationsApplied > 0 && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="mb-1 text-sm font-bold text-blue-500">
                      تحديث قاعدة البيانات
                    </p>
                    <p className="text-sm font-medium text-blue-500/80">
                      تم تطبيق{" "}
                      <span className="font-mono font-black">{restoreDetails.migrationsApplied}</span>{" "}
                      تحديث على الجداول تلقائياً (النسخة التي تم استعادتها كانت أقدم).
                    </p>
                  </div>
                )}

                {restoreDetails.dataValidationIssuesFound > 0 && (
                  <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                    <p className="mb-1 text-sm font-bold text-warning">
                      ⚠️ اكتشاف {restoreDetails.dataValidationIssuesFound} مشكلة
                    </p>
                    <p className="text-sm font-medium text-warning/80">
                      تم اكتشاف بيانات استلزمت التحقق. يُفضل مراجعة النظام والتأكد من مطابقة السجلات.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                  <p className="mb-1 text-sm font-bold text-warning">
                    ⚠️ يُنصح بإعادة تشغيل التطبيق
                  </p>
                  <p className="text-sm font-medium text-warning/80">
                    لضمان عمل التطبيق وقراءة البيانات الجديدة فوراً بشكل صحيح يُفضل إغلاق التطبيق وإعادة تشغيله.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => {
                  setShowRestoreSuccess(false);
                  setRestoreDetails(null);
                }}
                className="w-full justify-center border-success bg-success text-success-foreground hover:bg-success/90"
              >
                حسناً، فهمت
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default BackupPage;
