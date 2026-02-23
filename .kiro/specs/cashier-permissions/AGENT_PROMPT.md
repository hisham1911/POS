# Agent Implementation Prompt — Cashier Permissions System

## Your Mission

Implement a complete **Cashier Permissions System** for the KasserPro POS application. This is a **multi-phase, multi-file implementation** that adds granular permission control for cashier users. You will work through **3 phases and 15 tasks** systematically.

**CRITICAL RULES:**
1. ✅ **Complete ALL tasks** before reporting back
2. ✅ **Test after each phase** (build must succeed)
3. ✅ **Follow the exact file structure** specified
4. ✅ **Do NOT stop** until all 3 phases are complete
5. ✅ **Report failures immediately** but continue with remaining tasks
6. ✅ **Track your progress** using the todo list tool

---

## Context Files (READ THESE FIRST)

Before starting, read these specification files I created:

1. **`.kiro/specs/cashier-permissions/requirements.md`** — Business requirements & 16 permissions
2. **`.kiro/specs/cashier-permissions/design.md`** — Technical architecture & code patterns
3. **`.kiro/specs/cashier-permissions/implementation-plan.md`** — Step-by-step task breakdown

Read these files completely to understand the system architecture before implementing.

---

## Project Structure

- **Backend:** `d:\مسح\POS\backend\`
  - Domain: `KasserPro.Domain/`
  - Application: `KasserPro.Application/`
  - Infrastructure: `KasserPro.Infrastructure/`
  - API: `KasserPro.API/`
- **Frontend:** `d:\مسح\POS\frontend\`
- **Database:** SQLite with EF Core Migrations

---

## Phase 1: Backend Domain + Data Layer

### Task 1.1 — Create Permission Enum ✅

**File:** `backend/KasserPro.Domain/Enums/Permission.cs` (NEW)

```csharp
namespace KasserPro.Domain.Enums;

/// <summary>
/// Granular permissions for cashier users.
/// Admins automatically get all permissions.
/// </summary>
public enum Permission
{
    // Point of Sale
    PosSell            = 100,
    PosApplyDiscount   = 101,

    // Orders
    OrdersView         = 200,
    OrdersRefund       = 201,

    // Products
    ProductsView       = 300,
    ProductsManage     = 301,

    // Categories
    CategoriesView     = 400,
    CategoriesManage   = 401,

    // Customers
    CustomersView      = 500,
    CustomersManage    = 501,

    // Reports
    ReportsView        = 600,

    // Expenses
    ExpensesView       = 700,
    ExpensesCreate     = 701,

    // Inventory
    InventoryView      = 800,

    // Shifts
    ShiftsManage       = 900,

    // Cash Register
    CashRegisterView   = 1000,
}
```

**Validation:** Run `dotnet build` on KasserPro.Domain project.

---

### Task 1.2 — Create UserPermission Entity ✅

**File:** `backend/KasserPro.Domain/Entities/UserPermission.cs` (NEW)

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

/// <summary>
/// Links a specific permission to a user.
/// Each row = one active permission for one user.
/// </summary>
public class UserPermission : BaseEntity
{
    public int UserId { get; set; }
    public Permission Permission { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
```

**Validation:** `dotnet build` succeeds.

---

### Task 1.3 — Update User Entity ✅

**File:** `backend/KasserPro.Domain/Entities/User.cs`

**Action:** Add this line to the navigation properties section:

```csharp
public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
```

**Validation:** `dotnet build` succeeds.

---

### Task 1.4 — Update DbContext + Create Migration ✅

**Step 1:** Find the main DbContext file. It's likely:
- `backend/KasserPro.Infrastructure/Data/AppDbContext.cs` OR
- `backend/KasserPro.API/KasserproContext.cs`

Search for it if needed.

**Step 2:** Add DbSet property:

```csharp
public DbSet<UserPermission> UserPermissions { get; set; }
```

**Step 3:** In `OnModelCreating` method, add:

