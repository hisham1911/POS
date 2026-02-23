# KasserPro - دليل بناء الإصدارات

## نظرة عامة
هذا الدليل يشرح كيفية بناء جميع إصدارات KasserPro POS System بطريقة احترافية ومنظمة.

---

## 📁 هيكل مجلد Deployment

```
Deployment/
├── Installers/          → الملفات التنفيذية النهائية (.exe)
├── ISS/                 → ملفات تكوين Inno Setup (.iss)
├── Icons/               → الأيقونات (kasserpro.ico)
├── Scripts/             → السكريبتات (BUILD_ALL.ps1)
└── Docs/                → ملفات الشرح
```

---

## 🏗️ الإصدارات المتاحة

| الإصدار | نظام التشغيل | المعمارية | .NET Version | الحجم التقريبي |
|---------|--------------|-----------|--------------|----------------|
| KasserPro-Setup.exe | Windows 10/11 | x64 | .NET 8 | ~124 MB |
| KasserPro-Setup-x86.exe | Windows 10/11 | x86 | .NET 8 | ~74 MB |
| KasserPro-Setup-Win7-x64.exe | Windows 7 SP1+ | x64 | .NET 6 | ~79 MB |
| KasserPro-Setup-Win7-x86.exe | Windows 7 SP1+ | x86 | .NET 6 | ~71 MB |

---

## ⚡ البناء السريع

### استخدام السكريبت الجاهز (موصّى به)

```powershell
cd "d:\مسح\POS\Deployment\Scripts"
.\BUILD_ALL.ps1
```

### خيارات متقدمة:

```powershell
# تخطّي Frontend (إذا لم يتم تعديله)
.\BUILD_ALL.ps1 -SkipFrontend

# تخطّي Backend (إذا لم يتم تعديله)
.\BUILD_ALL.ps1 -SkipBackend

# بناء Installers فقط (بعد Build سابق)
.\BUILD_ALL.ps1 -SkipFrontend -SkipBackend

# بناء Frontend و Backend فقط (بدون Installers)
.\BUILD_ALL.ps1 -SkipInstallers
```

---

## 🔧 البناء اليدوي (خطوة بخطوة)

### المتطلبات الأساسية

1. ✅ .NET 8 SDK (8.0.417+)
2. ✅ .NET 6 SDK (6.0.428+) - للإصدارات Win7
3. ✅ Node.js + npm
4. ✅ Inno Setup 6 (6.7.1+)

### الخطوة 1: بناء Frontend

```powershell
cd "d:\مسح\POS\frontend"
npm run build
```

**النتيجة:** `d:\مسح\POS\backend\KasserPro.API\wwwroot\`

---

### الخطوة 2: بناء Backend (.NET 8 - Win10/11)

#### x64 Version:
```powershell
dotnet publish "d:\مسح\POS\backend\KasserPro.API\KasserPro.API.csproj" `
  -c Release -r win-x64 --self-contained `
  -o C:\temp\kasserpro-src `
  -p:PublishSingleFile=false

dotnet publish "d:\مسح\POS\backend\KasserPro.BridgeApp\KasserPro.BridgeApp.csproj" `
  -c Release -r win-x64 --self-contained `
  -o C:\temp\kasserpro-src `
  -p:PublishSingleFile=true

Copy-Item "d:\مسح\POS\Deployment\Icons\kasserpro.ico" "C:\temp\kasserpro-src\"
```

#### x86 Version:
```powershell
dotnet publish "d:\مسح\POS\backend\KasserPro.API\KasserPro.API.csproj" `
  -c Release -r win-x86 --self-contained `
  -o C:\temp\kasserpro-src-x86 `
  -p:PublishSingleFile=false

dotnet publish "d:\مسح\POS\backend\KasserPro.BridgeApp\KasserPro.BridgeApp.csproj" `
  -c Release -r win-x86 --self-contained `
  -o C:\temp\kasserpro-src-x86 `
  -p:PublishSingleFile=true

