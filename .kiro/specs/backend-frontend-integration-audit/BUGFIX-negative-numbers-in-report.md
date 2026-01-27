# 🐛 Bug Fix: Negative Numbers in Daily Report

**Date:** 27 يناير 2026  
**Priority:** 🔴 CRITICAL  
**Status:** ✅ FIXED

---

## 🔍 Problem Description

User reported seeing **NEGATIVE NUMBERS** in the Daily Report:
- **إجمالي المبيعات: -133.12 ج.م** (negative!)
- **المبيعات بالساعة: -133.12 ج.م** (negative!)

This is a CRITICAL bug that makes the report completely unusable and misleading.

### Symptoms
- Total sales showing negative values
- Hourly sales showing negative values
- Report appears to show losses instead of profits
- Confusing and incorrect financial data

---

## 🕵️ Root Cause Analysis

### The Bug

**File:** `src/KasserPro.Application/Services/Implementations/ReportService.cs`  
**Lines:** 30-35

```csharp
// ❌ BUGGY CODE
// Filter completed orders for sales calculations
var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed).ToList();
```

**Problem:** The code was including **ALL completed orders** in sales calculations, including **Return Orders** (طلبات الإرجاع).

### Why This Causes Negative Numbers

In KasserPro, when a refund is processed:
1. A new order is created with `OrderType = Return`
2. The order has `Status = Completed`
3. The order `Total` is **NEGATIVE** (e.g., -133.12)

When the report calculates total sales:
```csharp
var totalSales = completedOrders.Sum(o => o.Total);
// If there are more returns than sales: -133.12 + 50.00 = -83.12 (NEGATIVE!)
```

### Financial Logic Error

**Correct Logic:**
- **Sales** = Sum of completed orders (EXCLUDING returns)
- **Refunds** = Sum of return orders (shown separately)
- **Net Sales** = Sales - Refunds

**Buggy Logic:**
- **Sales** = Sum of ALL completed orders (INCLUDING returns with negative totals)
- Result: Negative sales when refunds > sales

---

## ✅ The Fix

### Backend Changes

**1. Filter Out Return Orders from Sales**

```csharp
// ✅ FIXED CODE
// Filter completed orders for sales calculations (EXCLUDE Return orders)
var completedOrders = orders
    .Where(o => o.Status == OrderStatus.Completed && o.OrderType != OrderType.Return)
    .ToList();

// Get return orders separately for refund calculations
var returnOrders = orders
    .Where(o => o.Status == OrderStatus.Completed && o.OrderType == OrderType.Return)
    .ToList();
```

**2. Calculate Refunds Separately**

```csharp
// ✅ FIXED CODE
// Calculate sales totals (EXCLUDING returns)
var grossSales = completedOrders.Sum(o => o.Subtotal);
var totalDiscount = completedOrders.Sum(o => o.DiscountAmount);
var totalTax = completedOrders.Sum(o => o.TaxAmount);
var totalSales = completedOrders.Sum(o => o.Total);
var netSales = grossSales - totalDiscount;

// Calculate refunds from return orders
var totalRefunds = Math.Abs(returnOrders.Sum(o => o.Total)); // Make positive for display
```

**3. Add TotalRefunds to DTO**

```csharp
// File: src/KasserPro.Application/DTOs/Reports/ReportDto.cs
public class DailyReportDto
{
    // ... existing fields ...
    
    public decimal TotalSales { get; set; }      // Final total (Net + Tax)
    public decimal TotalRefunds { get; set; }    // Total refunds from return orders ← NEW
    
    // ... rest of fields ...
}
```

**4. Include TotalRefunds in Report**

```csharp
var report = new DailyReportDto
{
    // ... existing fields ...
    
    TotalSales = totalSales,
    TotalRefunds = totalRefunds,  // ← NEW
    
    // ... rest of fields ...
};
```

---

## 📝 Files Changed

### Modified Files

1. **src/KasserPro.Application/Services/Implementations/ReportService.cs**
   - Added filter to exclude Return orders from sales calculations
   - Added separate calculation for refunds
   - Lines 30-40 modified

2. **src/KasserPro.Application/DTOs/Reports/ReportDto.cs**
   - Added `TotalRefunds` property to `DailyReportDto`
   - Line 21 added

---

## 🧪 Testing

### Test Scenarios

**Scenario 1: Normal Sales (No Returns)**
- Create 5 completed orders with total = 500 ج.م
- Expected: Total Sales = 500 ج.م ✅
- Expected: Total Refunds = 0 ج.م ✅

**Scenario 2: Sales with Returns**
- Create 5 completed orders with total = 500 ج.م
- Create 2 return orders with total = -150 ج.م
- Expected: Total Sales = 500 ج.م ✅
- Expected: Total Refunds = 150 ج.م ✅
- Expected: Net = 350 ج.م ✅

**Scenario 3: More Returns than Sales (Edge Case)**
- Create 2 completed orders with total = 100 ج.م
- Create 3 return orders with total = -200 ج.م
- Expected: Total Sales = 100 ج.م ✅
- Expected: Total Refunds = 200 ج.م ✅
- Expected: Net = -100 ج.م (loss) ✅

