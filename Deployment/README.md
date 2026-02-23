# 📦 KasserPro - Deployment Package

> **Modern deployment structure for KasserPro POS System**  
> Last Updated: 2026-02-21 | Version: 2.0

---

## 📁 Folder Structure

```
Deployment/
├─ Installers/             4 ready-to-distribute .exe files
├─ ISS/                    Inno Setup configuration files
├─ Icons/                  Application icons (kasserpro.ico)
├─ Scripts/                Build automation scripts
└─ Docs/                   Documentation and guides
```

---

## 🚀 Quick Start

### Build All Versions:
```powershell
cd Scripts
.\BUILD_ALL.ps1
```

### Result:
All 4 installers will be built and ready in `Installers\` folder:
- ✅ KasserPro-Setup.exe (Win10/11 x64) - ~124 MB
- ✅ KasserPro-Setup-x86.exe (Win10/11 x86) - ~74 MB
- ✅ KasserPro-Setup-Win7-x64.exe (Win7 x64) - ~79 MB
- ✅ KasserPro-Setup-Win7-x86.exe (Win7 x86) - ~71 MB

---

## 📚 Documentation

- **[BUILD_GUIDE.md](Docs/BUILD_GUIDE.md)** - Complete build instructions (Arabic)
- **[BUILD_ALL_VERSIONS_OLD.md](Docs/BUILD_ALL_VERSIONS_OLD.md)** - Legacy documentation (archived)

---

## ⚙️ Configuration Files

All ISS files are configured to output directly to `Deployment\Installers\`:

| File | Target Platform | .NET Version |
|------|----------------|--------------|
| `KasserPro-Setup.iss` | Win10/11 x64 | .NET 8 |
| `KasserPro-Setup-x86.iss` | Win10/11 x86 | .NET 8 |
| `KasserPro-Setup-Win7-x64.iss` | Win7 SP1+ x64 | .NET 6 |
| `KasserPro-Setup-Win7-x86.iss` | Win7 SP1+ x86 | .NET 6 |

---

## 🎨 Features

### ✅ Custom Icon
- Professional blue gradient icon with white "K" letter
- Embedded directly in desktop shortcuts
- Auto-refreshed icon cache on install

### ✅ Update vs Fresh Install
When re-installing, users get two options:
- **Update:** Keep all data (database, settings, license)
- **Fresh Install:** Delete everything (with double confirmation)

### ✅ Windows 7 Support
- Automatic KB patch detection
- Clear error messages for missing patches
- Offline installation support

---

## 🔧 Requirements

- ✅ .NET 8 SDK (8.0.417+)
- ✅ .NET 6 SDK (6.0.428+) - for Win7 builds
- ✅ Node.js + npm
- ✅ Inno Setup 6 (6.7.1+)

---

## 📊 Build Options

```powershell
# Skip frontend (when unchanged)
.\BUILD_ALL.ps1 -SkipFrontend

# Skip backend (when unchanged)
.\BUILD_ALL.ps1 -SkipBackend

# Build installers only (after previous build)
.\BUILD_ALL.ps1 -SkipFrontend -SkipBackend

# Build code only (skip packaging)
.\BUILD_ALL.ps1 -SkipInstallers
```

---

## 🛡️ Security

- **Installer Password:** `KasserPro@Installer2026`
- **MAC Binding:** Automatic license key tied to hardware
- **Admin Required:** All installers require elevation

---

## 📞 Support

- **URL:** http://localhost:5243
- **Developer:** KasserPro Software

---

**Built with ❤️ using .NET, React, and Inno Setup**
