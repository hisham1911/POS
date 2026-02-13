# خطة تنفيذ تحسينات الورديات
## Shift Management Enhancements - Implementation Plan

**التاريخ**: 9 فبراير 2026  
**المدة المتوقعة**: 2-3 أيام عمل

---

## 📋 الميزات المطلوبة

### 1. ✅ تنبيه عدم النشاط (Inactivity Alert)
- تنبيه بعد 12 ساعة من آخر نشاط
- خيارات: إغلاق، استمرار، تسليم
- إعادة التنبيه بعد ساعة إذا اختار الاستمرار

### 2. ✅ ورديات متعددة (Multiple Shifts)
- عدة كاشيرات في نفس الفرع
- كل وردية مستقلة
- Admin يرى كل الورديات

### 3. ✅ تقرير الوردية المحسّن (Enhanced Report)
- عدد ساعات العمل
- تفاصيل المبيعات
- الرصيد المتوقع vs الفعلي
- طباعة وتصدير PDF

### 4. ✅ إغلاق بالقوة (Force Close)
- Admin فقط
- سبب إلزامي
- Audit Log
- إشعار للمستخدم

### 5. ✅ التعامل مع التعطل (Crash Recovery)
- حفظ في LocalStorage كل دقيقة
- استعادة تلقائية
- تنبيه للمستخدم

### 6. ✅ تسليم الوردية (Handover)
- تسليم لمستخدم آخر
- تسجيل التفاصيل
- Audit Log

---

## 🏗️ المرحلة 1: Backend - Domain Layer

### 1.1 تحديث Shift Entity

**الحقول الجديدة**:
```csharp
// Inactivity tracking
public DateTime LastActivityAt { get; set; }

// Force close
public bool IsForceClosed { get; set; } = false;
public int? ForceClosedByUserId { get; set; }
public string? ForceClosedByUserName { get; set; }
public DateTime? ForceClosedAt { get; set; }
public string? ForceCloseReason { get; set; }

// Handover tracking
public bool IsHandedOver { get; set; } = false;
public int? HandedOverFromUserId { get; set; }
public string? HandedOverFromUserName { get; set; }
public int? HandedOverToUserId { get; set; }
public string? HandedOverToUserName { get; set; }
public DateTime? HandedOverAt { get; set; }
public decimal HandoverBalance { get; set; }
public string? HandoverNotes { get; set; }

// Navigation properties
public User? ForceClosedByUser { get; set; }
public User? HandedOverFromUser { get; set; }
public User? HandedOverToUser { get; set; }
```

### 1.2 إنشاء Migration
```bash
dotnet ef migrations add EnhanceShiftManagement --project src/KasserPro.Infrastructure
```

---

## 🏗️ المرحلة 2: Backend - Application Layer

### 2.1 تحديث DTOs

**ShiftDto.cs** - إضافة حقول جديدة:
```csharp
public DateTime LastActivityAt { get; set; }
public bool IsForceClosed { get; set; }
public string? ForceClosedByUserName { get; set; }
public DateTime? ForceClosedAt { get; set; }
public string? ForceCloseReason { get; set; }
public bool IsHandedOver { get; set; }
public string? HandedOverFromUserName { get; set; }
public string? HandedOverToUserName { get; set; }
public DateTime? HandedOverAt { get; set; }
public decimal HandoverBalance { get; set; }
public string? HandoverNotes { get; set; }
public int DurationHours { get; set; } // calculated
```

**Request DTOs جديدة**:
- `ForceCloseShiftRequest.cs`
- `HandoverShiftRequest.cs`
- `UpdateActivityRequest.cs`

### 2.2 تحديث Error Codes

```csharp
// Shift Management
public const string SHIFT_ALREADY_FORCE_CLOSED = "SHIFT_ALREADY_FORCE_CLOSED";
public const string SHIFT_FORCE_CLOSE_REASON_REQUIRED = "SHIFT_FORCE_CLOSE_REASON_REQUIRED";
public const string SHIFT_CANNOT_HANDOVER_CLOSED = "SHIFT_CANNOT_HANDOVER_CLOSED";
public const string SHIFT_HANDOVER_USER_REQUIRED = "SHIFT_HANDOVER_USER_REQUIRED";
public const string SHIFT_HANDOVER_TO_SAME_USER = "SHIFT_HANDOVER_TO_SAME_USER";
public const string SHIFT_ALREADY_HANDED_OVER = "SHIFT_ALREADY_HANDED_OVER";
public const string SHIFT_INACTIVE_TOO_LONG = "SHIFT_INACTIVE_TOO_LONG";
```

### 2.3 تحديث ShiftService

**Methods جديدة**:
```csharp
Task<Result<ShiftDto>> ForceCloseAsync(int shiftId, ForceCloseShiftRequest request);
Task<Result<ShiftDto>> HandoverAsync(int shiftId, HandoverShiftRequest request);
Task<Result> UpdateActivityAsync(int shiftId);
Task<Result<List<ShiftDto>>> GetActiveShiftsInBranchAsync(int branchId);
Task<Result<ShiftReportDto>> GetEnhancedReportAsync(int shiftId);
```

**Business Logic**:
- Force Close: Admin only, reason required, audit log
- Handover: update UserId, record handover details, audit log
- Update Activity: update LastActivityAt timestamp
- Get Active Shifts: للـ Admin لرؤية كل الورديات المفتوحة

---

## 🏗️ المرحلة 3: Backend - API Layer

### 3.1 تحديث ShiftsController

