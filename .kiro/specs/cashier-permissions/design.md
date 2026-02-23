# التصميم التقني - نظام صلاحيات الكاشير

## نظرة عامة على المعمارية

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Auth Slice   │  │ Permission   │  │   Route Guards        │  │
│  │ (user +       │  │  Hook        │  │   PermissionRoute     │  │
│  │  permissions) │  │ usePermission│  │   (replaces AdminRoute│  │
│  └──────┬───────┘  └──────┬───────┘  │    for cashier check) │  │
│         │                 │          └───────────────────────┘  │
│         └────────┬────────┘                                     │
│                  │                                               │
│    ┌─────────────▼──────────────┐                               │
│    │  صفحة إدارة الصلاحيات      │                               │
│    │  (في الإعدادات)             │                               │
│    │  Admin → اختار كاشير →     │                               │
│    │  فعّل/عطّل صلاحيات         │                               │
│    └────────────────────────────┘                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (JWT + permissions in token)
┌──────────────────────────▼──────────────────────────────────────┐
│                        Backend (.NET 8)                          │
│                                                                  │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Permission       │  │ [HasPermission]│  │ UserPermission   │  │
│  │ Enum             │  │  Attribute     │  │ Entity + Table   │  │
│  │ (كل الصلاحيات)   │  │ (Authorization │  │ (في الـ Database)│  │
│  │                  │  │  Filter)       │  │                  │  │
│  └──────────────────┘  └───────────────┘  └──────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              PermissionService                                ││
│  │  - GetUserPermissions(userId)                                 ││
│  │  - UpdateUserPermissions(userId, permissions)                 ││
│  │  - HasPermission(userId, permission)                          ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. طبقة الـ Domain (الكيانات)

### 1.1 Permission Enum (جديد)

**ملف:** `backend/KasserPro.Domain/Enums/Permission.cs`

```csharp
namespace KasserPro.Domain.Enums;

/// <summary>
/// الصلاحيات الدقيقة التي يمكن تعيينها للكاشير.
/// الأدمن يحصل على كل الصلاحيات تلقائياً.
/// </summary>
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

> **ليه الأرقام بالمئات؟** عشان لو احتجنا نضيف صلاحية جديدة في نفس المجموعة بعدين (مثلاً `OrdersEdit = 202`)، الأرقام تفضل مرتبة ومنطقية. هذا Pattern شائع اسمه "gapped numbering".

### 1.2 UserPermission Entity (جديد)

**ملف:** `backend/KasserPro.Domain/Entities/UserPermission.cs`

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

/// <summary>
/// يربط صلاحية معينة بمستخدم معين.
/// كل سطر = صلاحية واحدة مفعّلة لمستخدم واحد.
/// </summary>
public class UserPermission : BaseEntity
{
    public int UserId { get; set; }
    public Permission Permission { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
```

### 1.3 تعديل User Entity (إضافة Navigation Property)

**ملف:** `backend/KasserPro.Domain/Entities/User.cs` — إضافة سطر واحد:

```csharp
// أضف مع الـ Navigation Properties الموجودة:
public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
```

**ليه جدول منفصل بدل JSON column؟**
- الأداء: EF Core يقدر يعمل query فعّال (مثلاً: "كل المستخدمين اللي عندهم صلاحية التقارير")
- الـ Migration: إضافة صلاحية جديدة ما تحتاج تعدّل بيانات موجودة
- الـ Indexing: ممكن نعمل index على (UserId, Permission) لسرعة البحث

---

## 2. طبقة البيانات (Infrastructure)

### 2.1 تعديل AppDbContext

**ملف:** `backend/KasserPro.Infrastructure/Data/AppDbContext.cs` أو `backend/KasserPro.API/KasserproContext.cs`

