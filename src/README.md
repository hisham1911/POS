# KasserPro Backend

.NET 8 Web API backend for KasserPro POS system.

## Architecture

This project follows **Clean Architecture** principles:

```
src/
├── KasserPro.API/              # Presentation Layer
│   ├── Controllers/            # API Controllers
│   ├── Middleware/             # Custom Middleware
│   └── Program.cs              # Application Entry Point
│
├── KasserPro.Application/      # Application Layer
│   ├── DTOs/                   # Data Transfer Objects
│   ├── Interfaces/             # Service Interfaces
│   ├── Services/               # Business Logic
│   └── Validators/             # Input Validation
│
├── KasserPro.Domain/           # Domain Layer
│   ├── Entities/               # Domain Entities
│   ├── Enums/                  # Enumerations
│   └── Interfaces/             # Repository Interfaces
│
└── KasserPro.Infrastructure/   # Infrastructure Layer
    ├── Data/                   # EF Core DbContext
    ├── Repositories/           # Repository Implementations
    └── Services/               # External Services
```

## Getting Started

```bash
cd KasserPro.API

# Restore packages
dotnet restore

# Run the application
dotnet run

# Or with hot reload
dotnet watch run
```

## API Endpoints

The API will be available at `http://localhost:5000`

Swagger documentation: `http://localhost:5000/swagger`

## Configuration

Copy `appsettings.example.json` to `appsettings.json` and configure:

- Database connection string
- JWT settings
- Logging configuration

## Database

Using **SQLite** for simplicity. The database file (`kasserpro.db`) is created automatically on first run.

### Migrations

```bash
# Add migration
dotnet ef migrations add MigrationName -p ../KasserPro.Infrastructure -s .

# Update database
dotnet ef database update -p ../KasserPro.Infrastructure -s .
```
