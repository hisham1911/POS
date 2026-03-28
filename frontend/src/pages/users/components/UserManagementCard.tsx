import { useState } from "react";
import { Edit01, Plus, Trash01, Power01 } from "@untitledui/icons";
import { toast } from "react-hot-toast";

import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useToggleUserStatusMutation,
} from "../../../api/usersApi";
import { Loading } from "../../../components/common/Loading";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui/table";
import type { UserDto } from "../../../types/user.types";
import UserFormModal from "./UserFormModal";
import { cn } from "@/lib/utils";

export default function UserManagementCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);

  const { data: usersData, isLoading } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();

  const users = usersData?.data || [];

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟`)) return;

    try {
      await deleteUser(userId).unwrap();
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      toast.error("فشل حذف المستخدم");
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await toggleStatus({ id: userId, data: { isActive: !currentStatus } }).unwrap();
      toast.success(currentStatus ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
    } catch (error) {
      toast.error("فشل تغيير حالة المستخدم");
    }
  };

  const handleEdit = (user: UserDto) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/10">
          <h2 className="text-xl font-bold text-foreground">قائمة المستخدمين في الفرع</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="size-5" />}
          >
            إضافة مستخدم جديد
          </Button>
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
                <TableHeaderCell className="text-right">الإجراءات</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">{user.name}</TableCell>
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    <span dir="ltr">{user.phone || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[11px] font-bold leading-none",
                        user.role === "Admin"
                          ? "bg-secondary/10 text-secondary"
                          : user.role === "SystemOwner"
                            ? "bg-danger/10 text-danger"
                            : "bg-primary/10 text-primary",
                      )}
                    >
                      {user.role === "Admin"
                        ? "مدير"
                        : user.role === "SystemOwner"
                          ? "مالك النظام"
                          : "كاشير"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {user.role === "Admin" ? "كل الفروع" : user.branchName || "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[11px] font-bold leading-none",
                        user.isActive
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {user.isActive ? "نشط" : "معطل"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="تعديل"
                      >
                        <Edit01 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={cn(
                          "size-8 text-muted-foreground",
                          user.isActive
                            ? "hover:text-warning hover:bg-warning/10"
                            : "hover:text-success hover:bg-success/10",
                        )}
                        title={user.isActive ? "تعطيل" : "تفعيل"}
                      >
                        <Power01 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id, user.name)}
                        className="size-8 text-muted-foreground hover:text-danger hover:bg-danger/10"
                        title="حذف"
                      >
                        <Trash01 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    لا يوجد مستخدمين حالياً
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {isModalOpen && (
        <UserFormModal user={editingUser} onClose={handleCloseModal} />
      )}
    </>
  );
}
