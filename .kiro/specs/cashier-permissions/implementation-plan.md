# خطة تنفيذ صلاحيات الكاشير - Implementation Plan

## نظرة عامة

الخطة مقسمة لـ **3 مراحل** و **15 مهمة**. كل مهمة صغيرة وواضحة.  
الترتيب مهم — كل مهمة تعتمد على اللي قبلها.

---

## المرحلة 1: الأساس (Backend Domain + Data)

> هدف المرحلة: إنشاء الكيانات وقاعدة البيانات وخدمة الصلاحيات

### المهمة 1.1 — إنشاء Permission Enum

**ملف جديد:** `backend/KasserPro.Domain/Enums/Permission.cs`

```csharp
namespace KasserPro.Domain.Enums;

public enum Permission
{
    // نقطة البيع
    PosSell            = 100,
    PosApplyDiscount   = 101,

    // الطلبات
    OrdersView         = 200,
    OrdersRefund       = 201,

    // المنتجات
    ProductsView       = 300,
    ProductsManage     = 301,

    // التصنيفات
    CategoriesView     = 400,
    CategoriesManage   = 401,

    // العملاء
    CustomersView      = 500,
    CustomersManage    = 501,

    // التقارير
    ReportsView        = 600,

    // المصروفات
    ExpensesView       = 700,
    ExpensesCreate     = 701,

    // المخزون
    InventoryView      = 800,

    // الورديات
    ShiftsManage       = 900,

    // الخزينة
    CashRegisterView   = 1000,
}
```

**اختبار:** `dotnet build` ينجح بدون أخطاء.

---

### المهمة 1.2 — إنشاء UserPermission Entity

