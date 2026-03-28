import { useState } from 'react';
import { toast } from 'sonner';
import {
  Building02,
  CheckCircle,
  Edit01,
  Lock01,
  SearchLg,
  Users01,
  XCircle,
} from '@untitledui/icons';

import {
  SystemUser,
  useGetAllSystemUsersQuery,
  useResetSystemUserPasswordMutation,
  useToggleSystemUserStatusMutation,
  useUpdateSystemUserMutation,
} from '../../api/systemUsersApi';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/common/Modal'; // Assuming keeping common modal or use standard dialog
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../components/ui/table';
import { MetricCard } from '../../components/app/metric-card';
import { cn } from '../../lib/utils';

export default function SystemUsersPage() {
  const { data: users, isLoading, error } = useGetAllSystemUsersQuery();
  const [updateUser] = useUpdateSystemUserMutation();
  const [toggleStatus] = useToggleSystemUserStatusMutation();
  const [resetPassword] = useResetSystemUserPasswordMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [newPassword, setNewPassword] = useState('');

  const handleEditClick = (user: SystemUser) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    try {
      await updateUser({
        userId: selectedUser.id,
        data: editForm,
      }).unwrap();
      toast.success('تم تحديث بيانات المستخدم بنجاح');
      setEditDialogOpen(false);
    } catch (err) {
      toast.error('فشل تحديث بيانات المستخدم');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await toggleStatus(userId).unwrap();
      toast.success('تم تغيير حالة المستخدم بنجاح');
    } catch (err) {
      toast.error('فشل تغيير حالة المستخدم');
    }
  };

  const handlePasswordClick = (user: SystemUser) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await resetPassword({
        userId: selectedUser.id,
        data: { newPassword },
      }).unwrap();
      toast.success('تم إعادة تعيين كلمة المرور بنجاح');
      setPasswordDialogOpen(false);
      setNewPassword('');
    } catch (err) {
      toast.error('فشل إعادة تعيين كلمة المرور');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SystemOwner':
        return 'bg-danger/10 text-danger';
      case 'Admin':
        return 'bg-primary/10 text-primary';
      case 'Cashier':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SystemOwner':
        return 'مالك النظام';
      case 'Admin':
        return 'مدير';
      case 'Cashier':
        return 'كاشير';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  // Filter users by search term
  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group users by tenant
  const groupedUsers = filteredUsers?.reduce((acc, user) => {
    const tenantName = user.tenantName || 'System';
    if (!acc[tenantName]) {
      acc[tenantName] = [];
    }
    acc[tenantName].push(user);
    return acc;
  }, {} as Record<string, SystemUser[]>);

  const activeUsersCount = users?.filter((u) => u.isActive).length || 0;
  const inactiveUsersCount = users?.filter((u) => !u.isActive).length || 0;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <Users01 className="size-8 text-primary" />
              إدارة المستخدمين
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة جميع مستخدمي النظام عبر جميع المحلات والفروع.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="إجمالي المستخدمين"
          value={users?.length || 0}
          description="جميع الحسابات المسجلة"
          icon={Users01}
        />
        <MetricCard
          title="مستخدم نشط"
          value={activeUsersCount}
          description="الحسابات الفعالة على النظام"
          icon={CheckCircle}
          tone="success"
        />
        <MetricCard
          title="مستخدم غير نشط"
          value={inactiveUsersCount}
          description="الحسابات المعطلة حالياً"
          icon={XCircle}
          tone="danger"
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-xl">
              <SearchLg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="بحث بالاسم أو البريد أو المحل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        {groupedUsers &&
          Object.entries(groupedUsers).map(([tenantName, tenantUsers]) => (
            <Card key={tenantName} className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border bg-muted/10 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building02 className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{tenantName}</h2>
                  <span className="text-sm font-medium text-muted-foreground">
                    {tenantUsers.length} مستخدم
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-right">الاسم</TableHeaderCell>
                      <TableHeaderCell className="text-right">البريد الإلكتروني</TableHeaderCell>
                      <TableHeaderCell className="text-right">الهاتف</TableHeaderCell>
                      <TableHeaderCell className="text-right">الدور</TableHeaderCell>
                      <TableHeaderCell className="text-right">الفرع</TableHeaderCell>
                      <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                      <TableHeaderCell className="text-center w-32">الإجراءات</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenantUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-semibold text-foreground">
                          {user.name}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground text-sm font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground text-sm">
                          <span dir="ltr">{user.phone || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none',
                              getRoleBadgeColor(user.role)
                            )}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium text-sm">
                          {user.branchName || '-'}
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-success/10 text-success leading-none">
                              <CheckCircle className="size-3" />
                              نشط
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground leading-none">
                              <XCircle className="size-3" />
                              غير نشط
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(user)}
                              className="size-8 text-muted-foreground hover:text-primary"
                              title="تعديل بيانات المستخدم"
                            >
                              <Edit01 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePasswordClick(user)}
                              className="size-8 text-muted-foreground hover:text-warning"
                              title="إعادة تعيين كلمة المرور"
                            >
                              <Lock01 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={user.role === 'SystemOwner'}
                              className={cn(
                                "size-8",
                                user.role === 'SystemOwner'
                                  ? 'text-muted-foreground/30 cursor-not-allowed opacity-50'
                                  : user.isActive
                                  ? 'text-muted-foreground hover:bg-danger/10 hover:text-danger'
                                  : 'text-muted-foreground hover:bg-success/10 hover:text-success'
                              )}
                              title={user.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                            >
                              {user.isActive ? (
                                <XCircle className="size-4" />
                              ) : (
                                <CheckCircle className="size-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))}
      </div>

      <Modal
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="تعديل بيانات المستخدم"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">الاسم</label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">البريد الإلكتروني</label>
            <Input
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">الهاتف</label>
            <Input
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditSubmit}>حفظ</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        title="إعادة تعيين كلمة المرور"
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
            <p className="text-sm font-bold text-warning">
              سيتم إعادة تعيين كلمة المرور للمستخدم: {selectedUser?.name}
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">كلمة المرور الجديدة</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الحالية هنا"
              className="font-mono text-left"
              dir="ltr"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setPasswordDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={!newPassword}>
              إعادة تعيين
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
