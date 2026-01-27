# Tasks - Backend-Frontend Integration Audit

## Phase 1: Critical Fixes (🔴 Priority)

### 1. Implement Suppliers Feature
- [ ] 1.1 Create Supplier Entity and Migration
- [ ] 1.2 Create Supplier DTOs (SupplierDto, CreateSupplierRequest, UpdateSupplierRequest)
- [ ] 1.3 Create ISupplierService interface
- [ ] 1.4 Implement SupplierService with validation and multi-tenancy
- [ ] 1.5 Create SuppliersController with CRUD endpoints
- [ ] 1.6 Create Frontend Types (supplier.types.ts)
- [ ] 1.7 Create suppliersApi.ts with RTK Query endpoints
- [ ] 1.8 Create SuppliersPage component
- [ ] 1.9 Create SupplierFormModal component
- [ ] 1.10 Add Suppliers to navigation (Admin only)
- [ ] 1.11 Write integration tests for Supplier CRUD
- [ ] 1.12 Write E2E tests for Suppliers feature

## Phase 2: Important Improvements (🟡 Priority)

### 2. Add Filters to Categories Page
- [ ] 2.1 Update CategoriesController to accept search and pagination params
- [ ] 2.2 Update CategoryService with search and pagination logic
- [ ] 2.3 Add search input to CategoriesPage
- [ ] 2.4 Add pagination controls to CategoriesPage

### 3. Add Filters to Orders Page
- [ ] 3.1 Update OrdersController to accept status, date range, and pagination params
- [ ] 3.2 Update OrderService with filtering and pagination logic
- [ ] 3.3 Add status dropdown filter to OrdersPage
- [ ] 3.4 Add date range picker to OrdersPage
- [ ] 3.5 Add pagination controls to OrdersPage
- [ ] 3.6 Update ordersApi.ts to support filter parameters

### 4. Complete Loyalty Points UI
- [ ] 4.1 Add "Add Points" button to CustomerDetailsModal
- [ ] 4.2 Add "Redeem Points" button to CustomerDetailsModal
- [ ] 4.3 Create LoyaltyPointsModal component
- [ ] 4.4 Implement points validation (positive values, sufficient balance)
- [ ] 4.5* Add loyalty points history display (optional)

### 5. Create Branches Management Page
- [ ] 5.1 Create BranchesPage component with table
- [ ] 5.2 Create BranchFormModal component
- [ ] 5.3 Add Branches link to navigation (Admin only)
- [ ] 5.4 Implement CRUD operations for branches
- [ ] 5.5 Add validation for branch fields

### 6. Add Advanced Filters to Products
- [ ] 6.1 Update ProductsController to accept isActive and lowStock params
- [ ] 6.2 Update ProductService with new filter logic
- [ ] 6.3 Add "Active Only" checkbox to ProductsPage
- [ ] 6.4 Add "Low Stock Only" checkbox to ProductsPage
- [ ] 6.5 Add sorting dropdown to ProductsPage

### 7. Improve API Error Handling
- [ ] 7.1 Create ErrorBoundary component
- [ ] 7.2 Wrap main routes with error boundaries
- [ ] 7.3 Add retry mechanism for failed API calls
- [ ] 7.4 Improve error messages mapping
- [ ] 7.5 Add error logging for debugging

## Phase 3: Nice to Have Improvements (🟢 Priority)

### 8. Optimize Client-Side Filtering
- [ ] 8.1 Detect catalog size (> 500 products)
- [ ] 8.2 Switch to server-side filtering for large catalogs
- [ ] 8.3 Add loading states during filtering

### 9. Clean Up Unused Endpoints
- [ ] 9.1 Review and remove unused products/category endpoint
- [ ] 9.2 Document or remove unused payments endpoints
- [ ] 9.3 Update API documentation

### 10. Display Unused Product Properties
- [ ] 10.1 Show ReorderPoint in product display
- [ ] 10.2 Show LastStockUpdate in inventory section
- [ ] 10.3 Format dates properly

### 11. Display Refund Details
- [ ] 11.1 Add Refund Information section to OrderDetailsModal
- [ ] 11.2 Display RefundedAt, RefundReason, RefundAmount
- [ ] 11.3 Display RefundedBy user name

### 12. Improve Error Handling (Error Codes)
- [ ] 12.1 Create error codes constants file
- [ ] 12.2 Create error messages mapping
- [ ] 12.3 Update API error interceptor to handle error codes
- [ ] 12.4 Map error codes to user-friendly Arabic messages

### 13. Add Inventory History Pagination
- [ ] 13.1 Add pagination controls to stock history display
- [ ] 13.2 Implement page navigation
- [ ] 13.3 Show total count

### 14. Update API Documentation
- [ ] 14.1 Add Suppliers section to API docs
- [ ] 14.2 Document all new filter parameters
- [ ] 14.3 Add examples for new endpoints
- [ ] 14.4 Update phase status in documentation