```csharp
// إضافة DbSet
public DbSet<UserPermission> UserPermissions { get; set; }

// في OnModelCreating:
modelBuilder.Entity<UserPermission>(entity =>
{
    entity.HasIndex(e => new { e.UserId, e.Permission })
          .IsUnique();  // منع تكرار نفس الصلاحية لنفس المستخدم

    entity.HasOne(e => e.User)
          .WithMany(u => u.Permissions)
          .HasForeignKey(e => e.UserId)
          .OnDelete(DeleteBehavior.Cascade);  // لو حذفت المستخدم، تتحذف صلاحياته

    entity.Property(e => e.Permission)
          .HasConversion<int>();  // تخزين كـ integer في الـ Database
});
```

### 2.2 Migration

```bash
cd backend/KasserPro.API
dotnet ef migrations add AddUserPermissions
dotnet ef database update
```

---

## 3. طبقة التطبيق (Application)

### 3.1 PermissionService (جديد)

**ملف:** `backend/KasserPro.Application/Services/Interfaces/IPermissionService.cs`

```csharp
public interface IPermissionService
{
    /// <summary>
    /// جلب كل صلاحيات مستخدم معيّن
    /// </summary>
    Task<List<Permission>> GetUserPermissionsAsync(int userId);

    /// <summary>
    /// تحديث صلاحيات مستخدم (حذف القديمة + إضافة الجديدة)
    /// </summary>
    Task UpdateUserPermissionsAsync(int userId, List<Permission> permissions);

    /// <summary>
    /// هل المستخدم عنده صلاحية معينة؟
    /// الأدمن يرجع true دائماً
    /// </summary>
    Task<bool> HasPermissionAsync(int userId, Permission permission);

    /// <summary>
    /// الصلاحيات الافتراضية للكاشير الجديد
    /// </summary>
    List<Permission> GetDefaultCashierPermissions();
}
```

**ملف:** `backend/KasserPro.Application/Services/Implementations/PermissionService.cs`

```csharp
public class PermissionService : IPermissionService
{
    private readonly AppDbContext _context;

    private static readonly List<Permission> DefaultCashierPermissions = new()
    {
        Permission.PosSell,
        Permission.OrdersView,
    };

    public List<Permission> GetDefaultCashierPermissions()
        => DefaultCashierPermissions.ToList();

    public async Task<List<Permission>> GetUserPermissionsAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return new();

        // الأدمن = كل الصلاحيات
        if (user.Role == UserRole.Admin || user.Role == UserRole.SystemOwner)
            return Enum.GetValues<Permission>().ToList();

        return await _context.UserPermissions
            .Where(up => up.UserId == userId)
            .Select(up => up.Permission)
            .ToListAsync();
    }

    public async Task UpdateUserPermissionsAsync(int userId, List<Permission> permissions)
    {
        // حذف الصلاحيات القديمة
        var existing = await _context.UserPermissions
            .Where(up => up.UserId == userId)
            .ToListAsync();

        _context.UserPermissions.RemoveRange(existing);

        // إضافة الجديدة
        var newPermissions = permissions.Select(p => new UserPermission
        {
            UserId = userId,
            Permission = p
        });

        _context.UserPermissions.AddRange(newPermissions);
        await _context.SaveChangesAsync();

        // تحديث SecurityStamp عشان نجبر الكاشير يسجّل دخول من جديد
        // ويحصل على Token جديد بالصلاحيات المحدّثة
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.UpdateSecurityStamp();
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> HasPermissionAsync(int userId, Permission permission)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (user.Role == UserRole.Admin || user.Role == UserRole.SystemOwner)
            return true;

        return await _context.UserPermissions
            .AnyAsync(up => up.UserId == userId && up.Permission == permission);
    }
}
```

### 3.2 DTOs (جديد)

**ملف:** `backend/KasserPro.Application/DTOs/PermissionDto.cs`

```csharp
public class UserPermissionsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}

public class UpdatePermissionsRequest
{
    public List<string> Permissions { get; set; } = new();
}

public class PermissionInfo
{
    public string Key { get; set; } = string.Empty;      // "pos.sell"
    public string Group { get; set; } = string.Empty;     // "نقطة البيع"
    public string Description { get; set; } = string.Empty; // "البيع من نقطة البيع"
    public bool IsDefault { get; set; }                    // true = مفعّل بالافتراض
}
```

