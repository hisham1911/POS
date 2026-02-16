using KasserPro.Infrastructure.Data;
using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KasserPro.API;

public static class SeedTestCategories
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Check if we already have many categories
        var existingCount = await context.Categories.CountAsync(c => !c.IsDeleted);
        if (existingCount >= 30)
        {
            Console.WriteLine($"Already have {existingCount} categories. Skipping seed.");
            return;
        }

        var categories = new List<Category>
        {
            new() { TenantId = 1, Name = "مشروبات ساخنة", NameEn = "Hot Beverages", Description = "قهوة وشاي ومشروبات ساخنة", SortOrder = 1, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مشروبات باردة", NameEn = "Cold Beverages", Description = "عصائر ومشروبات غازية", SortOrder = 2, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "وجبات سريعة", NameEn = "Fast Food", Description = "برجر وساندويتشات", SortOrder = 3, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "معجنات", NameEn = "Pastries", Description = "كرواسون وفطائر", SortOrder = 4, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "حلويات", NameEn = "Desserts", Description = "كيك وآيس كريم", SortOrder = 5, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "سلطات", NameEn = "Salads", Description = "سلطات طازجة", SortOrder = 6, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مقبلات", NameEn = "Appetizers", Description = "مقبلات متنوعة", SortOrder = 7, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "أطباق رئيسية", NameEn = "Main Dishes", Description = "وجبات رئيسية", SortOrder = 8, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "بيتزا", NameEn = "Pizza", Description = "بيتزا بأنواعها", SortOrder = 9, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "باستا", NameEn = "Pasta", Description = "معكرونة إيطالية", SortOrder = 10, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مأكولات بحرية", NameEn = "Seafood", Description = "أسماك وجمبري", SortOrder = 11, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "دجاج", NameEn = "Chicken", Description = "أطباق دجاج", SortOrder = 12, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "لحوم", NameEn = "Meat", Description = "لحوم حمراء", SortOrder = 13, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "نباتي", NameEn = "Vegetarian", Description = "أطباق نباتية", SortOrder = 14, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "إفطار", NameEn = "Breakfast", Description = "وجبات إفطار", SortOrder = 15, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "سناكس", NameEn = "Snacks", Description = "وجبات خفيفة", SortOrder = 16, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "شوربة", NameEn = "Soup", Description = "أنواع الشوربة", SortOrder = 17, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "عصائر طبيعية", NameEn = "Fresh Juices", Description = "عصائر طازجة", SortOrder = 18, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مخبوزات", NameEn = "Bakery", Description = "خبز ومخبوزات", SortOrder = 19, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "آيس كريم", NameEn = "Ice Cream", Description = "آيس كريم بالنكهات", SortOrder = 20, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مشروبات صحية", NameEn = "Healthy Drinks", Description = "سموذي وديتوكس", SortOrder = 21, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "وجبات أطفال", NameEn = "Kids Meals", Description = "وجبات للأطفال", SortOrder = 22, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "كومبو", NameEn = "Combo Meals", Description = "وجبات كومبو", SortOrder = 23, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مقليات", NameEn = "Fried Food", Description = "أطعمة مقلية", SortOrder = 24, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مشويات", NameEn = "Grilled", Description = "مشويات متنوعة", SortOrder = 25, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "أرز", NameEn = "Rice", Description = "أطباق أرز", SortOrder = 26, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "صوصات", NameEn = "Sauces", Description = "صوصات وإضافات", SortOrder = 27, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "مكسرات", NameEn = "Nuts", Description = "مكسرات ومقرمشات", SortOrder = 28, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "فواكه", NameEn = "Fruits", Description = "فواكه طازجة", SortOrder = 29, IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { TenantId = 1, Name = "منتجات ألبان", NameEn = "Dairy Products", Description = "حليب وأجبان", SortOrder = 30, IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
        
        Console.WriteLine($"✅ Added {categories.Count} test categories successfully!");
    }
}
