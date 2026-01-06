# KasserPro - نظام نقاط البيع (POS)

## 📋 ملخص المشروع

نظام نقاط بيع احترافي مبني بـ .NET 9 + Clean Architecture

---

## 🏗️ هيكل المشروع

```
KasserPro/
├── src/
│   ├── KasserPro.Domain/           # Entities, Enums
│   ├── KasserPro.Application/      # DTOs, Services, Interfaces
│   ├── KasserPro.Infrastructure/   # DbContext, Repositories
│   └── KasserPro.API/              # Controllers, Middleware
├── KasserPro.sln
└── README.md
```

---

## 🚀 التشغيل

```powershell
cd src/KasserPro.API
dotnet run --urls "http://localhost:5000"
```

**Swagger:** http://localhost:5000/swagger

---

## 🔐 بيانات الدخول

| المستخدم | البريد | كلمة المرور | الصلاحية |
|----------|--------|-------------|----------|
| مدير النظام | admin@kasserpro.com | Admin@123 | Admin |
| أحمد الكاشير | ahmed@kasserpro.com | 123456 | Cashier |

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

### 🔑 Authentication
| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| POST | `/auth/login` | تسجيل الدخول | ❌ |
| POST | `/auth/register` | تسجيل مستخدم جديد | Admin |
| GET | `/auth/me` | بيانات المستخدم الحالي | ✅ |

### 📁 Categories
| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/categories` | قائمة التصنيفات | ✅ |
| GET | `/categories/{id}` | تصنيف واحد | ✅ |
| POST | `/categories` | إضافة تصنيف | Admin |
| PUT | `/categories/{id}` | تعديل تصنيف | Admin |
| DELETE | `/categories/{id}` | حذف تصنيف | Admin |

### 📦 Products
| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/products` | قائمة المنتجات | ✅ |
| GET | `/products/{id}` | منتج واحد | ✅ |
| GET | `/products/category/{id}` | منتجات تصنيف | ✅ |
| POST | `/products` | إضافة منتج | Admin |
| PUT | `/products/{id}` | تعديل منتج | Admin |
| DELETE | `/products/{id}` | حذف منتج | Admin |

### 🛒 Orders
| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/orders` | طلبات اليوم | ✅ |
| GET | `/orders/{id}` | تفاصيل طلب | ✅ |
| POST | `/orders` | إنشاء طلب | ✅ |
| POST | `/orders/{id}/items` | إضافة منتج للطلب | ✅ |
| DELETE | `/orders/{id}/items/{itemId}` | حذف منتج من الطلب | ✅ |
| POST | `/orders/{id}/complete` | إكمال الطلب | ✅ |
| POST | `/orders/{id}/cancel` | إلغاء الطلب | ✅ |

### ⏰ Shifts
| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/shifts/current` | الوردية الحالية | ✅ |
| POST | `/shifts/open` | فتح وردية | ✅ |
| POST | `/shifts/close` | إغلاق وردية | ✅ |
| GET | `/shifts/history` | سجل الورديات | ✅ |

### 💳 Payments
| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/payments/order/{id}` | مدفوعات طلب | ✅ |

### 📊 Reports
| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/reports/daily?date=2024-01-01` | تقرير يومي | Admin |
| GET | `/reports/sales?fromDate=...&toDate=...` | تقرير مبيعات | Admin |

---

## 📝 أمثلة الاستخدام