Copy-Item "d:\مسح\POS\Deployment\Icons\kasserpro.ico" "C:\temp\kasserpro-src-x86\"
```

---

### الخطوة 3: بناء Backend (.NET 6 - Win7)

#### x64 Version:
```powershell
dotnet publish "C:\temp\net6src\backend\KasserPro.API\KasserPro.API.csproj" `
  -c Release -r win-x64 --self-contained `
  -o C:\temp\kasserpro-src-win7-x64 `
  -p:PublishSingleFile=false

dotnet publish "C:\temp\net6src\backend\KasserPro.BridgeApp\KasserPro.BridgeApp.csproj" `
  -c Release -r win-x64 --self-contained `
  -o C:\temp\kasserpro-src-win7-x64 `
  -p:PublishSingleFile=true

Copy-Item "d:\مسح\POS\Deployment\Icons\kasserpro.ico" "C:\temp\kasserpro-src-win7-x64\"
```

#### x86 Version:
```powershell
dotnet publish "C:\temp\net6src\backend\KasserPro.API\KasserPro.API.csproj" `
  -c Release -r win-x86 --self-contained `
  -o C:\temp\kasserpro-src-win7-x86 `
  -p:PublishSingleFile=false

dotnet publish "C:\temp\net6src\backend\KasserPro.BridgeApp\KasserPro.BridgeApp.csproj" `
  -c Release -r win-x86 --self-contained `
  -o C:\temp\kasserpro-src-win7-x86 `
  -p:PublishSingleFile=true

Copy-Item "d:\مسح\POS\Deployment\Icons\kasserpro.ico" "C:\temp\kasserpro-src-win7-x86\"
```

---

### الخطوة 4: بناء Installers

```powershell
$ISCC = "C:\Users\mo\AppData\Local\Programs\Inno Setup 6\ISCC.exe"

# Win10/11 x64
& $ISCC "d:\مسح\POS\Deployment\ISS\KasserPro-Setup.iss"

# Win10/11 x86
& $ISCC "d:\مسح\POS\Deployment\ISS\KasserPro-Setup-x86.iss"

# Win7 x64
& $ISCC "d:\مسح\POS\Deployment\ISS\KasserPro-Setup-Win7-x64.iss"

