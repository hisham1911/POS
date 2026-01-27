# Bug Fix: Top Products Should Show NET Sales (After Refunds)

**Date:** 2026-01-27  
**Status:** ✅ FIXED  
**Severity:** CRITICAL (Business Logic Error)  
**Component:** Reports - Daily Report

---

## 🐛 Problem Description

**User Report:** 
- Original invoice: 16 products sold
- Partial refund: 10 products returned
- **Expected in report:** 6 products (net sales)
- **Actual in report:** 16 products ❌

**Additional Issues:**
1. Top Products shows GROSS quantities (before refunds) instead of NET quantities
2. Total Sales doesn't subtract refunds - shows inflated numbers
3. Report shows unrealistic figures that don't match actual business

---

## 🔍 Root Cause Analysis

### Previous Code (INCORRECT):

```csharp
// Only calculated GROSS sales (before refunds)
var topProducts = completedOrders
    .SelectMany(o => o.Items)
    .GroupBy(i => new { i.ProductId, i.ProductName })
    .Select(g => new TopProductDto
    {
        ProductId = g.Key.ProductId,
        ProductName = g.Key.ProductName,
        QuantitySold = g.Sum(i => i.Quantity), // ❌ Doesn't subtract returns!
        TotalSales = g.Sum(i => i.Total)        // ❌ Doesn't subtract returns!
    })
    .ToList();
```

### The Problem:

**The code was calculating GROSS sales, not NET sales:**

1. **Sales Items:** 16 products sold = 16 counted ✅
2. **Return Items:** 10 products returned = NOT subtracted ❌
3. **Result:** Report shows 16 instead of 6 (16 - 10)

**Business Impact:**
- ❌ Inflated sales figures
- ❌ Incorrect inventory insights
- ❌ Wrong top products ranking
- ❌ Misleading business decisions

---

## 🔧 Solution

### The Fix: Calculate NET Sales (Sales - Returns)

```csharp
// Step 1: Get all sales items
var allSalesItems = completedOrders.SelectMany(o => o.Items).ToList();

// Step 2: Get all return items
var allReturnItems = returnOrders.SelectMany(o => o.Items).ToList();

// Step 3: Group sales by product
var salesByProduct = allSalesItems
    .GroupBy(i => new { i.ProductId, i.ProductName })
    .Select(g => new
    {
        g.Key.ProductId,
        g.Key.ProductName,
        QuantitySold = g.Sum(i => i.Quantity),
        TotalSales = g.Sum(i => i.Total)
    })
    .ToList();

// Step 4: Group returns by product
var returnsByProduct = allReturnItems
    .GroupBy(i => new { i.ProductId, i.ProductName })
    .Select(g => new
    {
        g.Key.ProductId,
        QuantityReturned = Math.Abs(g.Sum(i => i.Quantity)),
        TotalReturns = Math.Abs(g.Sum(i => i.Total))
    })
    .ToDictionary(x => x.ProductId);

// Step 5: Calculate NET sales (sales - returns)
var topProducts = salesByProduct
    .Select(s => new TopProductDto
    {
        ProductId = s.ProductId,
        ProductName = s.ProductName,
        QuantitySold = s.QuantitySold - (returnsByProduct.ContainsKey(s.ProductId) 
            ? returnsByProduct[s.ProductId].QuantityReturned 
            : 0),
        TotalSales = s.TotalSales - (returnsByProduct.ContainsKey(s.ProductId) 
            ? returnsByProduct[s.ProductId].TotalReturns 
            : 0)
    })
    .Where(p => p.QuantitySold > 0) // Only show products with net positive sales
    .OrderByDescending(p => p.QuantitySold)
    .Take(10)
    .ToList();
```

### Sales Totals Fix:

```csharp
// Calculate ACTUAL sales (after subtracting refunds)
var actualGrossSales = grossSales - Math.Abs(returnOrders.Sum(o => o.Subtotal));
var actualTotalTax = totalTax - Math.Abs(returnOrders.Sum(o => o.TaxAmount));
var actualTotalSales = totalSales - totalRefunds;
var actualNetSales = netSales - Math.Abs(returnOrders.Sum(o => o.Subtotal - o.DiscountAmount));
```

---

## 📊 Example Calculation

### Scenario:
- **Order #1:** 16 products sold, Total = 1600 EGP
- **Return Order #1:** 10 products returned, Total = -1000 EGP

### Before Fix (WRONG):
```
Top Products:
- Product A: 16 units, 1600 EGP ❌

Total Sales: 1600 EGP ❌
```

### After Fix (CORRECT):
```
Top Products:
- Product A: 6 units (16 - 10), 600 EGP (1600 - 1000) ✅

Total Sales: 600 EGP ✅
Total Refunds: 1000 EGP ✅
```

---

## ✅ Changes Applied

**File:** `src/KasserPro.Application/Services/Implementations/ReportService.cs`

**Changes:**
1. ✅ Calculate NET quantities for top products (sales - returns)
2. ✅ Calculate ACTUAL sales totals (after subtracting refunds)
3. ✅ Filter out products with zero or negative net sales
4. ✅ Added detailed logging to debug calculations

**Impact:**
- ✅ Accurate sales reporting
- ✅ Correct top products ranking
- ✅ Realistic business figures
- ✅ Better inventory insights

---

## 🎯 Expected Behavior

After fix:
- ✅ Top Products shows NET quantities (after refunds)
- ✅ Total Sales shows ACTUAL sales (after refunds)
- ✅ Products with full refunds don't appear in top products
- ✅ Refunds are tracked separately and displayed
- ✅ All numbers match actual business reality

**Example:**
- Sold 16 units, returned 10 units → Shows 6 units ✅
- Sold 1600 EGP, refunded 1000 EGP → Shows 600 EGP ✅

---

## 🔗 Related Files

- `src/KasserPro.Application/Services/Implementations/ReportService.cs`
- `src/KasserPro.Application/DTOs/Reports/ReportDto.cs`
- `client/src/pages/reports/DailyReportPage.tsx`

---

## 💡 Business Logic Summary

**Correct Approach:**
1. **Gross Sales** = Sum of all completed orders (before refunds)
2. **Refunds** = Sum of all return orders
3. **Net Sales** = Gross Sales - Refunds ✅
4. **Top Products** = Products ranked by NET quantities (sales - returns) ✅

**Why This Matters:**
- Accurate inventory tracking
- Correct profitability analysis
- Realistic sales forecasting
- Better business decisions