```csharp
modelBuilder.Entity<UserPermission>(entity =>
{
    // Unique index: prevent duplicate permissions for same user
    entity.HasIndex(e => new { e.UserId, e.Permission })
          .IsUnique();

    // Foreign key relationship
    entity.HasOne(e => e.User)
          .WithMany(u => u.Permissions)
          .HasForeignKey(e => e.UserId)
          .OnDelete(DeleteBehavior.Cascade);

    // Store enum as integer
    entity.Property(e => e.Permission)
          .HasConversion<int>();
});
```

**Step 4:** Create and apply migration:

```bash
cd backend/KasserPro.API
dotnet ef migrations add AddUserPermissions --project ../KasserPro.Infrastructure
dotnet ef database update
```

**IMPORTANT:** If EF migrations fail or the project doesn't use them, check if there's a `schema.sql` file and add:

```sql
CREATE TABLE IF NOT EXISTS UserPermissions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    Permission INTEGER NOT NULL,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    UpdatedAt TEXT,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE(UserId, Permission)
);
CREATE INDEX IX_UserPermissions_UserId_Permission ON UserPermissions(UserId, Permission);
```

**Validation:** Database has `UserPermissions` table.

---

### Task 1.5 — Create Permission DTOs ✅

**File:** `backend/KasserPro.Application/DTOs/PermissionDtos.cs` (NEW)

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

**Validation:** `dotnet build` succeeds.

---

### Task 1.6 — Create IPermissionService + PermissionService ✅

**File:** `backend/KasserPro.Application/Services/Interfaces/IPermissionService.cs` (NEW)

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

**File:** `backend/KasserPro.Application/Services/Implementations/PermissionService.cs` (NEW)