### Manual Testing Steps

1. **Open Daily Report:**
   - Go to Reports → Daily Report
   - Select today's date

2. **Verify Positive Numbers:**
   - Check "إجمالي المبيعات" → Should be positive ✅
   - Check "المبيعات بالساعة" → Should be positive ✅
   - Check all payment methods → Should be positive ✅

3. **Process a Refund:**
   - Go to Orders page
   - Find a completed order
   - Click "إرجاع" (Refund)
   - Process full refund

4. **Check Report Again:**
   - Go back to Daily Report
   - Verify "إجمالي المبيعات" is still positive ✅
   - Verify "المرتجعات" shows refund amount ✅

---

## 🎯 Impact

### Before Fix
- ❌ Negative sales numbers in report
- ❌ Confusing and misleading financial data
- ❌ Impossible to understand actual sales performance
- ❌ Return orders mixed with sales orders
- ❌ No way to see refunds separately

### After Fix
- ✅ Sales always show positive numbers (actual sales)
- ✅ Refunds shown separately as positive numbers
- ✅ Clear distinction between sales and returns
- ✅ Accurate financial reporting
- ✅ Easy to understand net sales (sales - refunds)

---

## 📚 Lessons Learned

### Financial Reporting Best Practices

1. **Separate Sales from Returns:** Never mix positive and negative transactions in the same calculation
2. **Show Refunds Separately:** Always display refunds as a separate line item
3. **Use Absolute Values:** Display refunds as positive numbers for clarity
4. **Filter by Order Type:** Always check `OrderType` when calculating sales
5. **Test Edge Cases:** Test scenarios where refunds > sales

### Order Type Handling

```csharp
// ✅ GOOD - Explicit filtering
var sales = orders.Where(o => o.Status == OrderStatus.Completed 
                           && o.OrderType != OrderType.Return);
var returns = orders.Where(o => o.Status == OrderStatus.Completed 
                             && o.OrderType == OrderType.Return);

// ❌ BAD - Mixing sales and returns
var all = orders.Where(o => o.Status == OrderStatus.Completed);
var total = all.Sum(o => o.Total); // Can be negative!
```

### Code Review Checklist

When implementing financial reports:
- [ ] Separate sales from returns
- [ ] Show refunds as separate line item
- [ ] Use absolute values for refunds
- [ ] Filter by OrderType explicitly
- [ ] Test with negative totals
- [ ] Test edge case: refunds > sales
- [ ] Verify all numbers are positive (except net profit/loss)

---

## 🔄 Future Improvements

### Frontend Display (Optional)

Consider adding a "المرتجعات" (Refunds) card to the Daily Report page:

```typescript
<Card>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
      <RotateCcw className="w-6 h-6 text-red-500" />
    </div>
    <div>
      <p className="text-sm text-gray-500">المرتجعات</p>
      <p className="text-2xl font-bold text-red-600">
        {formatCurrency(report?.totalRefunds || 0)}
      </p>
      <p className="text-xs text-gray-400">إجمالي المرتجعات</p>
    </div>
  </div>
</Card>
```

### Net Sales Calculation

Consider showing "صافي المبيعات" (Net Sales after refunds):

```typescript
const netSalesAfterRefunds = (report?.totalSales || 0) - (report?.totalRefunds || 0);
```

---

## ✅ Task Status Update

**Bug:** Negative Numbers in Daily Report

**Status:** ✅ **FIXED**

**Changes:**
- [x] Backend: Filter out Return orders from sales
- [x] Backend: Calculate refunds separately
- [x] Backend: Add TotalRefunds to DTO
- [x] Backend: Include TotalRefunds in report
- [x] Testing: Verified positive numbers
- [x] Documentation: Updated bug fix document

---

**Fixed by:** Kiro AI Assistant  
**Date:** 27 يناير 2026  
**Time to Fix:** 20 minutes (investigation + fix + testing)

---

## 📊 Technical Details

### Order Types in KasserPro

```csharp
public enum OrderType
{
    DineIn = 0,    // تناول في المكان
    Takeaway = 1,  // تيك أواي
    Delivery = 2,  // توصيل
    Return = 3     // مرتجع (Created when processing refunds)
}
```

### Refund Process

When a refund is processed in KasserPro:
1. Original order status changes to `Refunded` or `PartiallyRefunded`
2. A new order is created with:
   - `OrderType = Return`
   - `Status = Completed`
   - `Total = -[refund amount]` (negative)
   - `RefundAmount` field set
3. Stock is adjusted (returned to inventory)
4. Payment is recorded as negative

### Financial Calculations

**Correct Formula:**
```
Gross Sales = Sum(Subtotal) for non-return orders
Total Discount = Sum(DiscountAmount) for non-return orders
Net Sales = Gross Sales - Total Discount
Total Tax = Sum(TaxAmount) for non-return orders
Total Sales = Net Sales + Total Tax
Total Refunds = Abs(Sum(Total)) for return orders
Final Net = Total Sales - Total Refunds
```

---

**End of Bug Fix Document**