**Endpoints جديدة**:
```csharp
[HttpPost("{id}/force-close")]
[Authorize(Roles = "Admin")]
Task<IActionResult> ForceClose(int id, ForceCloseShiftRequest request);

[HttpPost("{id}/handover")]
[Authorize]
Task<IActionResult> Handover(int id, HandoverShiftRequest request);

[HttpPost("{id}/update-activity")]
[Authorize]
Task<IActionResult> UpdateActivity(int id);

[HttpGet("active")]
[Authorize]
Task<IActionResult> GetActiveShifts();

[HttpGet("{id}/enhanced-report")]
[Authorize]
Task<IActionResult> GetEnhancedReport(int id);
```

---

## 🎨 المرحلة 4: Frontend - Types & API

### 4.1 تحديث Types

**shift.types.ts**:
```typescript
interface Shift {
  // ... existing fields
  lastActivityAt: string;
  isForceClosed: boolean;
  forceClosedByUserName?: string;
  forceClosedAt?: string;
  forceCloseReason?: string;
  isHandedOver: boolean;
  handedOverFromUserName?: string;
  handedOverToUserName?: string;
  handedOverAt?: string;
  handoverBalance: number;
  handoverNotes?: string;
  durationHours: number;
}

interface ForceCloseShiftRequest {
  reason: string;
}

interface HandoverShiftRequest {
  toUserId: number;
  notes?: string;
}

interface ShiftReport {
  shift: Shift;
  totalOrders: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalExpenses: number;
  durationHours: number;
  cashierName: string;
  // ... more details
}
```

### 4.2 تحديث shiftsApi.ts

**Endpoints جديدة**:
```typescript
forceCloseShift: builder.mutation<Shift, { id: number; request: ForceCloseShiftRequest }>
handoverShift: builder.mutation<Shift, { id: number; request: HandoverShiftRequest }>
updateActivity: builder.mutation<void, number>
getActiveShifts: builder.query<Shift[], void>
getEnhancedReport: builder.query<ShiftReport, number>
```

---

## 🎨 المرحلة 5: Frontend - Components & Features

### 5.1 Inactivity Alert System

**InactivityMonitor.tsx** (Hook):
```typescript
- Check LastActivityAt every minute
- Show alert after 12 hours
- Options: Close, Continue, Handover
- If Continue: snooze for 1 hour
```

### 5.2 Force Close Modal

**ForceCloseShiftModal.tsx**:
```typescript
- Admin only
- Reason input (required)
- Confirmation
- Show shift details
```

### 5.3 Handover Modal

**HandoverShiftModal.tsx**:
```typescript
- Select user dropdown
- Notes textarea
- Show current balance
- Confirmation
```

### 5.4 Active Shifts List

**ActiveShiftsList.tsx**:
```typescript
- Show all active shifts in branch
- Admin sees all, Cashier sees own
- Actions: View, Force Close (Admin)
```

### 5.5 Enhanced Shift Report

**ShiftReportPage.tsx**:
```typescript
- Detailed report with all info
- Print button
- Export PDF button
- Show handover history if applicable
```

### 5.6 LocalStorage Persistence

**shiftPersistence.ts**:
```typescript
- Save shift state every minute
- Restore on app load
- Show recovery modal if found
- Options: Continue, Close
```

---

## 🧪 المرحلة 6: Testing

### 6.1 Backend Tests

**ShiftServiceTests.cs**:
- Test ForceClose (Admin only)
- Test Handover (valid user)
- Test Handover (same user - should fail)
- Test UpdateActivity
- Test GetActiveShifts

### 6.2 Frontend Tests

**shift-enhancements.spec.ts**:
- Test inactivity alert after 12 hours
- Test force close (Admin)
- Test handover
- Test crash recovery
- Test multiple shifts in same branch

---

## 📝 المرحلة 7: Documentation

### 7.1 API Documentation
تحديث `docs/api/API_DOCUMENTATION.md` بالـ endpoints الجديدة

### 7.2 User Guide
إنشاء `SHIFT_ENHANCEMENTS_GUIDE.md` مع:
- كيفية استخدام كل ميزة
- أمثلة عملية
- Screenshots

---

## ✅ Checklist التنفيذ

### Backend
- [ ] تحديث Shift Entity
- [ ] إنشاء Migration
- [ ] تحديث DTOs
- [ ] إضافة Error Codes
- [ ] تحديث ShiftService
- [ ] تحديث ShiftsController
- [ ] Unit Tests
- [ ] Integration Tests

### Frontend
- [ ] تحديث Types
- [ ] تحديث API
- [ ] InactivityMonitor Hook
- [ ] ForceCloseShiftModal
- [ ] HandoverShiftModal
- [ ] ActiveShiftsList
- [ ] Enhanced Report Page
- [ ] LocalStorage Persistence
- [ ] E2E Tests

### Documentation
- [ ] API Documentation
- [ ] User Guide
- [ ] Code Comments

---

## 🎯 الأولويات

### High Priority (يوم 1)
1. تحديث Entity + Migration
2. Force Close functionality
3. Handover functionality
4. Update Activity tracking

### Medium Priority (يوم 2)
5. Inactivity Alert
6. Multiple Shifts support
7. Enhanced Report
8. Frontend UI

### Low Priority (يوم 3)
9. LocalStorage Persistence
10. Testing
11. Documentation

---

## 📊 التقدير الزمني

| المرحلة | الوقت المتوقع |
|---------|---------------|
| Backend - Domain | 2 ساعات |
| Backend - Application | 4 ساعات |
| Backend - API | 2 ساعات |
| Frontend - Types & API | 2 ساعات |
| Frontend - Components | 6 ساعات |
| Testing | 3 ساعات |
| Documentation | 1 ساعة |
| **الإجمالي** | **20 ساعة (2.5 يوم)** |

---

**الحالة**: 🚀 جاهز للبدء
**التاريخ**: 9 فبراير 2026
