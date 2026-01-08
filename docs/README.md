# 📖 KasserPro Documentation

## 🏛️ المرجع الأساسي

> **⚠️ مهم:** قبل أي عمل في المشروع، اقرأ [Architecture Manifest](KASSERPRO_ARCHITECTURE_MANIFEST.md)

## Structure

```
docs/
├── KASSERPRO_ARCHITECTURE_MANIFEST.md  # 🏛️ المرجع الأساسي - القواعد والمعايير
├── SYSTEM_HEALTH_REPORT.md             # 🏥 تقرير صحة النظام
│
├── api/                                 # API Documentation
│   └── API_DOCUMENTATION.md
│
├── guides/                              # Development Guides
│   ├── BACKEND_PHASE1.md
│   ├── FRONTEND_PHASE1.md
│   └── LESSONS_LEARNED.md
│
├── design/                              # Design Documentation
│   └── DESIGN_SYSTEM.md
│
└── screenshots/                         # Application Screenshots
```

## Quick Links

### 🏛️ Architecture & Standards

| Document | Description |
|----------|-------------|
| [Architecture Manifest](KASSERPRO_ARCHITECTURE_MANIFEST.md) | **المرجع الأساسي** - كل القواعد والمعايير |
| [System Health Report](SYSTEM_HEALTH_REPORT.md) | تقرير المراجعة والإصلاحات |

### 📡 API

| Document | Description |
|----------|-------------|
| [API Documentation](api/API_DOCUMENTATION.md) | Complete REST API reference |

### 📚 Development Guides

| Document | Description |
|----------|-------------|
| [Backend Phase 1](guides/BACKEND_PHASE1.md) | حالة وهيكل الباك-إند |
| [Frontend Phase 1](guides/FRONTEND_PHASE1.md) | حالة وهيكل الفرونت-إند |
| [Lessons Learned](guides/LESSONS_LEARNED.md) | الدروس المستفادة |

### 🎨 Design

| Document | Description |
|----------|-------------|
| [Design System](design/DESIGN_SYSTEM.md) | UI/UX guidelines and components |

## System Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Production-Ready | .NET 9, Clean Architecture |
| Frontend | ✅ Production-Ready | React 18, TypeScript |
| E2E Tests | ✅ Passing | Playwright, 6 scenarios |
| Integration Tests | ✅ Passing | xUnit |

## Key Configurations

### Ports

| Service | Port |
|---------|------|
| Backend API | 5243 |
| Frontend Dev | 3000 |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kasserpro.com | Admin@123 |
| Cashier | ahmed@kasserpro.com | 123456 |

### Tax Configuration

| Setting | Value |
|---------|-------|
| Default Rate | 14% |
| Model | Tax Exclusive (Additive) |
| Timezone | Africa/Cairo |

## Development Checklist

قبل كتابة أي كود جديد:

- [ ] قرأت [Architecture Manifest](KASSERPRO_ARCHITECTURE_MANIFEST.md)
- [ ] حددت الـ Entities المطلوبة
- [ ] حددت إذا كانت عملية مالية (تحتاج Transaction)
- [ ] أنشأت DTOs المطلوبة
- [ ] كتبت Tests
- [ ] حدّثت Frontend Types
- [ ] أضفت E2E test إذا لزم

## Running Tests

### E2E Tests

```bash
cd client
npm run test:e2e          # Headless
npm run test:e2e:headed   # With browser
npm run test:e2e:ui       # Playwright UI
```

### Integration Tests

```bash
cd src/KasserPro.Tests
dotnet test
```

---

> **Golden Rule:** ❌ لا تنشر إذا فشل أي E2E test
