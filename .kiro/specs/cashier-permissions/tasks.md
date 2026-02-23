# Implementation Plan: Cashier Permissions System

## Overview

This implementation adds a granular permission system for cashier users in KasserPro. The system allows admins to control specific permissions for each cashier (e.g., view products, apply discounts, process refunds) while admins retain all permissions automatically. The implementation spans backend (C#/.NET 8) and frontend (TypeScript/React) with 16 distinct permissions.

## Tasks

- [x] 1. Backend Domain Layer - Create Permission Infrastructure
  - Create Permission enum with 16 permissions (PosSell, PosApplyDiscount, OrdersView, OrdersRefund, ProductsView, ProductsManage, CategoriesView, CategoriesManage, CustomersView, CustomersManage, ReportsView, ExpensesView, ExpensesCreate, InventoryView, ShiftsManage, CashRegisterView)
  - Create UserPermission entity to link permissions to users
  - Update User entity with Permissions navigation property
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Backend Data Layer - Database Schema and Migration
  - [x] 2.1 Update DbContext with UserPermissions DbSet and configuration
    - Add DbSet<UserPermission> to context
    - Configure unique index on (UserId, Permission)
    - Configure cascade delete relationship
    - Configure enum to integer conversion
    - _Requirements: 1.4_
  
  - [x] 2.2 Create and apply database migration
    - Generate migration for UserPermissions table
    - Apply migration to create table with proper indexes
    - _Requirements: 1.4_

- [x] 3. Backend Application Layer - Permission Service
  - [x] 3.1 Create Permission DTOs
    - Create UserPermissionsDto, UpdatePermissionsRequest, PermissionInfoDto
    - _Requirements: 1.5_
  
  - [x] 3.2 Implement IPermissionService and PermissionService
    - Implement GetUserPermissionsAsync (returns all permissions for admin/SystemOwner)
    - Implement GetUserPermissionsDtoAsync
    - Implement GetAllCashierPermissionsAsync
    - Implement UpdateUserPermissionsAsync (with SecurityStamp update to force re-login)
    - Implement HasPermissionAsync
    - Implement GetDefaultCashierPermissions (PosSell, OrdersView)
    - Implement GetAllAvailablePermissions with Arabic/English metadata
    - _Requirements: 1.6, 2.1, 2.2, 2.3_
  
  - [x] 3.3 Register PermissionService in dependency injection
    - Add service registration in Program.cs
    - _Requirements: 1.7_

- [x] 4. Checkpoint - Verify Backend Domain and Data Layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Backend Authorization Layer - Permission Enforcement
  - [x] 5.1 Create HasPermissionAttribute and HasPermissionFilter
    - Implement authorization filter that checks permission claims in JWT
    - Admin and SystemOwner bypass all permission checks
    - Return 403 Forbidden if permission missing
    - _Requirements: 2.4, 2.5_
  
  - [x] 5.2 Update AuthService to include permissions in JWT
    - Inject IPermissionService into AuthService
    - Add permission claims to JWT token generation
    - Update LoginAsync to return permissions in user DTO
    - Update User DTO to include Permissions property
    - _Requirements: 2.6, 2.7_
  
  - [x] 5.3 Update RegisterAsync to assign default permissions
    - Assign default permissions (PosSell, OrdersView) when registering new cashier
    - _Requirements: 2.8_

- [x] 6. Backend API Layer - Permissions Controller
  - [x] 6.1 Create PermissionsController with admin-only endpoints
    - GET /api/permissions/available - returns all permissions with metadata
    - GET /api/permissions/users - returns all cashiers with their permissions
    - GET /api/permissions/user/{userId} - returns specific user permissions
    - PUT /api/permissions/user/{userId} - updates user permissions
    - _Requirements: 2.9_
  
  - [x] 6.2 Apply HasPermission attribute to existing controllers
    - Update OrdersController (OrdersView, OrdersRefund)
    - Update ProductsController (ProductsView, ProductsManage)
    - Update CategoriesController (CategoriesView, CategoriesManage)
    - Update CustomersController (CustomersView, CustomersManage)
    - Update ReportsController (ReportsView)
    - Update ExpensesController (ExpensesView, ExpensesCreate)
    - Update InventoryController (InventoryView)
    - Update ShiftsController (ShiftsManage for admin endpoints)
    - Update CashRegisterController (CashRegisterView)
    - _Requirements: 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18_

- [x] 7. Checkpoint - Verify Backend Authorization Layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Frontend Types - Update Type Definitions
  - Update User interface in auth.types.ts to include permissions array
  - Create permission.types.ts with PermissionInfo, UserPermissions, UpdatePermissionsRequest interfaces
  - _Requirements: 3.1_

- [x] 9. Frontend Hooks and API - Permission Logic
  - [x] 9.1 Create usePermission hook
    - Implement hasPermission function (returns true for admin/SystemOwner)
    - Implement hasAnyPermission function
    - _Requirements: 3.2_
  
  - [x] 9.2 Create permissionsApi with RTK Query
    - Implement getAvailablePermissions query
    - Implement getAllCashierPermissions query
    - Implement getUserPermissions query
    - Implement updateUserPermissions mutation
    - Add "Permissions" to baseApi tagTypes
    - _Requirements: 3.3_

- [x] 10. Frontend Routing - Permission-Based Route Guards
  - [x] 10.1 Create PermissionRoute component in App.tsx
    - Redirect to /pos if user lacks required permission
    - _Requirements: 3.4_
  
  - [x] 10.2 Apply PermissionRoute to protected routes
    - Wrap /products with ProductsView permission
    - Wrap /categories with CategoriesView permission
    - Wrap /customers with CustomersView permission
    - Wrap /reports with ReportsView permission
    - Wrap /expenses with ExpensesView permission
    - Wrap /inventory with InventoryView permission
    - Wrap /cash-register with CashRegisterView permission
    - Keep AdminRoute for truly admin-only pages (settings, audit)
    - _Requirements: 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

- [x] 11. Frontend Navigation - Permission-Based Sidebar
  - Update MainLayout.tsx to use usePermission hook
  - Add permission property to navItems configuration
  - Update filter logic to check permissions for each nav item
  - Hide nav items that user doesn't have permission for
  - _Requirements: 3.12_

- [x] 12. Frontend Permissions Management Page
  - [x] 12.1 Create PermissionsPage component
    - Display list of all cashiers
    - Show permission editor when cashier selected
    - Group permissions by category (POS, Orders, Products, etc.)
    - Display Arabic and English descriptions
    - Implement toggle switches for each permission
    - Implement save functionality with mutation
    - Show loading and success/error states
    - _Requirements: 3.13_
  
  - [x] 12.2 Add route for permissions management page
    - Add /settings/permissions route with AdminRoute guard
    - _Requirements: 3.14_

- [x] 13. Final Checkpoint - Integration Testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Backend uses C# with .NET 8 and Entity Framework Core
- Frontend uses TypeScript with React and RTK Query
- All permissions are stored in database and included in JWT tokens
- Admins and SystemOwners automatically have all permissions
- Default cashier permissions: PosSell, OrdersView
- SecurityStamp update forces cashier to re-login when permissions change
- Frontend permission checks are for UX only - backend enforces security
- Each task references specific requirements from requirements.md for traceability