```csharp
namespace KasserPro.Application.Services.Implementations;

using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;
using Microsoft.EntityFrameworkCore;

public class PermissionService : IPermissionService
{
    private readonly IApplicationDbContext _context;

    private static readonly List<Permission> DefaultCashierPermissions = new()
    {
        Permission.PosSell,
        Permission.OrdersView,
    };

    public PermissionService(IApplicationDbContext context)
    {
        _context = context;
    }

    public List<Permission> GetDefaultCashierPermissions()
        => DefaultCashierPermissions.ToList();

    public async Task<List<Permission>> GetUserPermissionsAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return new();

        // Admin/SystemOwner get all permissions
        if (user.Role == UserRole.Admin || user.Role == UserRole.SystemOwner)
            return Enum.GetValues<Permission>().ToList();

        return await _context.UserPermissions
            .Where(up => up.UserId == userId)
            .Select(up => up.Permission)
            .ToListAsync();
    }

    public async Task<UserPermissionsDto> GetUserPermissionsDtoAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found");

        var permissions = await GetUserPermissionsAsync(userId);

        return new UserPermissionsDto
        {
            UserId = user.Id,
            UserName = user.Name,
            Email = user.Email,
            Permissions = permissions.Select(p => p.ToString()).ToList()
        };
    }

    public async Task<List<UserPermissionsDto>> GetAllCashierPermissionsAsync(int tenantId)
    {
        var cashiers = await _context.Users
            .Where(u => u.Role == UserRole.Cashier && u.TenantId == tenantId)
            .ToListAsync();

        var result = new List<UserPermissionsDto>();
        foreach (var cashier in cashiers)
        {
            result.Add(await GetUserPermissionsDtoAsync(cashier.Id));
        }

        return result;
    }

    public async Task UpdateUserPermissionsAsync(int userId, List<Permission> permissions, int adminUserId)
    {
        // Remove old permissions
        var existing = await _context.UserPermissions
            .Where(up => up.UserId == userId)
            .ToListAsync();

        _context.UserPermissions.RemoveRange(existing);

        // Add new permissions
        var newPermissions = permissions.Select(p => new UserPermission
        {
            UserId = userId,
            Permission = p
        });

        _context.UserPermissions.AddRange(newPermissions);
        await _context.SaveChangesAsync(default);

        // Update SecurityStamp to force re-login and get new JWT with updated permissions
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.UpdateSecurityStamp();
            await _context.SaveChangesAsync(default);
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

    public List<PermissionInfoDto> GetAllAvailablePermissions()
    {
        return new List<PermissionInfoDto>
        {
            new() {
                Key = "PosSell",
                Group = "POS",
                GroupAr = "نقطة البيع",
                Description = "Sell from POS",
                DescriptionAr = "البيع من نقطة البيع",
                IsDefault = true
            },
            new() {
                Key = "PosApplyDiscount",
                Group = "POS",
                GroupAr = "نقطة البيع",
                Description = "Apply discounts",
                DescriptionAr = "تطبيق خصومات",
                IsDefault = false
            },
            new() {
                Key = "OrdersView",
                Group = "Orders",
                GroupAr = "الطلبات",
                Description = "View orders",
                DescriptionAr = "عرض الطلبات",
                IsDefault = true
            },
            new() {
                Key = "OrdersRefund",
                Group = "Orders",
                GroupAr = "الطلبات",
                Description = "Process refunds",
                DescriptionAr = "عمل مرتجعات",
                IsDefault = false
            },
            new() {
                Key = "ProductsView",
                Group = "Products",
                GroupAr = "المنتجات",
                Description = "View products",
                DescriptionAr = "عرض المنتجات",
                IsDefault = false
            },
            new() {
                Key = "ProductsManage",
                Group = "Products",
                GroupAr = "المنتجات",
                Description = "Add/Edit/Delete products",
                DescriptionAr = "إضافة/تعديل/حذف منتجات",
                IsDefault = false
            },
            new() {
                Key = "CategoriesView",
                Group = "Categories",
                GroupAr = "التصنيفات",
                Description = "View categories",
                DescriptionAr = "عرض التصنيفات",
                IsDefault = false
            },
            new() {
                Key = "CategoriesManage",
                Group = "Categories",
                GroupAr = "التصنيفات",
                Description = "Add/Edit/Delete categories",
                DescriptionAr = "إضافة/تعديل/حذف تصنيفات",
                IsDefault = false
            },
            new() {
                Key = "CustomersView",
                Group = "Customers",
                GroupAr = "العملاء",
                Description = "View customers",
                DescriptionAr = "عرض العملاء",
                IsDefault = false
            },
            new() {
                Key = "CustomersManage",
                Group = "Customers",
                GroupAr = "العملاء",
                Description = "Add/Edit/Delete customers",
                DescriptionAr = "إضافة/تعديل/حذف عملاء",
                IsDefault = false
            },
            new() {
                Key = "ReportsView",
                Group = "Reports",
                GroupAr = "التقارير",
                Description = "View reports",
                DescriptionAr = "عرض التقارير",
                IsDefault = false
            },
            new() {
                Key = "ExpensesView",
                Group = "Expenses",
                GroupAr = "المصروفات",
                Description = "View expenses",
                DescriptionAr = "عرض المصروفات",
                IsDefault = false
            },
            new() {
                Key = "ExpensesCreate",
                Group = "Expenses",
                GroupAr = "المصروفات",
                Description = "Create expense",
                DescriptionAr = "إنشاء مصروف",
                IsDefault = false
            },
            new() {
                Key = "InventoryView",
                Group = "Inventory",
                GroupAr = "المخزون",
                Description = "View inventory",
                DescriptionAr = "عرض المخزون",
                IsDefault = false
            },
            new() {
                Key = "ShiftsManage",
                Group = "Shifts",
                GroupAr = "الورديات",
                Description = "Manage all shifts",
                DescriptionAr = "إدارة كل الورديات",
                IsDefault = false
            },
            new() {
                Key = "CashRegisterView",
                Group = "CashRegister",
                GroupAr = "الخزينة",
                Description = "View cash register",
                DescriptionAr = "عرض الخزينة",
                IsDefault = false
            },
        };
    }
}
```

**IMPORTANT:** Replace `IApplicationDbContext` with the actual interface name used in the project. Search for the context interface in `KasserPro.Application/Common/Interfaces/`.

**Validation:** `dotnet build` succeeds.

---

### Task 1.7 — Register PermissionService in DI ✅

**File:** `backend/KasserPro.API/Program.cs`

