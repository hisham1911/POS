# دليل بناء الأربع نسخ بعد كل تحديث

---

## أولاً: إجابة الأسئلة المهمة

### ❓ هل تغيّر المشروع الأصلي؟

**لا.** المشروع الأصلي في `d:\مسح\POS\backend\` لم يتغير خالص.

- `KasserPro.API` → **net8.0** (أصلي ✅)
- `KasserPro.BridgeApp` → **net8.0-windows** (أصلي ✅)

النسخة المعدلة (net6.0) موجودة فقط في `C:\temp\net6src\` وهي **نسخة منفصلة** للـ Win7.

### ❓ هل تقدر تشغل التطبيق محلياً وتكمل تطويره؟

**نعم بشكل كامل.** اشتغل على المشروع الأصلي net8.0 كما هو:

```bash
# تشغيل الـ Backend
cd d:\مسح\POS\backend\KasserPro.API
dotnet run

# تشغيل الـ Frontend (في تيرمينال تاني)
cd d:\مسح\POS\frontend
npm run dev

# تشغيل الـ BridgeApp (اختياري للطباعة)
cd d:\مسح\POS\backend\KasserPro.BridgeApp
dotnet run
```

---

## ثانياً: متطلبات كل نسخة من الأربع

| النسخة           | الملف                          | ويندوز | ما يحتاجه العميل                   |
| ---------------- | ------------------------------ | ------ | ---------------------------------- |
| **Win10/11 x64** | `KasserPro-Setup.exe`          | 10/11  | لا شيء — يثبّت مباشرة              |
| **Win10/11 x86** | `KasserPro-Setup-x86.exe`      | 10/11  | لا شيء — يثبّت مباشرة              |
| **Win7 x64**     | `KasserPro-Setup-Win7-x64.exe` | 7 SP1  | ⚠️ باتشات قبل التثبيت (انظر أدناه) |
| **Win7 x86**     | `KasserPro-Setup-Win7-x86.exe` | 7 SP1  | ⚠️ باتشات قبل التثبيت (انظر أدناه) |

### متطلبات Win7 قبل التثبيت (مرة واحدة فقط)

العميل يحتاج يثبّتهم **بالترتيب ده**، ثم يعمل Restart:

1. **KB4490628** — Servicing Stack Update (9 MB) — ثبّته أولاً
2. **KB4474419** — SHA-2 Code Signing (53 MB x64 / 34 MB x86) — ثبّته ثانياً
3. **Restart الجهاز**
4. ثبّت المشروع

تحميلهم من: https://www.catalog.update.microsoft.com/Search.aspx?q=KB4490628

> ملاحظة: الملف `Win7-Prerequisites.bat` اللي جوه المشروع بيشرح الخطوات ويفتح الكاتالوج تلقائياً.

---

## ثالثاً: خطوات البناء بعد كل تحديث

### المتطلبات على جهازك

- .NET 8 SDK (للـ Win10/11)
- .NET 6 SDK version 6.0.428 (للـ Win7) — مثبّت على `C:\Program Files\dotnet\`
- Inno Setup 6 — مثبّت على `C:\Users\mo\AppData\Local\Programs\Inno Setup 6\`
- Node.js + npm (لبناء الـ Frontend)

---

### الخطوة 1: بناء الـ Frontend (مشترك لكل النسخ)

```powershell
cd d:\مسح\POS\frontend
npm run build
# الناتج في: d:\مسح\POS\backend\KasserPro.API\wwwroot\
```

---

### الخطوة 2: بناء نسخة Win10/11 x64

```powershell
cd d:\مسح\POS\backend\KasserPro.API
dotnet publish -c Release -r win-x64 --self-contained true -o C:\temp\kasserpro-src-x64

cd d:\مسح\POS\backend\KasserPro.BridgeApp
dotnet publish -c Release -r win-x64 --self-contained true -o C:\temp\kasserpro-src-x64\bridge

# نسخ ملفات الإعداد
Copy-Item "d:\مسح\POS\backend\KasserPro.API\wwwroot" "C:\temp\kasserpro-src-x64\wwwroot" -Recurse -Force
Copy-Item "d:\مسح\POS\OpenBrowser.bat" "C:\temp\kasserpro-src-x64\" -Force 2>$null

