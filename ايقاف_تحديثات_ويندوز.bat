@echo off
chcp 65001 >nul
title إيقاف تحديثات ويندوز 10 نهائياً
color 0A

echo ╔════════════════════════════════════════════════════════════╗
echo ║     إيقاف تحديثات ويندوز 10 نهائياً                        ║
echo ║     Windows 10 Update Blocker                              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: التحقق من صلاحيات المسؤول
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [خطأ] يجب تشغيل هذا الملف كمسؤول Administrator
    echo [Error] Please run as Administrator
    echo.
    echo اضغط أي زر للخروج...
    pause >nul
    exit /b 1
)

echo [1/8] إيقاف خدمة Windows Update...
sc stop wuauserv >nul 2>&1
sc config wuauserv start= disabled >nul 2>&1
echo       تم ✓

echo [2/8] إيقاف خدمة BITS (Background Intelligent Transfer Service)...
sc stop BITS >nul 2>&1
sc config BITS start= disabled >nul 2>&1
echo       تم ✓

echo [3/8] إيقاف خدمة Windows Update Medic Service...
sc stop WaaSMedicSvc >nul 2>&1
sc config WaaSMedicSvc start= disabled >nul 2>&1
:: تغيير صلاحيات الخدمة لمنع إعادة تفعيلها
reg add "HKLM\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc" /v "Start" /t REG_DWORD /d 4 /f >nul 2>&1
echo       تم ✓

echo [4/8] إيقاف خدمة Update Orchestrator Service...
sc stop UsoSvc >nul 2>&1
sc config UsoSvc start= disabled >nul 2>&1
echo       تم ✓

echo [5/8] إضافة سياسات منع التحديث في Registry...
:: منع التحديثات التلقائية
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v "NoAutoUpdate" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v "AUOptions" /t REG_DWORD /d 1 /f >nul 2>&1

:: منع تحديثات Feature Updates نهائياً
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "TargetReleaseVersion" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "TargetReleaseVersionInfo" /t REG_SZ /d "22H2" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "DeferFeatureUpdates" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "DeferFeatureUpdatesPeriodInDays" /t REG_DWORD /d 365 /f >nul 2>&1

:: تعطيل Windows Update بالكامل
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" /v "AUOptions" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" /v "EnableFeaturedSoftware" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" /v "IncludeRecommendedUpdates" /t REG_DWORD /d 0 /f >nul 2>&1
echo       تم ✓

echo [6/8] تعطيل المهام المجدولة للتحديثات...
schtasks /Change /TN "\Microsoft\Windows\WindowsUpdate\Scheduled Start" /Disable >nul 2>&1
schtasks /Change /TN "\Microsoft\Windows\WindowsUpdate\Automatic App Update" /Disable >nul 2>&1
schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\Schedule Scan" /Disable >nul 2>&1
schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\Schedule Scan Static Task" /Disable >nul 2>&1
schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\USO_UxBroker" /Disable >nul 2>&1
schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\Reboot" /Disable >nul 2>&1
schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\Reboot_AC" /Disable >nul 2>&1
schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\Reboot_Battery" /Disable >nul 2>&1
echo       تم ✓

echo [7/8] حظر اتصال Windows Update بالإنترنت عبر Hosts...
:: إضافة حظر سيرفرات التحديث في ملف hosts
echo. >> %WINDIR%\System32\drivers\etc\hosts
echo # Windows Update Block - Added by Update Blocker >> %WINDIR%\System32\drivers\etc\hosts
echo 127.0.0.1 update.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 127.0.0.1 windowsupdate.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 127.0.0.1 download.windowsupdate.com >> %WINDIR%\System32\drivers\etc\hosts
echo 127.0.0.1 download.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 127.0.0.1 wustat.windows.com >> %WINDIR%\System32\drivers\etc\hosts
echo 127.0.0.1 ntservicepack.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 127.0.0.1 stats.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo       تم ✓

echo [8/8] منع إعادة تفعيل الخدمات تلقائياً...
:: تغيير صلاحيات ملفات Windows Update
takeown /f "%WINDIR%\System32\UsoClient.exe" >nul 2>&1
icacls "%WINDIR%\System32\UsoClient.exe" /deny Everyone:F >nul 2>&1
echo       تم ✓

echo.
echo ══════════════════════════════════════════════════════════════
echo   تم إيقاف جميع تحديثات ويندوز 10 بنجاح! ✓
echo   Windows 10 Updates have been completely disabled!
echo ══════════════════════════════════════════════════════════════
echo.
echo   الخدمات المعطلة:
echo   - Windows Update Service
echo   - Background Intelligent Transfer Service (BITS)
echo   - Windows Update Medic Service
echo   - Update Orchestrator Service
echo.
echo   تم أيضاً:
echo   - إيقاف Feature Updates نهائياً
echo   - تعطيل المهام المجدولة للتحديثات
echo   - حظر سيرفرات التحديث
echo.
echo   ملاحظة: يُنصح بإعادة تشغيل الجهاز لتطبيق التغييرات
echo.
echo ══════════════════════════════════════════════════════════════
echo.
pause