**Action:** Find the service registration section (where other services are registered like `AddScoped<IAuthService, AuthService>`).

Add:

```csharp
builder.Services.AddScoped<IPermissionService, PermissionService>();
```

**Validation:** Application runs without DI errors.

---

### ✅ Phase 1 Checkpoint

**Test:** Run the following:

```bash
cd backend/KasserPro.API
dotnet build
dotnet run
```

Application should start without errors. Database should have `UserPermissions` table.

---

## Phase 2: Backend Authorization Layer

### Task 2.1 — Create HasPermissionAttribute ✅

**File:** `backend/KasserPro.API/Middleware/HasPermissionAttribute.cs` (NEW)

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using KasserPro.Domain.Enums;
using System.Security.Claims;

namespace KasserPro.API.Middleware;

/// <summary>
/// Authorization attribute to check specific permission.
/// Admins/SystemOwners bypass automatically.
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

        // Not authenticated
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Admin & SystemOwner bypass all permission checks
        var role = user.FindFirst(ClaimTypes.Role)?.Value;
        if (role == "Admin" || role == "SystemOwner")
            return;

        // Check permission in JWT claims
        var permissions = user.FindAll("permission")
            .Select(c => c.Value)
            .ToList();

        if (!permissions.Contains(_permission.ToString()))
        {
            context.Result = new ForbidResult();
            return;
        }

        await Task.CompletedTask;
    }
}
```

**Validation:** `dotnet build` succeeds.

---

### Task 2.2 — Update AuthService to Add Permissions in JWT ✅

**File:** `backend/KasserPro.Application/Services/Implementations/AuthService.cs`

**Step 1:** Find the constructor and add `IPermissionService` dependency injection:

```csharp
private readonly IPermissionService _permissionService;

// Add to constructor parameters:
public AuthService(
    // ... existing parameters ...
    IPermissionService permissionService)
{
    // ... existing assignments ...
    _permissionService = permissionService;
}
```

**Step 2:** Find the method that generates JWT tokens (usually `GenerateJwtToken` or similar). After creating the claims list, add:

```csharp
// Add permissions as claims
var permissions = await _permissionService.GetUserPermissionsAsync(user.Id);
foreach (var perm in permissions)
{
    claims.Add(new Claim("permission", perm.ToString()));
}
```

**Step 3:** Find the `LoginAsync` method. Update the return statement to include permissions in the user DTO:

```csharp
// Find where UserDto is created/returned and add:
Permissions = permissions.Select(p => p.ToString()).ToList()
```

**Note:** You may need to update the User DTO in `KasserPro.Application/DTOs/` to include `Permissions` property:

```csharp
public List<string> Permissions { get; set; } = new();
```

**Validation:** Login and decode the JWT token — should contain `permission` claims.

---

### Task 2.3 — Update RegisterAsync to Assign Default Permissions ✅

**File:** `backend/KasserPro.Application/Services/Implementations/AuthService.cs`

**Action:** Find the `RegisterAsync` method. After creating and saving the new user, add:

```csharp
// After SaveChangesAsync() for new user
if (user.Role == UserRole.Cashier)
{
    var defaultPermissions = _permissionService.GetDefaultCashierPermissions();
    await _permissionService.UpdateUserPermissionsAsync(user.Id, defaultPermissions, currentUserId);
}
```

**Note:** `currentUserId` should be available from `ICurrentUserService` — make sure it's injected.

**Validation:** Register a new cashier → check database → should have 2 rows in `UserPermissions` (PosSell, OrdersView).

---

### Task 2.4 — Create PermissionsController ✅

**File:** `backend/KasserPro.API/Controllers/PermissionsController.cs` (NEW)

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Enums;

namespace KasserPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;
    private readonly ICurrentUserService _currentUser;

    public PermissionsController(
        IPermissionService permissionService,
        ICurrentUserService currentUser)
    {
        _permissionService = permissionService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Get all available permissions with metadata
    /// </summary>
    [HttpGet("available")]
    public IActionResult GetAvailablePermissions()
    {
        var permissions = _permissionService.GetAllAvailablePermissions();
        return Ok(permissions);
    }

    /// <summary>
    /// Get permissions for all cashiers in current tenant
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllCashierPermissions()
    {
        var tenantId = _currentUser.TenantId ?? 0;
        var result = await _permissionService.GetAllCashierPermissionsAsync(tenantId);
        return Ok(result);
    }

    /// <summary>
    /// Get permissions for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPermissions(int userId)
    {
        var result = await _permissionService.GetUserPermissionsDtoAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Update permissions for a user
    /// </summary>
    [HttpPut("user/{userId}")]
    public async Task<IActionResult> UpdateUserPermissions(
        int userId,
        [FromBody] UpdatePermissionsRequest request)
    {
        var permissions = request.Permissions
            .Select(p => Enum.Parse<Permission>(p))
            .ToList();

        await _permissionService.UpdateUserPermissionsAsync(
            userId,
            permissions,
            _currentUser.UserId);

        return Ok(new { message = "تم تحديث الصلاحيات بنجاح" });
    }
}
```

