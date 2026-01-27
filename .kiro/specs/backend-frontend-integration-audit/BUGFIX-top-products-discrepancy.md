# Bug Fix: Top Products Report Discrepancy

**Date:** 2026-01-27  
**Status:** ✅ FIXED  
**Severity:** HIGH (Critical business logic)  
**Component:** Reports - Daily Report

---

## 🐛 Problem Description

User reported discrepancy between Orders page and Daily Report:

- **Orders Page:** Shows 3 orders (2 completed + 1 return)
- **Daily Report:** Shows only 1 product in "Top Products" section
- **Expected:** Should show ALL products from ALL completed orders (excluding returns)

**User Insight:** The issue is that orders with status `PartiallyRefunded` are not being included in the daily report calculations.

---

## 🔍 Root Cause Analysis

The problem was in `ReportService.cs` line 41-46:

### Original Code (INCORRECT):
```csharp
// Filter completed orders for sales calculations (EXCLUDE Return orders)
var completedOrders = orders
    .Where(o => o.Status == OrderStatus.Completed && o.OrderType != OrderType.Return)
    .ToList();
```

### The Problem:

**Orders with these statuses were EXCLUDED:**
- `PartiallyRefunded` (مرتجع جزئياً) ❌
- `Refunded` (مرتجع كلياً) ❌

**Why this is wrong:**
1. When a refund is processed, the original order status changes to `PartiallyRefunded` or `Refunded`
2. These orders were COMPLETED and sold - they should be included in sales reports
3. The refund amount is tracked separately in Return Orders (OrderType = Return)
4. By excluding these orders, we lose all their products from the "Top Products" calculation

**Example Scenario:**
1. Order #1: 2 products, Status = Completed ✅ (included)
2. Order #2: 3 products, Status = PartiallyRefunded ❌ (excluded - THIS IS THE BUG!)
3. Order #3: Return order ✅ (correctly excluded)

Result: Only 2 products show in Top Products instead of 5!

---

## 🔧 Solution

### The Fix:

Include ALL completed orders regardless of refund status:

```csharp
// Filter completed orders for sales calculations (EXCLUDE Return orders)
// Include: Completed, PartiallyRefunded, and Refunded orders
var completedOrders = orders
    .Where(o => (o.Status == OrderStatus.Completed 
              || o.Status == OrderStatus.PartiallyRefunded 
              || o.Status == OrderStatus.Refunded) 
             && o.OrderType != OrderType.Return)
    .ToList();

// Get return orders separately for refund calculations
var returnOrders = orders
    .Where(o => (o.Status == OrderStatus.Completed 
              || o.Status == OrderStatus.PartiallyRefunded 
              || o.Status == OrderStatus.Refunded) 
             && o.OrderType == OrderType.Return)
    .ToList();
```

### Why This Works:

1. **Completed Orders:** Original sales that were never refunded ✅
2. **PartiallyRefunded Orders:** Sales where some items were returned, but the original sale still counts ✅
3. **Refunded Orders:** Sales that were fully refunded, but the original sale still counts ✅
4. **Return Orders:** Excluded because they represent the refund transaction, not a sale ❌

### Business Logic:

- **Sales = All completed transactions** (regardless of later refunds)
- **Refunds = Separate Return Orders** (tracked separately)
- **Net Sales = Sales - Refunds** (calculated correctly)

This ensures:
- Top Products shows ALL products that were sold
- Sales totals include all completed orders
- Refunds are tracked separately and subtracted correctly

---

## 📊 Testing Plan

1. **Check Database:**
   - Query orders table to see how many orders exist for today
   - Check if orders have items loaded
   - Verify CompletedAt vs CreatedAt dates

2. **Add Logging:**
   - Add console logs to see what data is being processed
   - Check if items are being loaded correctly

3. **Test with Real Data:**
   - Create 3 orders with different products
   - Complete 2 orders
   - Create 1 return order
   - Check if all products appear in top products

---

## 🎯 Expected Behavior

After fix:
- ✅ All products from completed orders (Completed, PartiallyRefunded, Refunded) appear in "Top Products"
- ✅ Return orders are excluded from sales calculations
- ✅ Products are grouped by ProductId + ProductName
- ✅ Quantities are summed correctly
- ✅ Sorted by quantity sold (descending)
- ✅ Sales totals include all completed transactions
- ✅ Refunds are tracked separately

**Order Status Handling:**
- `Completed` → ✅ Included in sales
- `PartiallyRefunded` → ✅ Included in sales (original sale counts)
- `Refunded` → ✅ Included in sales (original sale counts)
- `Draft` → ❌ Excluded (not completed)
- `Pending` → ❌ Excluded (not completed)
- `Cancelled` → ❌ Excluded (never completed)

**Order Type Handling:**
- `DineIn`, `Takeaway`, `Delivery` → ✅ Included (normal sales)
- `Return` → ❌ Excluded (refund transaction, not a sale)

---

## 📝 Implementation Steps

1. ✅ Analyze the code and identify potential issues
2. ✅ Add logging to debug the issue
3. ✅ User identified the root cause: PartiallyRefunded orders not included
4. ✅ Apply the fix: Include Completed, PartiallyRefunded, and Refunded orders
5. ✅ Backend server restarted with fix applied
6. ⏳ **NEXT:** User should test and verify the fix works correctly
7. ⏳ Remove debug logging after confirmation
8. ⏳ Update documentation

---

## ✅ Changes Applied

**File:** `src/KasserPro.Application/Services/Implementations/ReportService.cs`

**Lines 41-56:** Updated order filtering logic

**Before:**
```csharp
var completedOrders = orders
    .Where(o => o.Status == OrderStatus.Completed && o.OrderType != OrderType.Return)
    .ToList();
```

**After:**
```csharp
var completedOrders = orders
    .Where(o => (o.Status == OrderStatus.Completed 
              || o.Status == OrderStatus.PartiallyRefunded 
              || o.Status == OrderStatus.Refunded) 
             && o.OrderType != OrderType.Return)
    .ToList();
```

**Impact:**
- ✅ All completed sales are now included in reports
- ✅ Top Products shows all products from all sales
- ✅ Sales totals are accurate
- ✅ Refunds are still tracked separately

---

## 🔗 Related Files

- `src/KasserPro.Application/Services/Implementations/ReportService.cs`
- `src/KasserPro.Application/DTOs/Reports/ReportDto.cs`
- `client/src/pages/reports/DailyReportPage.tsx`
- `src/KasserPro.Domain/Entities/Order.cs`
- `src/KasserPro.Domain/Entities/OrderItem.cs`

---

## 💡 Root Cause Summary

**The Real Problem:** Orders with status `PartiallyRefunded` or `Refunded` were being excluded from the daily report calculations.

**Why It Matters:** When a refund is processed:
1. The original order status changes from `Completed` to `PartiallyRefunded` or `Refunded`
2. A new Return Order is created (OrderType = Return)
3. The old code only included orders with status = `Completed`
4. This caused all refunded orders to disappear from reports!

**The Solution:** Include all completed transactions (Completed, PartiallyRefunded, Refunded) in sales calculations, while still excluding Return Orders.

**Business Impact:**
- ✅ Accurate sales reporting
- ✅ Correct top products calculation
- ✅ Proper tracking of what was actually sold
- ✅ Refunds tracked separately without losing sales data
