namespace KasserPro.Tests.Unit;

using Xunit;
using KasserPro.Domain.Entities;

/// <summary>
/// Unit tests for Order financial calculations.
/// Verifies that Egypt VAT (14% Tax Inclusive) is calculated correctly.
/// 
/// Tax Inclusive Formula:
///   netPrice = grossPrice / (1 + taxRate/100)
///   taxAmount = grossPrice - netPrice
/// 
/// Example (100 EGP with 14% VAT inclusive):
///   netPrice = 100 / 1.14 = 87.72 EGP
///   taxAmount = 100 - 87.72 = 12.28 EGP
/// </summary>
public class OrderFinancialTests
{
    private const decimal EgyptVatRate = 14m;

    #region Tax Calculation Tests

    [Fact]
    public void CalculateTax_100EGP_TaxInclusive_Returns12_28Tax()
    {
        // Arrange
        var item = new OrderItem
        {
            UnitPrice = 100m,
            Quantity = 1,
            TaxRate = EgyptVatRate,
            TaxInclusive = true
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(100m, item.Subtotal);
        Assert.Equal(100m, item.Total);
        Assert.Equal(12.28m, item.TaxAmount); // 100 - (100 / 1.14) = 12.28
    }

    [Fact]
    public void CalculateTax_50EGP_TaxInclusive_Returns6_14Tax()
    {
        // Arrange
        var item = new OrderItem
        {
            UnitPrice = 50m,
            Quantity = 1,
            TaxRate = EgyptVatRate,
            TaxInclusive = true
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(50m, item.Subtotal);
        Assert.Equal(50m, item.Total);
        Assert.Equal(6.14m, item.TaxAmount); // 50 - (50 / 1.14) = 6.14
    }

    [Fact]
    public void CalculateTax_25EGP_Quantity2_TaxInclusive_Returns6_14Tax()
    {
        // Arrange: 25 EGP × 2 = 50 EGP total
        var item = new OrderItem
        {
            UnitPrice = 25m,
            Quantity = 2,
            TaxRate = EgyptVatRate,
            TaxInclusive = true
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(50m, item.Subtotal);
        Assert.Equal(50m, item.Total);
        Assert.Equal(6.14m, item.TaxAmount); // 50 - (50 / 1.14) = 6.14
    }

    [Fact]
    public void CalculateTax_TaxExclusive_AddsTaxOnTop()
    {
        // Arrange: 100 EGP + 14% tax = 114 EGP
        var item = new OrderItem
        {
            UnitPrice = 100m,
            Quantity = 1,
            TaxRate = EgyptVatRate,
            TaxInclusive = false
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(100m, item.Subtotal);
        Assert.Equal(14m, item.TaxAmount); // 100 × 0.14 = 14
        Assert.Equal(114m, item.Total);    // 100 + 14 = 114
    }

    #endregion

    #region Order Total Tests

    [Fact]
    public void OrderTotal_ThreeItems_100EGP_TaxInclusive_Returns12_28Tax()
    {
        // Arrange: 3 items totaling 100 EGP (tax inclusive)
        // Item 1: 40 EGP
        // Item 2: 35 EGP
        // Item 3: 25 EGP
        // Total: 100 EGP
        var order = new Order();
        
        var item1 = new OrderItem { UnitPrice = 40m, Quantity = 1, TaxRate = EgyptVatRate, TaxInclusive = true };
        var item2 = new OrderItem { UnitPrice = 35m, Quantity = 1, TaxRate = EgyptVatRate, TaxInclusive = true };
        var item3 = new OrderItem { UnitPrice = 25m, Quantity = 1, TaxRate = EgyptVatRate, TaxInclusive = true };

        CalculateItemTotals(item1);
        CalculateItemTotals(item2);
        CalculateItemTotals(item3);

        order.Items.Add(item1);
        order.Items.Add(item2);
        order.Items.Add(item3);

        // Act
        CalculateOrderTotals(order);

        // Assert
        Assert.Equal(100m, order.Subtotal);
        Assert.Equal(100m, order.Total);
        
        // Tax calculation per item:
        // Item 1: 40 - (40 / 1.14) = 40 - 35.09 = 4.91
        // Item 2: 35 - (35 / 1.14) = 35 - 30.70 = 4.30
        // Item 3: 25 - (25 / 1.14) = 25 - 21.93 = 3.07
        // Total Tax: 4.91 + 4.30 + 3.07 = 12.28
        Assert.Equal(12.28m, order.TaxAmount);
    }

    [Fact]
    public void OrderTotal_SingleItem_100EGP_TaxInclusive_MatchesExpected()
    {
        // Arrange
        var order = new Order();
        var item = new OrderItem { UnitPrice = 100m, Quantity = 1, TaxRate = EgyptVatRate, TaxInclusive = true };
        
        CalculateItemTotals(item);
        order.Items.Add(item);

        // Act
        CalculateOrderTotals(order);

        // Assert
        Assert.Equal(100m, order.Subtotal);
        Assert.Equal(100m, order.Total);
        Assert.Equal(12.28m, order.TaxAmount);
        Assert.Equal(0m, order.DiscountAmount);
    }

    #endregion

    #region Discount Tests

    [Fact]
    public void ItemDiscount_Percentage_CalculatesCorrectly()
    {
        // Arrange: 100 EGP with 10% discount = 90 EGP
        var item = new OrderItem
        {
            UnitPrice = 100m,
            Quantity = 1,
            TaxRate = EgyptVatRate,
            TaxInclusive = true,
            DiscountType = "percentage",
            DiscountValue = 10m
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(100m, item.Subtotal);
        Assert.Equal(10m, item.DiscountAmount);
        Assert.Equal(90m, item.Total);
        // Tax on 90 EGP: 90 - (90 / 1.14) = 90 - 78.95 = 11.05
        Assert.Equal(11.05m, item.TaxAmount);
    }

    [Fact]
    public void ItemDiscount_Fixed_CalculatesCorrectly()
    {
        // Arrange: 100 EGP with 15 EGP fixed discount = 85 EGP
        var item = new OrderItem
        {
            UnitPrice = 100m,
            Quantity = 1,
            TaxRate = EgyptVatRate,
            TaxInclusive = true,
            DiscountType = "fixed",
            DiscountValue = 15m
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(100m, item.Subtotal);
        Assert.Equal(15m, item.DiscountAmount);
        Assert.Equal(85m, item.Total);
        // Tax on 85 EGP: 85 - (85 / 1.14) = 85 - 74.56 = 10.44
        Assert.Equal(10.44m, item.TaxAmount);
    }

    [Fact]
    public void OrderDiscount_Percentage_CalculatesCorrectly()
    {
        // Arrange: 100 EGP order with 10% order-level discount
        var order = new Order
        {
            DiscountType = "percentage",
            DiscountValue = 10m
        };
        
        var item = new OrderItem { UnitPrice = 100m, Quantity = 1, TaxRate = EgyptVatRate, TaxInclusive = true };
        CalculateItemTotals(item);
        order.Items.Add(item);

        // Act
        CalculateOrderTotals(order);

        // Assert
        Assert.Equal(100m, order.Subtotal);
        Assert.Equal(10m, order.DiscountAmount);
        Assert.Equal(90m, order.Total); // 100 - 10 = 90
    }

    #endregion

    #region Rounding Tests

    [Fact]
    public void Rounding_NoFloatingPointErrors()
    {
        // Arrange: Test case that could cause floating-point errors
        var item = new OrderItem
        {
            UnitPrice = 33.33m,
            Quantity = 3,
            TaxRate = EgyptVatRate,
            TaxInclusive = true
        };

        // Act
        CalculateItemTotals(item);

        // Assert: Should be exactly 99.99, not 99.99000000000001
        Assert.Equal(99.99m, item.Subtotal);
        Assert.Equal(99.99m, item.Total);
        
        // Tax: 99.99 - (99.99 / 1.14) = 99.99 - 87.71 = 12.28
        Assert.Equal(12.28m, item.TaxAmount);
    }

    [Fact]
    public void Rounding_SmallAmounts_NoErrors()
    {
        // Arrange: Small amount that could cause precision issues
        var item = new OrderItem
        {
            UnitPrice = 0.99m,
            Quantity = 1,
            TaxRate = EgyptVatRate,
            TaxInclusive = true
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(0.99m, item.Subtotal);
        Assert.Equal(0.99m, item.Total);
        // Tax: 0.99 - (0.99 / 1.14) = 0.99 - 0.87 = 0.12
        Assert.Equal(0.12m, item.TaxAmount);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void ZeroQuantity_ReturnsZeroTotals()
    {
        // Arrange
        var item = new OrderItem
        {
            UnitPrice = 100m,
            Quantity = 0,
            TaxRate = EgyptVatRate,
            TaxInclusive = true
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(0m, item.Subtotal);
        Assert.Equal(0m, item.Total);
        Assert.Equal(0m, item.TaxAmount);
    }

    [Fact]
    public void ZeroTaxRate_NoTaxCalculated()
    {
        // Arrange
        var item = new OrderItem
        {
            UnitPrice = 100m,
            Quantity = 1,
            TaxRate = 0m,
            TaxInclusive = true
        };

        // Act
        CalculateItemTotals(item);

        // Assert
        Assert.Equal(100m, item.Subtotal);
        Assert.Equal(100m, item.Total);
        Assert.Equal(0m, item.TaxAmount);
    }

    #endregion

    #region Helper Methods (Mirror of OrderService logic)

    /// <summary>
    /// Calculate item totals - mirrors OrderService.CalculateItemTotals
    /// </summary>
    private static void CalculateItemTotals(OrderItem item)
    {
        // Subtotal before any discount (gross amount) - rounded to 2 decimal places
        item.Subtotal = Math.Round(item.UnitPrice * item.Quantity, 2);
        
        // Apply discount if any
        if (item.DiscountType == "percentage" && item.DiscountValue.HasValue)
            item.DiscountAmount = Math.Round(item.Subtotal * (item.DiscountValue.Value / 100m), 2);
        else if (item.DiscountType == "fixed" && item.DiscountValue.HasValue)
            item.DiscountAmount = Math.Round(item.DiscountValue.Value, 2);
        else
            item.DiscountAmount = 0;
        
        var afterDiscount = Math.Round(item.Subtotal - item.DiscountAmount, 2);
        
        // Calculate tax amount based on TaxInclusive flag
        if (item.TaxInclusive)
        {
            // Tax Inclusive (Egypt VAT): Price already includes tax
            var grossPrice = afterDiscount;
            var divisor = 1m + (item.TaxRate / 100m);
            var netPrice = Math.Round(grossPrice / divisor, 2);
            item.TaxAmount = Math.Round(grossPrice - netPrice, 2);
            item.Total = afterDiscount;
        }
        else
        {
            // Tax Exclusive: Add tax on top
            item.TaxAmount = Math.Round(afterDiscount * (item.TaxRate / 100m), 2);
            item.Total = Math.Round(afterDiscount + item.TaxAmount, 2);
        }
    }

    /// <summary>
    /// Calculate order totals - mirrors OrderService.CalculateOrderTotals
    /// </summary>
    private static void CalculateOrderTotals(Order order)
    {
        // Sum all item subtotals and tax amounts
        order.Subtotal = Math.Round(order.Items.Sum(i => i.Subtotal), 2);
        order.TaxAmount = Math.Round(order.Items.Sum(i => i.TaxAmount), 2);
        
        // Apply order-level discount
        if (order.DiscountType == "percentage" && order.DiscountValue.HasValue)
            order.DiscountAmount = Math.Round(order.Subtotal * (order.DiscountValue.Value / 100m), 2);
        else if (order.DiscountType == "fixed" && order.DiscountValue.HasValue)
            order.DiscountAmount = Math.Round(order.DiscountValue.Value, 2);
        else
            order.DiscountAmount = 0;
        
        // Calculate service charge
        order.ServiceChargeAmount = Math.Round(order.Subtotal * (order.ServiceChargePercent / 100m), 2);
        
        // Total = Sum of item totals - order discount + service charge
        var itemsTotal = Math.Round(order.Items.Sum(i => i.Total), 2);
        order.Total = Math.Round(itemsTotal - order.DiscountAmount + order.ServiceChargeAmount, 2);
        order.AmountDue = Math.Round(order.Total - order.AmountPaid, 2);
    }

    #endregion
}