**Validation:** Test endpoints with Postman or the `.http` file:

```http
### Get available permissions
GET {{host}}/api/permissions/available
Authorization: Bearer {{adminToken}}

### Get all cashiers' permissions
GET {{host}}/api/permissions/users
Authorization: Bearer {{adminToken}}
```

---

### Task 2.5 — Apply [HasPermission] to Existing Controllers ✅

**Important:** Do NOT remove existing `[Authorize]` attributes. ADD `[HasPermission]` alongside them.

Update the following controllers:

#### OrdersController

```csharp
[HttpGet]
[HasPermission(Permission.OrdersView)]
public async Task<IActionResult> GetOrders() { ... }

[HttpPost("refund")]
[HasPermission(Permission.OrdersRefund)]
public async Task<IActionResult> Refund() { ... }
```

#### ProductsController

```csharp
[HttpGet]
[HasPermission(Permission.ProductsView)]
public async Task<IActionResult> GetProducts() { ... }

[HttpPost]
[HasPermission(Permission.ProductsManage)]
public async Task<IActionResult> Create() { ... }

[HttpPut("{id}")]
[HasPermission(Permission.ProductsManage)]
public async Task<IActionResult> Update() { ... }

[HttpDelete("{id}")]
[HasPermission(Permission.ProductsManage)]
public async Task<IActionResult> Delete() { ... }
```

Apply similar patterns to:
- CategoriesController (View, Manage)
- CustomersController (View, Manage)
- ReportsController (ReportsView)
- ExpensesController (View, Create)
- InventoryController (InventoryView)
- ShiftsController (ShiftsManage for admin endpoints)
- CashRegisterController (CashRegisterView)

**Validation:** Login as cashier without `ProductsView` → GET /api/products → should return 403 Forbidden.

---

### ✅ Phase 2 Checkpoint

**Test:**

1. Build: `dotnet build` → success
2. Run API
3. Login as admin → check JWT → should have multiple "permission" claims
4. Try accessing protected endpoints as cashier without permissions → should get 403

---

## Phase 3: Frontend Implementation

### Task 3.1 — Update Frontend Types ✅

**File:** `frontend/src/types/auth.types.ts`

**Action:** Add `permissions` to the `User` interface:

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Cashier" | "SystemOwner";
  permissions: string[];  // ← ADD THIS
}
```

**File:** `frontend/src/types/permission.types.ts` (NEW)

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

**Validation:** `npm run build` or check TypeScript errors.

---

### Task 3.2 — Create usePermission Hook ✅

**File:** `frontend/src/hooks/usePermission.ts` (NEW)

```typescript
import { useAppSelector } from "../store/hooks";
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsSystemOwner,
} from "../store/slices/authSlice";