### 3.3 تعديل AuthService — إضافة Permissions للـ JWT

**ملف:** `backend/KasserPro.Application/Services/Implementations/AuthService.cs`

عند توليد الـ JWT Token، أضف الصلاحيات كـ claim:

```csharp
// بعد إضافة الـ claims الموجودة:
var permissions = await _permissionService.GetUserPermissionsAsync(user.Id);
foreach (var permission in permissions)
{
    claims.Add(new Claim("permission", permission.ToString()));
}
```

> **ليه في الـ Token؟** عشان الـ Backend يقدر يتحقق بسرعة بدون ما يروح للـ Database كل مرة. والـ Frontend يقرأ الصلاحيات من الـ Token مباشرة.

### 3.4 تعديل تسجيل كاشير جديد

**ملف:** `backend/KasserPro.Application/Services/Implementations/AuthService.cs`

في `RegisterAsync`، بعد إنشاء المستخدم:

```csharp
// بعد _context.Users.Add(user) و SaveChanges:
if (user.Role == UserRole.Cashier)
{
    var defaultPermissions = _permissionService.GetDefaultCashierPermissions();
    await _permissionService.UpdateUserPermissionsAsync(user.Id, defaultPermissions);
}
```

---

## 4. طبقة الـ API (Controllers + Authorization)

### 4.1 HasPermissionAttribute (جديد)

**ملف:** `backend/KasserPro.API/Middleware/HasPermissionAttribute.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using KasserPro.Domain.Enums;

/// <summary>
/// Attribute للتحقق من صلاحية معينة.
/// الأدمن يتجاوز تلقائياً.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class HasPermissionAttribute : TypeFilterAttribute
{
    public HasPermissionAttribute(Permission permission)
        : base(typeof(HasPermissionFilter))
    {
        Arguments = new object[] { permission };
    }
}

public class HasPermissionFilter : IAsyncAuthorizationFilter
{
    private readonly Permission _permission;

    public HasPermissionFilter(Permission permission)
    {
        _permission = permission;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        // غير مسجّل دخول
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // الأدمن و SystemOwner يتجاوزون
        var role = user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Admin" || role == "SystemOwner")
            return;

        // تحقق من الصلاحية في الـ JWT claims
        var permissions = user.FindAll("permission")
            .Select(c => c.Value)
            .ToList();

        if (!permissions.Contains(_permission.ToString()))
        {
            context.Result = new ForbidResult();
            return;
        }
    }
}
```

### 4.2 استخدام الـ Attribute في Controllers

**مثال — OrdersController:**

```csharp
// الطريقة القديمة:
[Authorize]
[HttpGet]
public async Task<IActionResult> GetOrders() { ... }

[Authorize(Roles = "Admin,Manager")]
[HttpPost("refund")]
public async Task<IActionResult> Refund() { ... }

// الطريقة الجديدة:
[Authorize]
[HasPermission(Permission.OrdersView)]
[HttpGet]
public async Task<IActionResult> GetOrders() { ... }

[Authorize]
[HasPermission(Permission.OrdersRefund)]
[HttpPost("refund")]
public async Task<IActionResult> Refund() { ... }
```

> **ملاحظة مهمة:** نحتفظ بـ `[Authorize]` عشان يتحقق من الـ JWT أولاً، وبعدين `[HasPermission]` يتحقق من الصلاحية الدقيقة.

### 4.3 PermissionsController (جديد)

**ملف:** `backend/KasserPro.API/Controllers/PermissionsController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]  // الأدمن فقط يقدر يتحكم في الصلاحيات
public class PermissionsController : ControllerBase
{
    // GET /api/permissions/available
    // → يرجع قائمة بكل الصلاحيات المتاحة (مع الوصف بالعربي)

    // GET /api/permissions/user/{userId}
    // → يرجع صلاحيات كاشير معيّن

    // PUT /api/permissions/user/{userId}
    // → تحديث صلاحيات كاشير معيّن

    // GET /api/permissions/users
    // → يرجع كل الكاشيرات مع صلاحياتهم (لصفحة الإعدادات)
}
```

---

## 5. الـ Frontend