**ملف جديد:** `backend/KasserPro.Domain/Entities/UserPermission.cs`

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class UserPermission : BaseEntity
{
    public int UserId { get; set; }
    public Permission Permission { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
```

**اختبار:** `dotnet build` ينجح.

---

### المهمة 1.3 — تعديل User Entity

**ملف:** `backend/KasserPro.Domain/Entities/User.cs`

**التعديل:** أضف هذا السطر مع باقي الـ Navigation Properties:

```csharp
public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
```

**اختبار:** `dotnet build` ينجح.

---

### المهمة 1.4 — تعديل DbContext + إنشاء Migration

**ملف:** ابحث عن الـ DbContext الرئيسي (ممكن يكون AppDbContext.cs أو KasserproContext.cs)

**التعديل 1:** أضف DbSet:

```csharp
public DbSet<UserPermission> UserPermissions { get; set; }
```

**التعديل 2:** في `OnModelCreating`، أضف:

```csharp
modelBuilder.Entity<UserPermission>(entity =>
{
    entity.HasIndex(e => new { e.UserId, e.Permission }).IsUnique();

    entity.HasOne(e => e.User)
          .WithMany(u => u.Permissions)
          .HasForeignKey(e => e.UserId)
          .OnDelete(DeleteBehavior.Cascade);

    entity.Property(e => e.Permission)
          .HasConversion<int>();
});
```

**التعديل 3:** أنشئ Migration:

```bash
cd backend/KasserPro.API
dotnet ef migrations add AddUserPermissions --project ../KasserPro.Infrastructure
dotnet ef database update
```

> **ملاحظة:** لو مش مستخدم EF Migrations وبتستخدم schema.sql يدوي، أضف:
> ```sql
> CREATE TABLE IF NOT EXISTS UserPermissions (
>     Id INTEGER PRIMARY KEY AUTOINCREMENT,
>     UserId INTEGER NOT NULL,
>     Permission INTEGER NOT NULL,
>     CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
>     UpdatedAt TEXT,
>     FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
>     UNIQUE(UserId, Permission)
> );
> CREATE INDEX IX_UserPermissions_UserId ON UserPermissions(UserId);
> ```

**اختبار:** `dotnet build` + تأكد إن الجدول اتعمل في الـ Database.

---

### المهمة 1.5 — إنشاء DTOs للصلاحيات

**ملف جديد:** `backend/KasserPro.Application/DTOs/PermissionDtos.cs`

```csharp
namespace KasserPro.Application.DTOs;

public class UserPermissionsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}

public class UpdatePermissionsRequest
{
    public List<string> Permissions { get; set; } = new();
}

public class PermissionInfoDto
{
    public string Key { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string GroupAr { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
```

**اختبار:** `dotnet build` ينجح.

---

### المهمة 1.6 — إنشاء IPermissionService + PermissionService

**ملف جديد:** `backend/KasserPro.Application/Services/Interfaces/IPermissionService.cs`

```csharp
namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs;
using KasserPro.Domain.Enums;

public interface IPermissionService
{
    Task<List<Permission>> GetUserPermissionsAsync(int userId);
    Task<UserPermissionsDto> GetUserPermissionsDtoAsync(int userId);
    Task<List<UserPermissionsDto>> GetAllCashierPermissionsAsync(int tenantId);
    Task UpdateUserPermissionsAsync(int userId, List<Permission> permissions, int adminUserId);
    Task<bool> HasPermissionAsync(int userId, Permission permission);
    List<Permission> GetDefaultCashierPermissions();
    List<PermissionInfoDto> GetAllAvailablePermissions();
}
```

**ملف جديد:** `backend/KasserPro.Application/Services/Implementations/PermissionService.cs`

(الكود الكامل موجود في design.md مع إضافات:)

```csharp
public List<PermissionInfoDto> GetAllAvailablePermissions()
{
    return new List<PermissionInfoDto>
    {
        new() { Key = "PosSell", Group = "POS", GroupAr = "نقطة البيع",
                Description = "Sell from POS", DescriptionAr = "البيع من نقطة البيع", IsDefault = true },
        new() { Key = "PosApplyDiscount", Group = "POS", GroupAr = "نقطة البيع",
                Description = "Apply discounts", DescriptionAr = "تطبيق خصومات" },
        new() { Key = "OrdersView", Group = "Orders", GroupAr = "الطلبات",
                Description = "View orders", DescriptionAr = "عرض الطلبات", IsDefault = true },
        new() { Key = "OrdersRefund", Group = "Orders", GroupAr = "الطلبات",
                Description = "Process refunds", DescriptionAr = "عمل مرتجعات" },
        new() { Key = "ProductsView", Group = "Products", GroupAr = "المنتجات",
                Description = "View products", DescriptionAr = "عرض المنتجات" },
        new() { Key = "ProductsManage", Group = "Products", GroupAr = "المنتجات",
                Description = "Add/Edit/Delete products", DescriptionAr = "إضافة/تعديل/حذف منتجات" },
        // ... وهكذا لكل صلاحية
    };
}
```

**اختبار:** `dotnet build` ينجح.

---

### المهمة 1.7 — تسجيل PermissionService في DI Container

**ملف:** `backend/KasserPro.API/Program.cs`

أضف مع باقي الـ Service registrations:

```csharp
builder.Services.AddScoped<IPermissionService, PermissionService>();
```

**اختبار:** التطبيق يشتغل بدون أخطاء.

---

## المرحلة 2: الحماية (Backend Authorization)

> هدف المرحلة: حماية الـ API endpoints بالصلاحيات الجديدة

### المهمة 2.1 — إنشاء HasPermissionAttribute

**ملف جديد:** `backend/KasserPro.API/Middleware/HasPermissionAttribute.cs`

الكود الكامل موجود في design.md (القسم 4.1).

**اختبار:** `dotnet build` ينجح.

---

### المهمة 2.2 — تعديل AuthService لإضافة Permissions في JWT

**ملف:** `backend/KasserPro.Application/Services/Implementations/AuthService.cs`

**في method توليد الـ Token (عادة `GenerateToken` أو `GenerateJwtToken`):**

1. أضف dependency injection لـ `IPermissionService` في الـ constructor
2. بعد إنشاء الـ claims list الموجودة، أضف:

```csharp
// أضف الصلاحيات كـ claims
var permissions = await _permissionService.GetUserPermissionsAsync(user.Id);
foreach (var perm in permissions)
{
    claims.Add(new Claim("permission", perm.ToString()));
}
```

3. عدّل الـ Login response ليشمل الـ permissions:

```csharp
// في الـ return من LoginAsync:
return new LoginResponse
{
    AccessToken = token,
    ExpiresAt = expiry,
    User = new UserDto
    {
        // ... الحقول الموجودة
        Permissions = permissions.Select(p => p.ToString()).ToList()
    }
};
```

**اختبار:** سجّل دخول بكاشير → تحقق إن الـ response فيه permissions array.

---

### المهمة 2.3 — تعديل تسجيل كاشير جديد

**ملف:** `backend/KasserPro.Application/Services/Implementations/AuthService.cs`

**في method `RegisterAsync`:**

بعد `SaveChangesAsync()` وإنشاء المستخدم بنجاح:

```csharp
if (user.Role == UserRole.Cashier)
{
    var defaultPermissions = _permissionService.GetDefaultCashierPermissions();
    await _permissionService.UpdateUserPermissionsAsync(user.Id, defaultPermissions, currentUserId);
}
```

**اختبار:** سجّل كاشير جديد → تحقق إن عنده الصلاحيات الافتراضية في الـ Database.

---

### المهمة 2.4 — إنشاء PermissionsController

**ملف جديد:** `backend/KasserPro.API/Controllers/PermissionsController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;
    private readonly ICurrentUserService _currentUser;

    // GET api/permissions/available
    [HttpGet("available")]
    public IActionResult GetAvailablePermissions()
    {
        var permissions = _permissionService.GetAllAvailablePermissions();
        return Ok(permissions);
    }

    // GET api/permissions/users
    [HttpGet("users")]
    public async Task<IActionResult> GetAllCashierPermissions()
    {
        var result = await _permissionService
            .GetAllCashierPermissionsAsync(_currentUser.TenantId ?? 0);
        return Ok(result);
    }

    // GET api/permissions/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPermissions(int userId)
    {
        var result = await _permissionService.GetUserPermissionsDtoAsync(userId);
        return Ok(result);
    }

    // PUT api/permissions/user/{userId}
    [HttpPut("user/{userId}")]
    public async Task<IActionResult> UpdateUserPermissions(
        int userId, [FromBody] UpdatePermissionsRequest request)
    {
        var permissions = request.Permissions
            .Select(p => Enum.Parse<Permission>(p))
            .ToList();

        await _permissionService.UpdateUserPermissionsAsync(
            userId, permissions, _currentUser.UserId);

        return Ok(new { message = "تم تحديث الصلاحيات بنجاح" });
    }
}
```

**اختبار:** امتحن الـ endpoints من Postman أو HTTP file.

---

### المهمة 2.5 — تعديل Controllers الموجودة

أضف `[HasPermission]` على الـ endpoints المناسبة:

| Controller | Action | Permission |
|---|---|---|
| **OrdersController** | GET | `OrdersView` |
| **OrdersController** | Refund | `OrdersRefund` |
| **ProductsController** | GET | `ProductsView` |
| **ProductsController** | POST/PUT/DELETE | `ProductsManage` |
| **CategoriesController** | GET | `CategoriesView` |
| **CategoriesController** | POST/PUT/DELETE | `CategoriesManage` |
| **CustomersController** | GET | `CustomersView` |
| **CustomersController** | POST/PUT/DELETE | `CustomersManage` |
| **ReportsController** | GET | `ReportsView` |
| **ExpensesController** | GET | `ExpensesView` |
| **ExpensesController** | POST | `ExpensesCreate` |
| **InventoryController** | GET | `InventoryView` |
| **ShiftsController** | Management endpoints | `ShiftsManage` |
| **CashRegisterController** | GET | `CashRegisterView` |

> **مهم جداً:** لا تحذف `[Authorize]` الموجود. أضف `[HasPermission]` بالإضافة إليه.

> **ملاحظة:** الأدمن يتجاوز كل الـ permissions تلقائياً (الكود في HasPermissionFilter يتحقق من الـ Role).

**اختبار:** سجّل دخول بكاشير بدون صلاحية ProductsView → جرّب GET /api/products → لازم يرجع 403.

---

## المرحلة 3: الواجهة (Frontend)

> هدف المرحلة: عرض الصفحات حسب الصلاحيات + صفحة إدارة الصلاحيات

### المهمة 3.1 — تعديل Types + Auth Slice

**ملف:** `frontend/src/types/auth.types.ts`

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Cashier" | "SystemOwner";
  permissions: string[];  // ← إضافة
}
```

**ملف:** `frontend/src/types/permission.types.ts` (جديد)

```typescript
export interface PermissionInfo {
  key: string;
  group: string;
  groupAr: string;
  description: string;
  descriptionAr: string;
  isDefault: boolean;
}

export interface UserPermissions {
  userId: number;
  userName: string;
  email: string;
  permissions: string[];
}

export interface UpdatePermissionsRequest {
  permissions: string[];
}
```

**اختبار:** `npm run build` ينجح (ممكن يكون في أخطاء types — صلّحها الآن).

---

### المهمة 3.2 — إنشاء usePermission Hook

**ملف جديد:** `frontend/src/hooks/usePermission.ts`

```typescript
import { useAppSelector } from "../store/hooks";
import { selectCurrentUser, selectIsAdmin, selectIsSystemOwner } from "../store/slices/authSlice";

export const usePermission = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSystemOwner = useAppSelector(selectIsSystemOwner);

  const hasPermission = (permission: string): boolean => {
    if (isAdmin || isSystemOwner) return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  return { hasPermission, hasAnyPermission };
};
```

**اختبار:** استخدمه في أي component وتحقق إنه يرجع القيم الصحيحة.

---

### المهمة 3.3 — إنشاء Permissions API

**ملف جديد:** `frontend/src/api/permissionsApi.ts`

```typescript
import { baseApi } from "./baseApi";
import type { PermissionInfo, UserPermissions, UpdatePermissionsRequest } from "../types/permission.types";

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailablePermissions: builder.query<PermissionInfo[], void>({
      query: () => "/permissions/available",
    }),
    getAllCashierPermissions: builder.query<UserPermissions[], void>({
      query: () => "/permissions/users",
      providesTags: ["Permissions"],
    }),
    getUserPermissions: builder.query<UserPermissions, number>({
      query: (userId) => `/permissions/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Permissions", id: userId }],
    }),
    updateUserPermissions: builder.mutation<void, { userId: number; body: UpdatePermissionsRequest }>({
      query: ({ userId, body }) => ({
        url: `/permissions/user/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Permissions"],
    }),
  }),
});

export const {
  useGetAvailablePermissionsQuery,
  useGetAllCashierPermissionsQuery,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
} = permissionsApi;
```

**ملاحظة:** أضف `"Permissions"` في `tagTypes` في `baseApi.ts`.

**اختبار:** `npm run build` ينجح.

---

### المهمة 3.4 — تعديل Route Guards + Sidebar

**ملف:** `frontend/src/App.tsx`

1. أضف `PermissionRoute` component
2. استبدل `AdminRoute` بـ `PermissionRoute` في الصفحات المناسبة
3. ابقِ `AdminRoute` للصفحات اللي فعلاً للأدمن فقط (settings, audit)

**ملف:** `frontend/src/components/layout/MainLayout.tsx`

1. عدّل `navItems` — أضف `permission` property
2. عدّل `filteredNavItems` ليتحقق من `permission` باستخدام `usePermission`

**اختبار:** سجّل دخول بكاشير → لازم يشوف فقط الصفحات اللي عنده صلاحية عليها.

---

### المهمة 3.5 — إنشاء صفحة إدارة الصلاحيات

**ملف جديد:** `frontend/src/pages/settings/PermissionsPage.tsx`

الصفحة فيها:
1. Dropdown أو List لاختيار كاشير
2. Toggle switches مجمّعة حسب الفئة
3. زر حفظ
4. رسالة نجاح/خطأ

**ملف:** `frontend/src/App.tsx` — أضف Route جديد:

```tsx
<Route path="/settings/permissions" element={
  <NonSystemOwnerRoute>
    <AdminRoute>
      <PermissionsPage />
    </AdminRoute>
  </NonSystemOwnerRoute>
} />
```

**اختبار:** سجّل دخول بأدمن → روح لصفحة الصلاحيات → عدّل صلاحيات كاشير → سجّل دخول بالكاشير → تحقق إن الصلاحيات اتغيّرت.

---

## ملخص الملفات

### ملفات جديدة (8 ملفات):

| # | الملف | الطبقة |
|---|---|---|
| 1 | `backend/KasserPro.Domain/Enums/Permission.cs` | Domain |
| 2 | `backend/KasserPro.Domain/Entities/UserPermission.cs` | Domain |
| 3 | `backend/KasserPro.Application/DTOs/PermissionDtos.cs` | Application |
| 4 | `backend/KasserPro.Application/Services/Interfaces/IPermissionService.cs` | Application |
| 5 | `backend/KasserPro.Application/Services/Implementations/PermissionService.cs` | Application |
| 6 | `backend/KasserPro.API/Middleware/HasPermissionAttribute.cs` | API |
| 7 | `backend/KasserPro.API/Controllers/PermissionsController.cs` | API |
| 8 | `frontend/src/pages/settings/PermissionsPage.tsx` | Frontend |

### ملفات جديدة (Frontend فقط — 3 ملفات):

| # | الملف |
|---|---|
| 9 | `frontend/src/types/permission.types.ts` |
| 10 | `frontend/src/hooks/usePermission.ts` |
| 11 | `frontend/src/api/permissionsApi.ts` |

### ملفات معدّلة (7 ملفات):

| # | الملف | التعديل |
|---|---|---|
| 1 | `backend/KasserPro.Domain/Entities/User.cs` | إضافة Permissions navigation |
| 2 | `backend/KasserPro.Infrastructure/Data/AppDbContext.cs` أو `KasserproContext.cs` | إضافة DbSet + Configuration |
| 3 | `backend/KasserPro.Application/Services/Implementations/AuthService.cs` | إضافة permissions في JWT + Register |
| 4 | `backend/KasserPro.API/Program.cs` | تسجيل PermissionService |
| 5 | `frontend/src/types/auth.types.ts` | إضافة permissions للـ User |
| 6 | `frontend/src/App.tsx` | إضافة PermissionRoute + Routes |
| 7 | `frontend/src/components/layout/MainLayout.tsx` | تعديل navItems + filtering |

### Controllers معدّلة (حسب الحاجة):

كل Controller اللي فيه `[Authorize(Roles = "Admin")]` يحتاج إضافة `[HasPermission]`.

---

## نصائح للتنفيذ

1. **نفّذ مرحلة مرحلة** — لا تبدأ المرحلة 2 قبل ما تتأكد المرحلة 1 شغالة
2. **اختبر كل مهمة** — بعد كل مهمة، شغّل `dotnet build` أو `npm run build`
3. **ابدأ بـ Controller واحد** — جرّب على OrdersController أول، وبعدين عمّم
4. **استخدم Postman** — جرّب الـ API endpoints يدوي قبل ما تبني الـ Frontend
5. **خلي SecurityStamp** — هذا هو الصديق — يضمن إن الكاشير يحصل على صلاحيات محدّثة
