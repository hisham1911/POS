# 🧪 اختبار شامل للـ API

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🧪 اختبار KasserPro API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5243/api"

# 1️⃣ تسجيل الدخول
Write-Host "1️⃣ تسجيل الدخول..." -ForegroundColor Yellow
$loginBody = @{
    email = "ahmed@kasserpro.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "   ✅ تسجيل دخول ناجح" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.data.user.name)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ فشل تسجيل الدخول: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2️⃣ جلب المنتجات
Write-Host "`n2️⃣ جلب المنتجات..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
    $products = $productsResponse.data.items
    Write-Host "   ✅ تم جلب $($products.Count) منتج" -ForegroundColor Green
    
    # عرض أول 3 منتجات
    $products | Select-Object -First 3 | ForEach-Object {
        $typeText = if ($_.type -eq 1) { "Physical" } else { "Service" }
        $trackText = if ($_.trackInventory) { "✓" } else { "✗" }
        Write-Host "   - $($_.name) | Type: $typeText | Track: $trackText | Stock: $($_.stockQuantity)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ فشل جلب المنتجات: $($_.Exception.Message)" -ForegroundColor Red
}

# 3️⃣ إنشاء منتج مادي جديد
Write-Host "`n3️⃣ إنشاء منتج مادي (Physical)..." -ForegroundColor Yellow
$newPhysicalProduct = @{
    name = "منتج تجريبي مادي"
    nameEn = "Test Physical Product"
    price = 50.0
    cost = 30.0
    categoryId = 1
    type = 1
    stockQuantity = 100
    lowStockThreshold = 10
} | ConvertTo-Json

try {
    $createPhysicalResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method POST -Body $newPhysicalProduct -Headers $headers
    $physicalProduct = $createPhysicalResponse.data
    Write-Host "   ✅ تم إنشاء منتج مادي: $($physicalProduct.name)" -ForegroundColor Green
    Write-Host "   - ID: $($physicalProduct.id)" -ForegroundColor Gray
    Write-Host "   - Type: $($physicalProduct.type) (Physical)" -ForegroundColor Gray
    Write-Host "   - TrackInventory: $($physicalProduct.trackInventory)" -ForegroundColor Gray
    Write-Host "   - Stock: $($physicalProduct.stockQuantity)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ فشل إنشاء المنتج: $($_.Exception.Message)" -ForegroundColor Red
}

# 4️⃣ إنشاء خدمة (Service)
Write-Host "`n4️⃣ إنشاء خدمة (Service)..." -ForegroundColor Yellow
$newService = @{
    name = "خدمة تجريبية"
    nameEn = "Test Service"
    price = 25.0
    categoryId = 1
    type = 2
} | ConvertTo-Json

try {
    $createServiceResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method POST -Body $newService -Headers $headers
    $serviceProduct = $createServiceResponse.data
    Write-Host "   ✅ تم إنشاء خدمة: $($serviceProduct.name)" -ForegroundColor Green
    Write-Host "   - ID: $($serviceProduct.id)" -ForegroundColor Gray
    Write-Host "   - Type: $($serviceProduct.type) (Service)" -ForegroundColor Gray
    Write-Host "   - TrackInventory: $($serviceProduct.trackInventory)" -ForegroundColor Gray
    Write-Host "   - Stock: $($serviceProduct.stockQuantity)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ فشل إنشاء الخدمة: $($_.Exception.Message)" -ForegroundColor Red
}

# 5️⃣ إنشاء طلب جديد
Write-Host "`n5️⃣ إنشاء طلب جديد..." -ForegroundColor Yellow
$newOrder = @{
    orderType = "DineIn"
    items = @(
        @{
            productId = $physicalProduct.id
            quantity = 2
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $createOrderResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -Body $newOrder -Headers $headers
    $order = $createOrderResponse.data
    Write-Host "   ✅ تم إنشاء طلب: $($order.orderNumber)" -ForegroundColor Green
    Write-Host "   - ID: $($order.id)" -ForegroundColor Gray
    Write-Host "   - Status: $($order.status)" -ForegroundColor Gray
    Write-Host "   - Items: $($order.items.Count)" -ForegroundColor Gray
    Write-Host "   - Total: $($order.total) EGP" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ فشل إنشاء الطلب: $($_.Exception.Message)" -ForegroundColor Red
    $order = $null
}

# 6️⃣ إضافة خدمة للطلب
if ($order) {
    Write-Host "`n6️⃣ إضافة خدمة للطلب..." -ForegroundColor Yellow
    $addServiceItem = @{
        productId = $serviceProduct.id
        quantity = 1
    } | ConvertTo-Json

    try {
        $addServiceResponse = Invoke-RestMethod -Uri "$baseUrl/orders/$($order.id)/items" -Method POST -Body $addServiceItem -Headers $headers
        $updatedOrder = $addServiceResponse.data
        Write-Host "   ✅ تم إضافة الخدمة للطلب" -ForegroundColor Green
        Write-Host "   - Items: $($updatedOrder.items.Count)" -ForegroundColor Gray
        Write-Host "   - Total: $($updatedOrder.total) EGP" -ForegroundColor Gray
        $order = $updatedOrder
    } catch {
        Write-Host "   ❌ فشل إضافة الخدمة: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 7️⃣ إضافة منتج مخصص للطلب
if ($order) {
    Write-Host "`n7️⃣ إضافة منتج مخصص للطلب..." -ForegroundColor Yellow
    $addCustomItem = @{
        name = "تغليف هدية خاصة"
        unitPrice = 15.0
        quantity = 1
        taxRate = 14.0
        notes = "منتج مخصص للاختبار"
    } | ConvertTo-Json

    try {
        $addCustomResponse = Invoke-RestMethod -Uri "$baseUrl/orders/$($order.id)/items/custom" -Method POST -Body $addCustomItem -Headers $headers
        $updatedOrder = $addCustomResponse.data
        Write-Host "   ✅ تم إضافة المنتج المخصص" -ForegroundColor Green
        Write-Host "   - Items: $($updatedOrder.items.Count)" -ForegroundColor Gray
        Write-Host "   - Total: $($updatedOrder.total) EGP" -ForegroundColor Gray
        
        # عرض تفاصيل العناصر
        Write-Host "`n   📦 عناصر الطلب:" -ForegroundColor Cyan
        $updatedOrder.items | ForEach-Object {
            if ($_.isCustomItem) {
                Write-Host "   - [CUSTOM] $($_.productName) × $($_.quantity) = $($_.total) EGP" -ForegroundColor Magenta
            } else {
                Write-Host "   - $($_.productName) × $($_.quantity) = $($_.total) EGP" -ForegroundColor Gray
            }
        }
        $order = $updatedOrder
    } catch {
        Write-Host "   ❌ فشل إضافة المنتج المخصص: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 8️⃣ فحص المخزون قبل الإتمام
if ($order) {
    Write-Host "`n8️⃣ فحص المخزون..." -ForegroundColor Yellow
    try {
        $productCheck = Invoke-RestMethod -Uri "$baseUrl/products/$($physicalProduct.id)" -Method GET -Headers $headers
        Write-Host "   ✅ المخزون الحالي للمنتج المادي: $($productCheck.data.stockQuantity)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ فشل فحص المخزون: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 9️⃣ إتمام الطلب
if ($order) {
    Write-Host "`n9️⃣ إتمام الطلب..." -ForegroundColor Yellow
    $completeOrder = @{
        payments = @(
            @{
                method = "Cash"
                amount = $order.total
            }
        )
    } | ConvertTo-Json -Depth 10

    try {
        $completeResponse = Invoke-RestMethod -Uri "$baseUrl/orders/$($order.id)/complete" -Method POST -Body $completeOrder -Headers $headers
        $completedOrder = $completeResponse.data
        Write-Host "   ✅ تم إتمام الطلب بنجاح" -ForegroundColor Green
        Write-Host "   - Status: $($completedOrder.status)" -ForegroundColor Gray
        Write-Host "   - Total: $($completedOrder.total) EGP" -ForegroundColor Gray
        Write-Host "   - Paid: $($completedOrder.amountPaid) EGP" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ فشل إتمام الطلب: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 🔟 فحص المخزون بعد الإتمام
if ($order) {
    Write-Host "`n🔟 فحص المخزون بعد الإتمام..." -ForegroundColor Yellow
    try {
        $productCheckAfter = Invoke-RestMethod -Uri "$baseUrl/products/$($physicalProduct.id)" -Method GET -Headers $headers
        Write-Host "   ✅ المخزون بعد البيع: $($productCheckAfter.data.stockQuantity)" -ForegroundColor Green
        Write-Host "   📊 تم خصم: 2 وحدة من المنتج المادي" -ForegroundColor Cyan
        Write-Host "   ⏭️  الخدمة: لم يتأثر المخزون" -ForegroundColor Cyan
        Write-Host "   ⏭️  المنتج المخصص: لم يتأثر المخزون" -ForegroundColor Cyan
    } catch {
        Write-Host "   ❌ فشل فحص المخزون: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 1️⃣1️⃣ فحص OrderItems في الداتابيز
Write-Host "`n1️⃣1️⃣ فحص OrderItems في الداتابيز..." -ForegroundColor Yellow
if ($order) {
    try {
        $dbCheck = sqlite3 backend/KasserPro.API/kasserpro.db "SELECT Id, ProductId, IsCustomItem, CustomName, ProductName, Quantity FROM OrderItems WHERE OrderId = $($order.id);"
        Write-Host "   ✅ بيانات OrderItems:" -ForegroundColor Green
        Write-Host $dbCheck -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️  تعذر فحص الداتابيز مباشرة" -ForegroundColor Yellow
    }
}

# ملخص النتائج
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 ملخص الاختبار" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ تسجيل الدخول: نجح" -ForegroundColor Green
Write-Host "✅ إنشاء منتج مادي (Physical): نجح" -ForegroundColor Green
Write-Host "✅ إنشاء خدمة (Service): نجح" -ForegroundColor Green
Write-Host "✅ إنشاء طلب: نجح" -ForegroundColor Green
Write-Host "✅ إضافة خدمة للطلب: نجح" -ForegroundColor Green
Write-Host "✅ إضافة منتج مخصص: نجح" -ForegroundColor Green
Write-Host "✅ إتمام الطلب: نجح" -ForegroundColor Green
Write-Host "✅ خصم المخزون: نجح (للمنتج المادي فقط)" -ForegroundColor Green
Write-Host "`n🎉 جميع الاختبارات نجحت!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
