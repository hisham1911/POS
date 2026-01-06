<div align="center">

# 🏪 KasserPro

### Modern Point of Sale System

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A full-featured, modern Point of Sale system built with Clean Architecture principles.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🛒 **POS Interface** | Fast, intuitive sales interface with real-time cart |
| 📦 **Product Management** | Full CRUD for products and categories |
| 📋 **Order Management** | Track and manage all orders |
| ⏰ **Shift Management** | Open/close shifts with cash tracking |
| 📊 **Reports** | Daily sales reports and analytics |
| 🌐 **RTL Support** | Full Arabic language support |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |
| 🔐 **Authentication** | JWT-based auth with role management |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                   React + TypeScript                         │
│              Redux Toolkit + RTK Query                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────────┐
│                      API Layer                               │
│                   ASP.NET Core 8                             │
├─────────────────────────────────────────────────────────────┤
│                  Application Layer                           │
│              Business Logic & Services                       │
├─────────────────────────────────────────────────────────────┤
│                    Domain Layer                              │
│              Entities & Interfaces                           │
├─────────────────────────────────────────────────────────────┤
│                Infrastructure Layer                          │
│           EF Core + SQLite + External Services               │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
KasserPro/
├── src/                              # Backend Source
│   ├── KasserPro.API/               # REST API & Controllers
│   ├── KasserPro.Application/       # Business Logic & DTOs
│   ├── KasserPro.Domain/            # Entities & Interfaces
│   └── KasserPro.Infrastructure/    # Data Access & Services
│
├── client/                           # Frontend Source
│   ├── src/
│   │   ├── api/                     # API Integration (RTK Query)
│   │   ├── components/              # Reusable Components
│   │   ├── hooks/                   # Custom React Hooks
│   │   ├── pages/                   # Page Components
│   │   ├── store/                   # Redux Store & Slices
│   │   ├── types/                   # TypeScript Definitions
│   │   └── utils/                   # Helper Functions
│   └── ...
│
├── docs/                             # Documentation
│   ├── api/                         # API Documentation
│   ├── guides/                      # Development Guides
│   └── design/                      # Design System
│
├── scripts/                          # Build & Deploy Scripts
├── .github/                          # GitHub Actions & Templates
└── docker/                           # Docker Configuration
```

## 🚀 Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/KasserPro.git
cd KasserPro

# Start Backend
cd src/KasserPro.API
dotnet restore
dotnet run

# Start Frontend (new terminal)
cd client
npm install
npm run dev
```

### Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Swagger Docs | http://localhost:5000/swagger |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kasserpro.com | admin123 |
| Cashier | cashier@kasserpro.com | cashier123 |

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api/API_DOCUMENTATION.md) | Complete API documentation |
| [Backend Guide](docs/guides/BACKEND_GUIDE.md) | Backend development guide |
| [Frontend Guide](docs/guides/FRONTEND_GUIDE.md) | Frontend development guide |
| [Design System](docs/design/DESIGN_SYSTEM.md) | UI/UX design guidelines |

## 🛠️ Tech Stack

### Backend
- **.NET 8** - Web API Framework
- **Entity Framework Core** - ORM
- **SQLite** - Database
- **JWT** - Authentication
- **AutoMapper** - Object Mapping
- **FluentValidation** - Input Validation

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Redux Toolkit** - State Management
- **RTK Query** - Data Fetching
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Vite** - Build Tool

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Login Page
![Login](docs/screenshots/login.png)

### POS Interface
![POS](docs/screenshots/pos.png)

### Products Management
![Products](docs/screenshots/products.png)

</details>

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Your Name]

</div>