### تسجيل الدخول
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@kasserpro.com',
    password: 'Admin@123'
  })
});
const data = await response.json();
const token = data.data.accessToken;
```

### جلب المنتجات
```javascript
const response = await fetch('http://localhost:5000/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const products = await response.json();
```

### إنشاء طلب
```javascript
const response = await fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    customerName: 'أحمد',
    items: [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 }
    ]
  })
});
```

### إكمال الطلب
```javascript
await fetch(`http://localhost:5000/api/orders/${orderId}/complete`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amountPaid: 100,
    paymentMethod: 'Cash'
  })
});
```

---

## 📦 البيانات التجريبية

### التصنيفات (6)
| التصنيف | المنتجات |
|---------|----------|
| ☕ مشروبات ساخنة | 6 |
| 🥤 مشروبات باردة | 6 |
| 🍽️ وجبات رئيسية | 6 |
| 🥪 سندويشات | 4 |
| 🍰 حلويات | 4 |
| 🥗 مقبلات | 4 |

### المنتجات (30 منتج)
- قهوة عربية، كابتشينو، لاتيه، شاي...
- عصير برتقال، موهيتو، سموذي...
- برجر لحم، ستيك، دجاج مشوي...
- شاورما، فلافل، كلوب ساندويش...
- كيكة شوكولاتة، تشيز كيك، كنافة...
- حمص، سلطة، بطاطس مقلية...

### الطلبات (10)
- 8 طلبات مكتملة
- 1 طلب مسودة (Draft)
- 1 طلب ملغي

---

## 🛠️ التقنيات المستخدمة

- **.NET 9** - Framework
- **Entity Framework Core 9** - ORM
- **SQLite** - Database
- **JWT** - Authentication
- **Swashbuckle** - Swagger/OpenAPI
- **BCrypt** - Password Hashing
- **Clean Architecture** - Design Pattern

---

## 📁 الملفات الرئيسية

### Domain Layer
```
src/KasserPro.Domain/
├── Common/BaseEntity.cs
├── Entities/
│   ├── User.cs
│   ├── Category.cs
│   ├── Product.cs
│   ├── Order.cs
│   ├── OrderItem.cs
│   ├── Payment.cs
│   └── Shift.cs
└── Enums/
    ├── OrderStatus.cs
    ├── PaymentMethod.cs
    └── UserRole.cs
```

### Application Layer
```
src/KasserPro.Application/
├── Common/Interfaces/
│   ├── IRepository.cs
│   └── IUnitOfWork.cs
├── DTOs/
│   ├── Auth/
│   ├── Categories/
│   ├── Products/
│   ├── Orders/
│   ├── Shifts/
│   ├── Reports/
│   └── Common/ApiResponse.cs
└── Services/
    ├── Interfaces/
    │   ├── IAuthService.cs
    │   ├── ICategoryService.cs
    │   ├── IProductService.cs
    │   ├── IOrderService.cs
    │   ├── IShiftService.cs
    │   └── IReportService.cs
    └── Implementations/
        ├── AuthService.cs
        ├── CategoryService.cs
        ├── ProductService.cs
        ├── OrderService.cs
        ├── ShiftService.cs
        └── ReportService.cs
```

### Infrastructure Layer
```
src/KasserPro.Infrastructure/
├── Data/
│   ├── AppDbContext.cs
│   ├── DbInitializer.cs
│   └── Configurations/
│       ├── UserConfiguration.cs
│       ├── ProductConfiguration.cs
│       └── OrderConfiguration.cs
├── Repositories/
│   ├── GenericRepository.cs
│   └── UnitOfWork.cs
└── Migrations/
```

### API Layer
```
src/KasserPro.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── CategoriesController.cs
│   ├── ProductsController.cs
│   ├── OrdersController.cs
│   ├── ShiftsController.cs
│   ├── PaymentsController.cs
│   └── ReportsController.cs
├── Middleware/
│   └── ExceptionMiddleware.cs
├── Program.cs
└── appsettings.json
```

---

## ⚙️ الأوامر

```powershell
# بناء المشروع
dotnet build

# تشغيل المشروع
cd src/KasserPro.API
dotnet run --urls "http://localhost:5000"

# إنشاء Migration جديد
dotnet ef migrations add MigrationName -p ../KasserPro.Infrastructure -s .

# تطبيق Migrations
dotnet ef database update -p ../KasserPro.Infrastructure -s .
```

---

## 📄 Response Format

جميع الـ APIs ترجع بهذا الشكل:

```json
{
  "success": true,
  "message": "تم بنجاح",
  "data": { ... },
  "errors": null
}
```

---

## 🔒 JWT Token

أضف الـ Token في Header لكل Request:
```
Authorization: Bearer <token>
```

---

تم إنشاء هذا المشروع بواسطة Kiro AI 🤖