### 5.1 تعديل الـ Types

**ملف:** `frontend/src/types/auth.types.ts`

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Cashier" | "SystemOwner";
  permissions: string[];  // ← جديد
}
```

### 5.2 تعديل Login Response

الـ Backend لازم يرجع الـ permissions مع الـ Login response:

```typescript
export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: User;  // الآن تشمل permissions
}
```

### 5.3 Permission Hook (جديد)

**ملف:** `frontend/src/hooks/usePermission.ts`

```typescript
import { useAppSelector } from "../store/hooks";
import { selectCurrentUser, selectIsAdmin } from "../store/slices/authSlice";

export const usePermission = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);

  const hasPermission = (permission: string): boolean => {
    // الأدمن دائماً عنده كل الصلاحيات
    if (isAdmin) return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  return { hasPermission };
};
```

### 5.4 تعديل Route Guards

**ملف:** `frontend/src/App.tsx`

إضافة `PermissionRoute` بجانب `AdminRoute`:

```typescript
const PermissionRoute = ({
  children,
  permission
}: {
  children: React.ReactNode;
  permission: string;
}) => {
  const { hasPermission } = usePermission();
  if (!hasPermission(permission)) return <Navigate to="/pos" replace />;
  return <>{children}</>;
};
```

**استخدامها:**

```tsx
// الطريقة القديمة:
<AdminRoute><ProductsPage /></AdminRoute>

// الطريقة الجديدة:
<PermissionRoute permission="ProductsView">
  <ProductsPage />
</PermissionRoute>
```

> **ملاحظة:** `AdminRoute` يظل موجود للصفحات اللي فعلاً محصورة على الأدمن (مثل الإعدادات، إدارة المستخدمين).

### 5.5 تعديل Sidebar

**ملف:** `frontend/src/components/layout/MainLayout.tsx`

```typescript
const navItems = [
  { path: "/pos", label: "نقطة البيع", icon: ShoppingCart, permission: "PosSell" },
  { path: "/orders", label: "الطلبات", icon: ClipboardList, permission: "OrdersView" },
  { path: "/shift", label: "الوردية", icon: Timer },  // الوردية للكل
  { path: "/products", label: "المنتجات", icon: Package, permission: "ProductsView" },
  { path: "/reports", label: "التقارير", icon: BarChart3, permission: "ReportsView" },
  // ...
  { path: "/settings", label: "الإعدادات", icon: Settings, adminOnly: true },
];

// التصفية:
const filteredNavItems = navItems.filter((item) => {
  if (isSystemOwner) return !!item.systemOwnerOnly;
  if (item.systemOwnerOnly) return isSystemOwner;
  if (item.adminOnly) return isAdmin;
  if (item.permission) return hasPermission(item.permission);
  return true;
});
```

### 5.6 صفحة إدارة الصلاحيات (جديد)

**ملف:** `frontend/src/pages/settings/PermissionsPage.tsx`

صفحة في الإعدادات فيها:
1. قائمة بكل الكاشيرات
2. لما تضغط على كاشير → تظهر كل الصلاحيات كـ Toggle Switches
3. مجمّعة حسب الفئة (نقطة البيع، الطلبات، المنتجات، إلخ)
4. زر "حفظ" يرسل الصلاحيات المحدّثة للـ Backend

```
┌────────────────────────────────────────────────────────────┐
│  إدارة صلاحيات الكاشيرين                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────┐                                      │
│  │ اختار كاشير:     │                                      │
│  │ ☐ أحمد (كاشير)   │                                      │
│  │ ☐ محمد (كاشير)   │                                      │
│  │ ☐ سارة (كاشير)   │                                      │
│  └──────────────────┘                                      │
│                                                            │
│  صلاحيات: أحمد                                             │
│  ═══════════════════                                       │
│                                                            │
│  📦 نقطة البيع                                              │
│  ┌─────────────────────────────────────────┐               │
│  │ ✅ البيع من نقطة البيع                    │               │
│  │ ❌ تطبيق خصومات                          │               │
│  └─────────────────────────────────────────┘               │
│                                                            │
│  📋 الطلبات                                                │
│  ┌─────────────────────────────────────────┐               │
│  │ ✅ عرض الطلبات                            │               │
│  │ ❌ عمل مرتجعات                            │               │
│  └─────────────────────────────────────────┘               │
│                                                            │
│  📊 التقارير                                               │
│  ┌─────────────────────────────────────────┐               │
│  │ ❌ عرض التقارير                           │               │
│  └─────────────────────────────────────────┘               │
│                                                            │
│            [ 💾 حفظ الصلاحيات ]                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 6. تدفق البيانات (Data Flow)