# Win7 x86
& $ISCC "d:\مسح\POS\Deployment\ISS\KasserPro-Setup-Win7-x86.iss"
```

**النتيجة:** `d:\مسح\POS\Deployment\Installers\`

---

## 🎨 الميزات المطبّقة

### 1️⃣ Custom Icon (kasserpro.ico)
- **الحجم:** 19 KB
- **الدقة:** 4 أحجام (16x16, 32x32, 48x48, 256x256)
- **التصميم:** أزرق متدرج مع حرف "K" أبيض
- **التطبيق:** مدمج في اختصارات سطح المكتب مباشرةً
- **Icon Cache:** يتم تحديثه تلقائياً عند التثبيت عبر `ie4uinit.exe`

### 2️⃣ Update vs Fresh Install
عند إعادة التثبيت، يظهر للمستخدم خياران:

| الخيار | الوصف | حالة البيانات |
|--------|-------|---------------|
| **Update** | تحديث النظام | ✅ يحتفظ بجميع البيانات (قاعدة البيانات، التكوينات) |
| **Fresh Install** | تثبيت جديد | ⚠️ يحذف جميع البيانات (مع تأكيد مزدوج) |

**Fresh Install يحذف:**
- `kasserpro.db` (قاعدة البيانات)
- `license.key` (ملف الترخيص)
- `appsettings.json` (الإعدادات)
- جميع ملفات التكوين الأخرى

---

## 🪟 متطلبات Windows 7

### KB Patches المطلوبة (Win7 فقط):

1. **KB4490628** (Servicing Stack Update)
   - يجب تثبيته **أولاً**
   - x64: ~9.1 MB | x86: ~4 MB

2. **KB4474419** (SHA-2 Code Signing Support)
   - يجب تثبيته **ثانياً**
   - x64: ~53 MB | x86: ~34 MB

3. **KB2999226** (Universal CRT) - اختياري لكن موصّى به

**ملاحظة:** التثبيت على Win7 بدون هذه الباتشات سيفشل مع رسالة خطأ.

---

## 📦 ملفات ISS Configuration

جميع ملفات ISS تحتوي على:

```pascal
#define DeploymentRoot "d:\مسح\POS\Deployment"
OutputDir={#DeploymentRoot}\Installers  // النتيجة تذهب مباشرة للـ Deployment
```

### الفروقات الرئيسية:

| الملف | SourceDir | MinVersion | ArchitecturesAllowed |
|------|-----------|------------|---------------------|
| KasserPro-Setup.iss | C:\temp\kasserpro-src | 10.0 | (x64 default) |
| KasserPro-Setup-x86.iss | C:\temp\kasserpro-src-x86 | 10.0 | x86 x64 |
| KasserPro-Setup-Win7-x64.iss | C:\temp\kasserpro-src-win7-x64 | 6.1.7601 | (x64 default) |
| KasserPro-Setup-Win7-x86.iss | C:\temp\kasserpro-src-win7-x86 | 6.1.7601 | x86 x64 |

**MinVersion:**
- `10.0` = Windows 10/11 فقط
- `6.1.7601` = Windows 7 SP1 وما فوق

---

## 🚀 إطلاق إصدار جديد

### السيناريو 1: تحديث صغير (Bug Fix)
```powershell
# بناء سريع (بدون إعادة بناء Node modules)
cd "d:\مسح\POS\Deployment\Scripts"
.\BUILD_ALL.ps1
```

### السيناريو 2: تحديث Frontend فقط
```powershell
.\BUILD_ALL.ps1 -SkipBackend
```

### السيناريو 3: تحديث Backend فقط
```powershell
.\BUILD_ALL.ps1 -SkipFrontend
```

### السيناريو 4: بناء كامل من الصفر
```powershell
# حذف جميع الملفات المؤقتة
Remove-Item C:\temp\kasserpro-src* -Recurse -Force

# بناء كامل
.\BUILD_ALL.ps1
```

---

## 🔍 استكشاف الأخطاء

### ❌ خطأ: "Cannot find ISCC.exe"
**الحل:** تحديث مسار ISCC في السكريبت:
```powershell
$ISCC = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
```

### ❌ خطأ: "Frontend build failed"
**الحل:**
```powershell
cd "d:\مسح\POS\frontend"
Remove-Item node_modules -Recurse -Force
npm install
npm run build
```

### ❌ خطأ: "dotnet publish failed"
**الحل:** التحقق من إصدار .NET SDK:
```powershell
dotnet --list-sdks
# يجب أن تظهر: 8.0.417 و 6.0.428
```

### ❌ الأيقونة لا تظهر في سطح المكتب
**الحل:** تم حلها! الأيقونة الآن مدمجة في الـ `.lnk` shortcut مباشرة عبر:
```iss
[Icons]
IconFilename: "{app}\kasserpro.ico"; IconIndex: 0
```

---

## 📊 مقاسات الملفات المتوقعة

| الملف | الحجم | آخر تحديث |
|------|-------|-----------|
| KasserPro-Setup.exe | ~124 MB | 2026-02-21 |
| KasserPro-Setup-x86.exe | ~74 MB | 2026-02-21 |
| KasserPro-Setup-Win7-x64.exe | ~79 MB | 2026-02-21 |
| KasserPro-Setup-Win7-x86.exe | ~71 MB | 2026-02-21 |

---

## 🛡️ الأمان

### Installer Password
جميع الـ installers محمية بكلمة مرور:
```
KasserPro@Installer2026
```

### MAC Address Binding
- يتم إنشاء `license.key` تلقائياً عند أول تثبيت
- مرتبط بعنوان MAC للجهاز
- يمنع نقل التطبيق لجهاز آخر

---

## 📝 ملاحظات نهائية

1. ✅ **الوقت المتوقع للبناء الكامل:** ~5-7 دقائق
2. ✅ **مساحة القرص المطلوبة:** ~2 GB في C:\temp
3. ✅ **اتصال الإنترنت:** مطلوب فقط لأول `npm install`
4. ✅ **صلاحيات المسؤول:** مطلوبة لتشغيل ISCC

---

## 📞 الدعم الفني

للتواصل أو الإبلاغ عن مشاكل:
- **الموقع:** http://localhost:5243
- **المطوّر:** KasserPro Software

---

**آخر تحديث:** 2026-02-21  
**النسخة:** 2.0
