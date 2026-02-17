@echo off
chcp 65001 >nul
title إعادة تفعيل تحديثات ويندوز 10
color 0B

echo ╔════════════════════════════════════════════════════════════╗
echo ║     إعادة تفعيل تحديثات ويندوز 10                          ║
echo ║     Windows 10 Update Re-Enabler                           ║
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

echo [1/6] إعادة تفعيل خدمة Windows Update...
sc config wuauserv start= demand >nul 2>&1
sc start wuauserv >nul 2>&1
echo       تم ✓

echo [2/6] إعادة تفعيل خدمة BITS...
sc config BITS start= demand >nul 2>&1
sc start BITS >nul 2>&1
echo       تم ✓

echo [3/6] إعادة تفعيل خدمة Windows Update Medic Service...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc" /v "Start" /t REG_DWORD /d 3 /f >nul 2>&1
sc config WaaSMedicSvc start= demand >nul 2>&1
echo       تم ✓

echo [4/6] إعادة تفعيل خدمة Update Orchestrator Service...
sc config UsoSvc start= demand >nul 2>&1
sc start UsoSvc >nul 2>&1
echo       تم ✓

echo [5/6] إزالة سياسات منع التحديث من Registry...
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v "NoAutoUpdate" /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v "AUOptions" /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "TargetReleaseVersion" /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "TargetReleaseVersionInfo" /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "DeferFeatureUpdates" /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v "DeferFeatureUpdatesPeriodInDays" /f >nul 2>&1
echo       تم ✓

echo [6/6] إعادة تفعيل UsoClient...
icacls "%WINDIR%\System32\UsoClient.exe" /grant Everyone:F >nul 2>&1
echo       تم ✓

echo.
echo ══════════════════════════════════════════════════════════════
echo   تم إعادة تفعيل تحديثات ويندوز 10 بنجاح! ✓
echo   Windows 10 Updates have been re-enabled!
echo ══════════════════════════════════════════════════════════════
echo.
echo   ملاحظة: قد تحتاج إلى إزالة حظر السيرفرات من ملف hosts يدوياً:
echo   %WINDIR%\System32\drivers\etc\hosts
echo.
echo   وإعادة تفعيل المهام المجدولة من Task Scheduler
echo.
echo   يُنصح بإعادة تشغيل الجهاز لتطبيق التغييرات
echo.
echo ══════════════════════════════════════════════════════════════
echo.
pause