# بناء المثبّت
& "C:\Users\mo\AppData\Local\Programs\Inno Setup 6\ISCC.exe" "d:\مسح\POS\KasserPro-Setup.iss"
```

---

### الخطوة 3: بناء نسخة Win10/11 x86

```powershell
cd d:\مسح\POS\backend\KasserPro.API
dotnet publish -c Release -r win-x86 --self-contained true -o C:\temp\kasserpro-src-x86

cd d:\مسح\POS\backend\KasserPro.BridgeApp
dotnet publish -c Release -r win-x86 --self-contained true -o C:\temp\kasserpro-src-x86\bridge

& "C:\Users\mo\AppData\Local\Programs\Inno Setup 6\ISCC.exe" "d:\مسح\POS\KasserPro-Setup-x86.iss"
```

---

### الخطوة 4: بناء نسخة Win7 x64

```powershell
# بناء من مجلد net6src (المشروع المعدّل لـ net6.0)
cd C:\temp\net6src\backend\KasserPro.API
dotnet publish -c Release -r win-x64 --self-contained true -o C:\temp\kasserpro-src-win7-x64

cd C:\temp\net6src\backend\KasserPro.BridgeApp
dotnet publish -c Release -r win-x64 --self-contained true -o C:\temp\kasserpro-src-win7-x64\bridge

# نسخ wwwroot (نفسه للنسخ الأربعة)
Copy-Item "d:\مسح\POS\backend\KasserPro.API\wwwroot" "C:\temp\kasserpro-src-win7-x64\wwwroot" -Recurse -Force

& "C:\Users\mo\AppData\Local\Programs\Inno Setup 6\ISCC.exe" "C:\temp\KasserPro-Setup-Win7-x64.iss"
```

---

### الخطوة 5: بناء نسخة Win7 x86

```powershell
cd C:\temp\net6src\backend\KasserPro.API
dotnet publish -c Release -r win-x86 --self-contained true -o C:\temp\kasserpro-src-win7-x86

cd C:\temp\net6src\backend\KasserPro.BridgeApp
dotnet publish -c Release -r win-x86 --self-contained true -o C:\temp\kasserpro-src-win7-x86\bridge

Copy-Item "d:\مسح\POS\backend\KasserPro.API\wwwroot" "C:\temp\kasserpro-src-win7-x86\wwwroot" -Recurse -Force

& "C:\Users\mo\AppData\Local\Programs\Inno Setup 6\ISCC.exe" "C:\temp\KasserPro-Setup-Win7-x86.iss"
```

---

### الخطوة 6: جمع النسخ الأربع

```powershell
$dest = "d:\مسح\POS\"
Copy-Item "C:\temp\KasserPro-Setup-Win7-x64.exe" $dest -Force
Copy-Item "C:\temp\KasserPro-Setup-Win7-x86.exe" $dest -Force
# نسختا Win10 بتولدوا في نفس المجلد مباشرة حسب إعداد ISS

Get-ChildItem $dest -Filter "*.exe" | Select-Object Name, @{N='MB';E={[math]::Round($_.Length/1MB,1)}}
```

---

## رابعاً: تحديث مشروع net6src عند إضافة ميزات جديدة

عند إضافة Package جديد للمشروع الأصلي، لازم تضيفه بنفسه لـ `C:\temp\net6src\` مع تغيير الإصدار لـ **6.x.x** بدلاً من 8.x.x.

### قواعد مهمة عند تحديث net6src:

- ❌ لا تستخدم `Microsoft.AspNetCore.RateLimiting` (مش موجود في .NET 6)
- ❌ لا تستخدم `file sealed class` (يصبح `internal sealed class`)
- ❌ لا تستخدم `Microsoft.AspNetCore.OpenApi` (مش موجود في .NET 6)
- ✅ كل packages تكون إصدار **6.x.x**

---

## خامساً: البكسكريبت الكامل (كل شيء دفعة واحدة)

الملف `BUILD_ALL.ps1` في نفس المجلد — شغّله وانتظر ~10 دقائق وهيطلعلك الأربع نسخ.