export const usePermission = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSystemOwner = useAppSelector(selectIsSystemOwner);

  const hasPermission = (permission: string): boolean => {
    // Admin & SystemOwner have all permissions
    if (isAdmin || isSystemOwner) return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  return { hasPermission, hasAnyPermission };
};
```

**Validation:** TypeScript compiles without errors.

---

### Task 3.3 — Create Permissions API ✅

**File:** `frontend/src/api/permissionsApi.ts` (NEW)

```typescript
import { baseApi } from "./baseApi";
import type {
  PermissionInfo,
  UserPermissions,
  UpdatePermissionsRequest,
} from "../types/permission.types";

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
      providesTags: (result, error, userId) => [
        { type: "Permissions", id: userId },
      ],
    }),
    updateUserPermissions: builder.mutation<
      void,
      { userId: number; body: UpdatePermissionsRequest }
    >({
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

**File:** `frontend/src/api/baseApi.ts`

**Action:** Add `"Permissions"` to the `tagTypes` array:

```typescript
tagTypes: ["Products", "Categories", /* ... */, "Permissions"],
```

**Validation:** `npm run build` succeeds.

---

### Task 3.4 — Update App.tsx with PermissionRoute ✅

**File:** `frontend/src/App.tsx`

**Step 1:** Import the hook:

```typescript
import { usePermission } from "./hooks/usePermission";
```

**Step 2:** Add `PermissionRoute` component after `AdminRoute`:

```typescript
const PermissionRoute = ({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission: string;
}) => {
  const { hasPermission } = usePermission();
  if (!hasPermission(permission)) return <Navigate to="/pos" replace />;
  return <>{children}</>;
};
```

**Step 3:** Replace `AdminRoute` with `PermissionRoute` for specific pages:

```tsx
// Example: Products page
<Route
  path="/products"
  element={
    <NonSystemOwnerRoute>
      <PermissionRoute permission="ProductsView">
        <ProductsPage />
      </PermissionRoute>
    </NonSystemOwnerRoute>
  }
/>

// Example: Reports page
<Route
  path="/reports"
  element={
    <NonSystemOwnerRoute>
      <PermissionRoute permission="ReportsView">
        <DailyReportPage />
      </PermissionRoute>
    </NonSystemOwnerRoute>
  }
/>
```

**IMPORTANT:** Keep `AdminRoute` for truly admin-only pages like Settings, Audit, Shifts Management.

Apply this pattern for:
- `/products` → ProductsView
- `/categories` → CategoriesView
- `/customers` → CustomersView
- `/suppliers` → (can keep AdminRoute or use ProductsView)
- `/reports` → ReportsView
- `/expenses` → ExpensesView
- `/inventory` → InventoryView
- `/cash-register` → CashRegisterView

**Validation:** Login as cashier → should only see allowed routes.

---

### Task 3.5 — Update Sidebar Navigation ✅

**File:** `frontend/src/components/layout/MainLayout.tsx`

**Step 1:** Import the hook:

```typescript
import { usePermission } from "../../hooks/usePermission";
```

**Step 2:** Use the hook in the component:

```typescript
const { hasPermission } = usePermission();
```

**Step 3:** Add `permission` property to `navItems`:

```typescript
const navItems = [
  { path: "/pos", label: "نقطة البيع", icon: ShoppingCart, permission: "PosSell" },
  { path: "/orders", label: "الطلبات", icon: ClipboardList, permission: "OrdersView" },
  { path: "/shift", label: "الوردية", icon: Timer }, // No permission (everyone)
  { path: "/products", label: "المنتجات", icon: Package, permission: "ProductsView" },
  { path: "/categories", label: "التصنيفات", icon: FolderOpen, permission: "CategoriesView" },
  { path: "/customers", label: "العملاء", icon: Users, permission: "CustomersView" },
  { path: "/reports", label: "التقارير", icon: BarChart3, permission: "ReportsView" },
  { path: "/expenses", label: "المصروفات", icon: Receipt, permission: "ExpensesView" },
  { path: "/inventory", label: "المخزون", icon: Boxes, permission: "InventoryView" },
  { path: "/cash-register", label: "الخزينة", icon: Wallet, permission: "CashRegisterView" },
  // Keep adminOnly for truly admin pages
  { path: "/settings", label: "الإعدادات", icon: Settings, adminOnly: true },
  { path: "/audit", label: "سجل التدقيق", icon: FileText, adminOnly: true },
  // ...
];
```

**Step 4:** Update the filter logic:

```typescript
const filteredNavItems = navItems.filter((item) => {
  if (isSystemOwner) return !!item.systemOwnerOnly;
  if (item.systemOwnerOnly) return isSystemOwner;
  if (item.adminOnly) return isAdmin;
  if (item.permission) return hasPermission(item.permission);
  return true;
});
```

**Validation:** Login as cashier → sidebar should only show allowed items.

---

### Task 3.6 — Create Permissions Management Page ✅

**File:** `frontend/src/pages/settings/PermissionsPage.tsx` (NEW)

```typescript
import { useState } from "react";
import { Card, Loading } from "../../components/common";
import {
  useGetAllCashierPermissionsQuery,
  useGetAvailablePermissionsQuery,
  useUpdateUserPermissionsMutation,
} from "../../api/permissionsApi";
import { toast } from "react-hot-toast";

export default function PermissionsPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: cashiers, isLoading: loadingCashiers } =
    useGetAllCashierPermissionsQuery();
  const { data: availablePermissions, isLoading: loadingPermissions } =
    useGetAvailablePermissionsQuery();
  const [updatePermissions, { isLoading: updating }] =
    useUpdateUserPermissionsMutation();

  const selectedCashier = cashiers?.find((c) => c.userId === selectedUserId);

  const handleSelectCashier = (userId: number) => {
    setSelectedUserId(userId);
    const cashier = cashiers?.find((c) => c.userId === userId);
    setSelectedPermissions(cashier?.permissions || []);
  };

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSave = async () => {
    if (!selectedUserId) return;

    try {
      await updatePermissions({
        userId: selectedUserId,
        body: { permissions: selectedPermissions },
      }).unwrap();
      toast.success("تم تحديث الصلاحيات بنجاح");
    } catch (error) {
      toast.error("فشل تحديث الصلاحيات");
    }
  };

  if (loadingCashiers || loadingPermissions) return <Loading />;

  // Group permissions by group
  const groupedPermissions = availablePermissions?.reduce((acc, perm) => {
    if (!acc[perm.groupAr]) acc[perm.groupAr] = [];
    acc[perm.groupAr].push(perm);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">إدارة صلاحيات الكاشيرين</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashier List */}
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">اختر كاشير</h2>
          <div className="space-y-2">
            {cashiers?.map((cashier) => (
              <button
                key={cashier.userId}
                onClick={() => handleSelectCashier(cashier.userId)}
                className={`w-full text-right p-3 rounded-lg transition ${
                  selectedUserId === cashier.userId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="font-semibold">{cashier.userName}</div>
                <div className="text-sm opacity-75">{cashier.email}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Permissions Editor */}
        <Card className="lg:col-span-2">
          {selectedCashier ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                صلاحيات: {selectedCashier.userName}
              </h2>

              <div className="space-y-6">
                {Object.entries(groupedPermissions || {}).map(
                  ([group, perms]) => (
                    <div key={group}>
                      <h3 className="font-semibold text-lg mb-3 text-gray-700">
                        {group}
                      </h3>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        {perms.map((perm) => (
                          <label
                            key={perm.key}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="w-5 h-5"
                            />
                            <div>
                              <div className="font-medium">
                                {perm.descriptionAr}
                              </div>
                              <div className="text-sm text-gray-500">
                                {perm.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={updating}
                className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {updating ? "جاري الحفظ..." : "💾 حفظ الصلاحيات"}
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              اختر كاشيراً من القائمة لتعديل صلاحياته
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
```

**File:** `frontend/src/App.tsx`

**Action:** Add route for permissions page:

```tsx
<Route
  path="/settings/permissions"
  element={
    <NonSystemOwnerRoute>
      <AdminRoute>
        <PermissionsPage />
      </AdminRoute>
    </NonSystemOwnerRoute>
  }
/>
```

**Validation:** Admin navigates to `/settings/permissions` → sees cashiers list → edits permissions → saves → cashier logs out and back in → has new permissions.

---

### ✅ Phase 3 Checkpoint

**Final Test:**

1. `npm run build` → success
2. Login as admin → go to `/settings/permissions`
3. Edit a cashier's permissions
4. Login as that cashier → verify:
   - Sidebar shows only allowed items
   - Can access allowed pages
   - Gets 403 on disallowed API calls
5. Admin changes permissions → cashier must logout/login to see changes

---

## Final Deliverables Checklist

Before reporting completion, verify ALL of these:

### Backend ✅

- [ ] Permission.cs enum created with 16 permissions
- [ ] UserPermission.cs entity created
- [ ] User.cs has Permissions navigation property
- [ ] DbContext has UserPermissions DbSet + configuration
- [ ] Migration created and applied (UserPermissions table exists)
- [ ] PermissionDtos.cs created
- [ ] IPermissionService + PermissionService created with all 7 methods
- [ ] PermissionService registered in DI
- [ ] HasPermissionAttribute + Filter created
- [ ] AuthService injects IPermissionService
- [ ] AuthService adds permissions to JWT claims
- [ ] AuthService assigns default permissions on cashier registration
- [ ] PermissionsController created with 4 endpoints
- [ ] At least 3 existing controllers updated with [HasPermission]
- [ ] `dotnet build` succeeds
- [ ] API runs and responds to `/api/permissions/available`

### Frontend ✅

- [ ] auth.types.ts updated (permissions: string[])
- [ ] permission.types.ts created
- [ ] usePermission.ts hook created
- [ ] permissionsApi.ts created with 4 endpoints
- [ ] baseApi.ts has "Permissions" tag
- [ ] App.tsx has PermissionRoute component
- [ ] At least 3 routes use PermissionRoute
- [ ] MainLayout.tsx uses usePermission for sidebar filtering
- [ ] navItems have permission property
- [ ] PermissionsPage.tsx created with full UI
- [ ] Route for /settings/permissions added
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors

### Integration Test ✅

- [ ] Admin can login and see all permissions in settings
- [ ] Cashier with default permissions can access POS + Orders only
- [ ] Cashier without ProductsView gets 403 on GET /api/products
- [ ] Admin updates cashier permissions → cashier forced to re-login
- [ ] After re-login, cashier has new permissions

---

## Error Handling Instructions

If you encounter errors during implementation:

1. **Database/Migration Errors:**
   - Check if `dotnet ef` tools are installed
   - If migrations fail, fall back to manual SQL schema update
   - Verify connection string in appsettings.json

2. **DI Resolution Errors:**
   - Verify all interfaces are registered in Program.cs
   - Check constructor parameter names match registered services

3. **Build Errors:**
   - Read error messages carefully
   - Fix each error before proceeding
   - Use `dotnet build -v detailed` for more info

4. **401/403 Errors:**
   - Verify JWT token is valid
   - Check permission claims in token (decode at jwt.io)
   - Ensure HasPermissionFilter is checking correct claim name

5. **Frontend Errors:**
   - Check browser console for errors
   - Verify API responses in Network tab
   - Ensure baseApi has correct Authorization header

---

## Reporting Back

When you complete all tasks, provide a summary with:

1. **Files Created:** List of all 11 new files created
2. **Files Modified:** List of all 7+ modified files
3. **Database Changes:** Confirmation that UserPermissions table exists
4. **Test Results:** Results of integration tests (all 5 checkboxes)
5. **Known Issues:** Any warnings or issues encountered
6. **Next Steps:** Recommendations for further improvements

---

## Success Criteria

✅ **You have successfully completed this implementation when:**

- All 15 tasks are done
- Backend builds and runs without errors
- Frontend builds and runs without errors
- Database has UserPermissions table with proper indexes
- Admin can manage cashier permissions from UI
- Cashiers are restricted based on their assigned permissions
- JWT tokens contain permission claims
- SecurityStamp forces re-login when permissions change

**GO!** Start with Phase 1, Task 1.1 and work systematically through each task. Use the todo list tool to track progress. Do not stop until all tasks are complete.
