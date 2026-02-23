# KasserPro Simple Build Script
$ErrorActionPreference = "Stop"

$root = "d:\مسح\POS"
$deploy = "$root\Deployment"
$iss = "$deploy\ISS"
$iscc = "C:\Users\mo\AppData\Local\Programs\Inno Setup 6\ISCC.exe"

Write-Host "Building KasserPro Setup for Win10/11 x64..." -ForegroundColor Cyan
& $iscc "$iss\KasserPro-Setup.iss"

Write-Host "`nBuilding KasserPro Setup for Win10/11 x86..." -ForegroundColor Cyan
& $iscc "$iss\KasserPro-Setup-x86.iss"

Write-Host "`nBuilding KasserPro Setup for Win7 x64..." -ForegroundColor Cyan
& $iscc "$iss\KasserPro-Setup-Win7-x64.iss"

Write-Host "`nBuilding KasserPro Setup for Win7 x86..." -ForegroundColor Cyan
& $iscc "$iss\KasserPro-Setup-Win7-x86.iss"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "All installers built successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Get-ChildItem "$deploy\Installers\*.exe" | ForEach-Object {
    $sizeMB = [math]::Round($_.Length/1MB,1)
    Write-Host "$($_.Name): $sizeMB MB" -ForegroundColor White
}