### 6.1 تسجيل الدخول

```
1. كاشير يسجّل دخول → POST /api/auth/login
2. AuthService يتحقق من البيانات
3. AuthService يجلب صلاحيات الكاشير من UserPermissions table
4. AuthService يضيف الصلاحيات كـ claims في JWT Token
5. يرجع الـ Token + User (مع permissions array)
6. Frontend يخزّن في Redux + localStorage
7. Frontend يستخدم permissions لإظهار/إخفاء العناصر
```

### 6.2 طلب API محمي

```
1. كاشير يطلب GET /api/products
2. JWT Middleware يتحقق من الـ Token (صالح؟ منتهي؟)
3. [Authorize] يتحقق من تسجيل الدخول
4. [HasPermission(ProductsView)] يتحقق:
   a. لو Admin → يمرّ ✅
   b. لو Cashier → يتحقق من "permission" claims في الـ Token
   c. لو فيه "ProductsView" → يمرّ ✅
   d. لو مافيش → 403 Forbidden ❌
5. Controller ينفّذ العملية
```

### 6.3 تحديث الصلاحيات

```
1. الأدمن يفتح صفحة إدارة الصلاحيات
2. يختار كاشير → يعدّل الصلاحيات → يضغط حفظ
3. PUT /api/permissions/user/{userId}
4. PermissionService يحذف الصلاحيات القديمة + يضيف الجديدة
5. يحدّث SecurityStamp → الكاشير يُجبر على إعادة تسجيل الدخول
6. في المرة الجاية الكاشير يسجّل دخول → يحصل على Token جديد بالصلاحيات الجديدة
```

---

## 7. الأمان

### 7.1 الحماية على مستويين

| المستوى | الحماية | الغرض |
|---|---|---|
| **Frontend** | `usePermission()` + `PermissionRoute` | UX — إخفاء العناصر اللي المستخدم ما يقدر يوصلها |
| **Backend** | `[HasPermission]` attribute | Security — الحماية الحقيقية. حتى لو حد تلاعب بالـ Frontend |

> **القاعدة الذهبية:** الـ Frontend يخفي، الـ Backend يمنع. لا تعتمد على الـ Frontend وحده أبداً.

### 7.2 Token Invalidation

لما الأدمن يغيّر صلاحيات كاشير:
- `SecurityStamp` يتحدّث → الـ Token الحالي يصبح باطل
- الـ Custom `OnTokenValidated` في Program.cs يتحقق من الـ SecurityStamp
- الكاشير يُطرد تلقائياً ويحتاج يسجّل دخول من جديد

### 7.3 Default Deny

- لو مافيش صلاحيات مخزنة للكاشير → يحصل على الصلاحيات الافتراضية فقط
- لو claim مفقود من الـ Token → الصلاحية مرفوضة (deny by default)

---

## 8. الجدول الزمني للتطبيق

نظام التنفيذ مقسم لـ 3 مراحل. كل مرحلة مستقلة وممكن تختبرها لوحدها.

| المرحلة | الأهمية | المهام |
|---|---|---|
| **المرحلة 1** | **الأساس** | Permission Enum, UserPermission Entity, Migration, PermissionService |
| **المرحلة 2** | **الحماية** | HasPermissionAttribute, تعديل Controllers, تعديل AuthService (JWT claims) |
| **المرحلة 3** | **الواجهة** | تعديل Frontend types, usePermission hook, PermissionRoute, صفحة الإدارة, تعديل Sidebar |
