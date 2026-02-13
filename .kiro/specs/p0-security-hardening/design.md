# Design Document: P0 Security Hardening

## Overview

This design addresses 7 critical security blockers and production hardening gaps identified in comprehensive architectural reviews of KasserPro. The system currently has solid financial transaction logic but lacks infrastructure for real-world deployment where power outages, concurrent operations, and disk failures are certainties.

The design prioritizes security-critical fixes first (Phase 0), followed by production hardening (Phase 1), and operational fixes (Phase 2). All changes preserve existing financial logic and maintain Clean Architecture boundaries.

**Key Design Principles:**
- Security fixes before feature additions
- Fail-fast validation at system boundaries
- Explicit error handling with actionable messages
- Zero-downtime backup operations
- Atomic operations with clear rollback paths

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│  - Cart persistence (localStorage)                           │
│  - beforeunload warning                                      │
│  - X-Branch-Id header (validated server-side)                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + JWT
┌────────────────────▼────────────────────────────────────────┐
│                  ASP.NET Core API                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Middleware Pipeline                                   │   │
│  │  1. MaintenanceModeMiddleware (503 if locked)        │   │
│  │  2. CorrelationIdMiddleware (generate/read)          │   │
│  │  3. Authentication (JWT validation + stamp check)    │   │
│  │  4. BranchAccessMiddleware (validate X-Branch-Id)    │   │
│  │  5. ExceptionMiddleware (SQLite error mapping)       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Application Services                                  │   │
│  │  - AuthService (role escalation guard)               │   │
│  │  - BackupService (SQLite backup API)                 │   │
│  │  - RestoreService (maintenance mode + restore)       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Background Services                                   │   │
│  │  - DailyBackupService (2 AM backup)                  │   │
│  │  - AutoCloseShiftService (cash register fix)         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              SQLite Database (WAL mode)                      │
│  - journal_mode=WAL                                          │
│  - busy_timeout=5000                                         │
│  - synchronous=NORMAL                                        │
│  - foreign_keys=ON                                           │
└──────────────────────────────────────────────────────────────┘
```

### Phase Breakdown

**Phase 0: Critical Security Hotfixes (Day 1)**
- X-Branch-Id validation middleware
- Role escalation guard in RegisterAsync
- SecurityStamp field + JWT validation
- Maintenance mode middleware

**Phase 1: Production Hardening (Days 2-3)**
- SQLite PRAGMA configuration
- Serilog file logging
- SQLite exception mapping
- Backup service + daily scheduler
- Restore service
- Pre-migration backup

**Phase 2: Operational Fixes (Day 4)**
- Cart persistence with redux-persist
- Auto-close shift cash register fix


## Components and Interfaces

### 1. BranchAccessMiddleware

**Purpose:** Validate X-Branch-Id header against user's authorized branches

**Location:** `src/KasserPro.API/Middleware/BranchAccessMiddleware.cs`

**Algorithm:**
```
1. Extract X-Branch-Id from request headers
2. If header is missing, use branchId from JWT claims (existing behavior)
3. If header is present:
   a. Get authenticated userId from JWT
   b. Query User record from database
   c. Compare header branchId with user.BranchId
   d. If mismatch, return 403 with error code BRANCH_ACCESS_DENIED
   e. If match, continue pipeline
4. Log all branch access violations
```

**Interface:**
```csharp
public class BranchAccessMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<BranchAccessMiddleware> _logger;
    
    public async Task InvokeAsync(HttpContext context, IUnitOfWork unitOfWork)
    {
        // Skip for anonymous endpoints
        if (!context.User.Identity?.IsAuthenticated ?? true)
            return await _next(context);
            
        var headerBranchId = context.Request.Headers["X-Branch-Id"].FirstOrDefault();
        if (string.IsNullOrEmpty(headerBranchId))
            return await _next(context);
            
        var userId = int.Parse(context.User.FindFirst("userId")!.Value);
        var user = await unitOfWork.Users.GetByIdAsync(userId);
        
        if (user.BranchId != int.Parse(headerBranchId))
        {
            _logger.LogWarning("Branch access denied: User {UserId} attempted to access Branch {BranchId}", 
                userId, headerBranchId);
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { 
                success = false, 
                errorCode = "BRANCH_ACCESS_DENIED",
                message = "ليس لديك صلاحية الوصول لهذا الفرع" 
            });
            return;
        }
        
        await _next(context);
    }
}
```

### 2. SecurityStamp Implementation

**Purpose:** Invalidate JWTs immediately when user permissions change

**Components:**

**2.1 Database Migration**
```csharp
public partial class AddSecurityStamp : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "SecurityStamp",
            table: "Users",
            type: "TEXT",
            maxLength: 64,
            nullable: false,
            defaultValue: Guid.NewGuid().ToString());
    }
}
```

**2.2 User Entity Update**
```csharp
public class User : BaseEntity
{
    // ... existing properties
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString();
    
    public void UpdateSecurityStamp()
    {
        SecurityStamp = Guid.NewGuid().ToString();
    }
}
```

**2.3 AuthService Token Generation**
```csharp
private string GenerateToken(User user)
{
    var claims = new List<Claim>
    {
        new("userId", user.Id.ToString()),
        new("security_stamp", user.SecurityStamp), // NEW
        // ... existing claims
    };
    // ... rest of token generation
}
```

**2.4 JWT Validation in Program.cs**
```csharp
options.Events = new JwtBearerEvents
{
    OnTokenValidated = async context =>
    {
        var userId = int.Parse(context.Principal!.FindFirst("userId")!.Value);
        var tokenStamp = context.Principal.FindFirst("security_stamp")?.Value;
        
        var unitOfWork = context.HttpContext.RequestServices.GetRequiredService<IUnitOfWork>();
        var user = await unitOfWork.Users.GetByIdAsync(userId);
        
        if (user == null || !user.IsActive)
        {
            context.Fail("User not found or inactive");
            return;
        }
        
        if (user.SecurityStamp != tokenStamp)
        {
            context.Fail("Token invalidated");
            return;
        }
        
        // Check tenant active status (existing)
        if (user.TenantId.HasValue)
        {
            var tenant = await unitOfWork.Tenants.GetByIdAsync(user.TenantId.Value);
            if (tenant == null || !tenant.IsActive)
            {
                context.Fail("Tenant inactive");
                return;
            }
        }
    }
};
```

**2.5 Stamp Update Triggers**
- User role change → UpdateSecurityStamp()
- User branch change → UpdateSecurityStamp()
- User deactivation → UpdateSecurityStamp()
- Password change → UpdateSecurityStamp()


### 3. Role Escalation Guard

**Purpose:** Prevent Admins from creating SystemOwner accounts

**Location:** `src/KasserPro.Application/Services/Implementations/AuthService.cs`

**Algorithm:**
```
1. Extract current user's role from JWT claims
2. Extract requested role from RegisterRequest
3. If current role is Admin AND requested role is SystemOwner:
   - Return error with code INSUFFICIENT_PRIVILEGES
4. If current role is SystemOwner:
   - Allow any role assignment
5. If current role is Admin:
   - Allow only Admin or Cashier roles
6. Log all role escalation attempts
```

**Implementation:**
```csharp
public async Task<ApiResponse<bool>> RegisterAsync(RegisterRequest request)
{
    // Get current user's role from ICurrentUserService
    var currentUserRole = Enum.Parse<UserRole>(_currentUserService.Role!);
    var requestedRole = Enum.Parse<UserRole>(request.Role);
    
    // Role escalation guard
    if (currentUserRole == UserRole.Admin && requestedRole == UserRole.SystemOwner)
    {
        _logger.LogWarning("Role escalation attempt: Admin {UserId} tried to create SystemOwner", 
            _currentUserService.UserId);
        return ApiResponse<bool>.Fail("INSUFFICIENT_PRIVILEGES", 
            "ليس لديك صلاحية إنشاء حساب مالك النظام");
    }
    
    if (currentUserRole == UserRole.Admin && 
        requestedRole != UserRole.Admin && 
        requestedRole != UserRole.Cashier)
    {
        return ApiResponse<bool>.Fail("INSUFFICIENT_PRIVILEGES", 
            "يمكنك فقط إنشاء حسابات مدير أو كاشير");
    }
    
    // ... rest of existing registration logic
}
```

### 4. Maintenance Mode Middleware

**Purpose:** Block incoming requests during critical operations (restore, migration)

**Location:** `src/KasserPro.API/Middleware/MaintenanceModeMiddleware.cs`

**Algorithm:**
```
1. Check if maintenance.lock file exists in application root
2. If file exists:
   a. Allow health check endpoint (/health)
   b. Reject all other requests with HTTP 503
   c. Return Arabic message "النظام قيد الصيانة"
3. If file doesn't exist, continue pipeline
```

**Implementation:**
```csharp
public class MaintenanceModeMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<MaintenanceModeMiddleware> _logger;
    private readonly string _lockFilePath;
    
    public MaintenanceModeMiddleware(RequestDelegate next, 
        ILogger<MaintenanceModeMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _lockFilePath = Path.Combine(env.ContentRootPath, "maintenance.lock");
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        if (File.Exists(_lockFilePath))
        {
            // Allow health checks
            if (context.Request.Path.StartsWithSegments("/health"))
            {
                await _next(context);
                return;
            }
            
            _logger.LogInformation("Request blocked due to maintenance mode: {Path}", 
                context.Request.Path);
            
            context.Response.StatusCode = 503;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = "النظام قيد الصيانة. يرجى المحاولة لاحقاً",
                retryAfter = 60 // seconds
            });
            return;
        }
        
        await _next(context);
    }
}

// Helper class for maintenance mode control
public class MaintenanceModeService
{
    private readonly string _lockFilePath;
    private readonly ILogger<MaintenanceModeService> _logger;
    
    public void Enable(string reason)
    {
        File.WriteAllText(_lockFilePath, $"{DateTime.UtcNow:O}|{reason}");
        _logger.LogWarning("Maintenance mode enabled: {Reason}", reason);
    }
    
    public void Disable()
    {
        if (File.Exists(_lockFilePath))
        {
            File.Delete(_lockFilePath);
            _logger.LogInformation("Maintenance mode disabled");
        }
    }
    
    public bool IsEnabled() => File.Exists(_lockFilePath);
}
```

### 5. SQLite Configuration Service

**Purpose:** Configure SQLite for production use with WAL mode and proper timeouts

**Location:** `src/KasserPro.Infrastructure/Data/SqliteConfigurationService.cs`

**Algorithm:**
```
1. On application startup, after DbContext registration
2. Open a connection to the database
3. Execute PRAGMA commands:
   - journal_mode=WAL (persistent, database-level)
   - busy_timeout=5000 (per-connection)
   - synchronous=NORMAL (per-connection)
   - foreign_keys=ON (per-connection)
4. Verify WAL mode is active
5. Log configuration status
```

**Implementation:**
```csharp
public class SqliteConfigurationService
{
    private readonly ILogger<SqliteConfigurationService> _logger;
    
    public async Task ConfigureAsync(IDbConnection connection)
    {
        await connection.OpenAsync();
        
        using var cmd = connection.CreateCommand();
        
        // Set WAL mode (persistent, database-level)
        cmd.CommandText = "PRAGMA journal_mode=WAL;";
        var journalMode = await cmd.ExecuteScalarAsync();
        _logger.LogInformation("SQLite journal_mode: {Mode}", journalMode);
        
        if (journalMode?.ToString()?.ToUpper() != "WAL")
        {
            _logger.LogWarning("Failed to enable WAL mode, using default journal mode");
        }
        
        // Set per-connection PRAGMAs
        cmd.CommandText = @"
            PRAGMA busy_timeout=5000;
            PRAGMA synchronous=NORMAL;
            PRAGMA foreign_keys=ON;
        ";
        await cmd.ExecuteNonQueryAsync();
        
        _logger.LogInformation("SQLite configuration applied: busy_timeout=5000, synchronous=NORMAL, foreign_keys=ON");
    }
}

// In Program.cs, after app.Build():
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var configService = scope.ServiceProvider.GetRequiredService<SqliteConfigurationService>();
    await configService.ConfigureAsync(context.Database.GetDbConnection());
}
```


### 6. Logging Configuration

**Purpose:** Persistent file-based logging with separate sinks for application and financial audit logs

**Location:** `src/KasserPro.API/Program.cs`

**Configuration:**
```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/kasserpro-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(e => e.Properties.ContainsKey("AuditType"))
        .WriteTo.File(
            path: "logs/financial-audit-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 90,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}"))
    .CreateLogger();

builder.Host.UseSerilog();
```

**Correlation ID Middleware:**
```csharp
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeader = "X-Correlation-Id";
    
    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = Guid.NewGuid().ToString();
        context.Items["CorrelationId"] = correlationId;
        
        // Add to response headers for client tracking
        context.Response.Headers.Add(CorrelationIdHeader, correlationId);
        
        // Add to Serilog context
        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

**Financial Audit Logging:**
```csharp
// In services that perform financial operations
_logger.LogInformation("Order completed: OrderId={OrderId}, Total={Total}, PaymentMethod={Method}",
    order.Id, order.TotalAmount, paymentMethod);

// Mark as audit log
using (LogContext.PushProperty("AuditType", "Financial"))
{
    _logger.LogInformation("Cash register transaction: Type={Type}, Amount={Amount}, Balance={Balance}",
        transaction.Type, transaction.Amount, newBalance);
}
```

### 7. SQLite Exception Mapping

**Purpose:** Map SQLite error codes to actionable Arabic error messages

**Location:** `src/KasserPro.API/Middleware/ExceptionMiddleware.cs`

**Implementation:**
```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (SqliteException sqliteEx)
        {
            var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();
            
            var (statusCode, errorCode, message) = sqliteEx.SqliteErrorCode switch
            {
                5 => (503, "SQLITE_BUSY", "النظام مشغول، حاول مرة أخرى بعد لحظات"),
                6 => (503, "SQLITE_LOCKED", "النظام مشغول، انتظر لحظة"),
                11 => (500, "SQLITE_CORRUPT", "خطأ في قاعدة البيانات. اتصل بالدعم الفني"),
                13 => (507, "SQLITE_FULL", "القرص ممتلئ! أوقف العمل واتصل بالدعم"),
                _ => (500, "SQLITE_ERROR", "خطأ في قاعدة البيانات")
            };
            
            _logger.LogError(sqliteEx, 
                "SQLite error {Code}: {Message} [CorrelationId: {CorrelationId}]", 
                sqliteEx.SqliteErrorCode, sqliteEx.Message, correlationId);
            
            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                errorCode,
                message,
                correlationId
            });
        }
        catch (IOException ioEx)
        {
            var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();
            
            _logger.LogCritical(ioEx, 
                "IO Error - possible disk full [CorrelationId: {CorrelationId}]", 
                correlationId);
            
            context.Response.StatusCode = 507;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                errorCode = "DISK_ERROR",
                message = "مشكلة في القرص. تحقق من المساحة المتوفرة",
                correlationId
            });
        }
        catch (DbUpdateConcurrencyException concurrencyEx)
        {
            var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();
            
            _logger.LogWarning(concurrencyEx, 
                "Concurrency conflict [CorrelationId: {CorrelationId}]", 
                correlationId);
            
            context.Response.StatusCode = 409;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                errorCode = "CONCURRENCY_CONFLICT",
                message = "تم تعديل البيانات من قبل مستخدم آخر. يرجى المحاولة مرة أخرى",
                correlationId
            });
        }
        catch (Exception ex)
        {
            var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();
            
            _logger.LogError(ex, 
                "Unhandled exception [CorrelationId: {CorrelationId}]", 
                correlationId);
            
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                errorCode = "INTERNAL_ERROR",
                message = "حدث خطأ داخلي",
                correlationId
            });
        }
    }
}
```


### 8. Backup Service

**Purpose:** Create safe hot backups using SQLite backup API

**Location:** `src/KasserPro.Application/Services/Implementations/BackupService.cs`

**Algorithm:**
```
1. Create backups directory if it doesn't exist
2. Generate timestamped backup filename
3. Open source connection (main database)
4. Open destination connection (backup file)
5. Use SQLite backup API to copy database
6. Run PRAGMA integrity_check on backup
7. If integrity check fails, delete backup and throw
8. Return backup metadata (path, size, timestamp)
9. Clean up old backups (keep last 14 daily)
```

**Implementation:**
```csharp
public interface IBackupService
{
    Task<BackupResult> CreateBackupAsync(string? reason = null);
    Task<List<BackupInfo>> GetBackupsAsync();
    Task DeleteOldBackupsAsync(int retainCount = 14);
}

public class BackupService : IBackupService
{
    private readonly IConfiguration _config;
    private readonly ILogger<BackupService> _logger;
    private readonly string _backupDirectory;
    
    public BackupService(IConfiguration config, ILogger<BackupService> logger)
    {
        _config = config;
        _logger = logger;
        _backupDirectory = Path.Combine(Directory.GetCurrentDirectory(), "backups");
        Directory.CreateDirectory(_backupDirectory);
    }
    
    public async Task<BackupResult> CreateBackupAsync(string? reason = null)
    {
        var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
        var prefix = reason == "pre-migration" ? "kasserpro-pre-migration" : "kasserpro-backup";
        var backupFileName = $"{prefix}-{timestamp}.db";
        var backupPath = Path.Combine(_backupDirectory, backupFileName);
        
        _logger.LogInformation("Starting backup: {FileName} (Reason: {Reason})", 
            backupFileName, reason ?? "manual");
        
        try
        {
            var connectionString = _config.GetConnectionString("DefaultConnection")!;
            var sourceDbPath = ExtractDbPath(connectionString);
            
            // Use SQLite backup API for hot backup
            using var source = new SqliteConnection($"Data Source={sourceDbPath}");
            using var destination = new SqliteConnection($"Data Source={backupPath}");
            
            await source.OpenAsync();
            await destination.OpenAsync();
            
            source.BackupDatabase(destination);
            
            // Verify backup integrity
            using var verifyCmd = destination.CreateCommand();
            verifyCmd.CommandText = "PRAGMA integrity_check;";
            var integrityResult = await verifyCmd.ExecuteScalarAsync();
            
            if (integrityResult?.ToString() != "ok")
            {
                File.Delete(backupPath);
                throw new InvalidOperationException($"Backup integrity check failed: {integrityResult}");
            }
            
            var fileInfo = new FileInfo(backupPath);
            
            _logger.LogInformation("Backup completed successfully: {FileName}, Size: {Size} bytes", 
                backupFileName, fileInfo.Length);
            
            // Clean up old backups (except pre-migration backups)
            if (reason != "pre-migration")
            {
                await DeleteOldBackupsAsync();
            }
            
            return new BackupResult
            {
                Success = true,
                FilePath = backupPath,
                FileName = backupFileName,
                SizeBytes = fileInfo.Length,
                Timestamp = DateTime.Now
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Backup failed: {FileName}", backupFileName);
            
            if (File.Exists(backupPath))
                File.Delete(backupPath);
            
            throw;
        }
    }
    
    public async Task DeleteOldBackupsAsync(int retainCount = 14)
    {
        var backups = Directory.GetFiles(_backupDirectory, "kasserpro-backup-*.db")
            .Select(f => new FileInfo(f))
            .OrderByDescending(f => f.CreationTime)
            .Skip(retainCount)
            .ToList();
        
        foreach (var backup in backups)
        {
            _logger.LogInformation("Deleting old backup: {FileName}", backup.Name);
            backup.Delete();
        }
    }
    
    private string ExtractDbPath(string connectionString)
    {
        var builder = new SqliteConnectionStringBuilder(connectionString);
        var dataSource = builder.DataSource;
        
        if (!Path.IsPathRooted(dataSource))
            return Path.Combine(Directory.GetCurrentDirectory(), dataSource);
        
        return dataSource;
    }
}

public class BackupResult
{
    public bool Success { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime Timestamp { get; set; }
}
```

### 9. Daily Backup Background Service

**Purpose:** Automatically create backups at 2 AM daily

**Location:** `src/KasserPro.Infrastructure/Services/DailyBackupBackgroundService.cs`

**Algorithm:**
```
1. Calculate time until next 2 AM
2. Wait until 2 AM
3. Create backup using BackupService
4. Log success/failure
5. Repeat daily
```

**Implementation:**
```csharp
public class DailyBackupBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyBackupBackgroundService> _logger;
    
    public DailyBackupBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<DailyBackupBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Daily backup service started");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            var next2AM = now.Date.AddDays(1).AddHours(2);
            
            if (now.Hour < 2)
                next2AM = now.Date.AddHours(2);
            
            var delay = next2AM - now;
            
            _logger.LogInformation("Next backup scheduled at {Time} (in {Hours}h {Minutes}m)", 
                next2AM, delay.Hours, delay.Minutes);
            
            await Task.Delay(delay, stoppingToken);
            
            if (stoppingToken.IsCancellationRequested)
                break;
            
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var backupService = scope.ServiceProvider.GetRequiredService<IBackupService>();
                
                var result = await backupService.CreateBackupAsync("daily-scheduled");
                
                _logger.LogInformation("Daily backup completed: {FileName}, Size: {Size} bytes",
                    result.FileName, result.SizeBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Daily backup failed");
            }
        }
    }
}
```


### 10. Restore Service

**Purpose:** Safely restore database from backup with maintenance mode

**Location:** `src/KasserPro.Application/Services/Implementations/RestoreService.cs`

**Algorithm:**
```
1. Validate backup file exists
2. Run integrity check on backup file
3. Enable maintenance mode
4. Close all database connections
5. Replace current database with backup
6. Run migrations if needed
7. Disable maintenance mode
8. Log restore operation
```

**Implementation:**
```csharp
public interface IRestoreService
{
    Task<RestoreResult> RestoreFromBackupAsync(string backupFileName);
}

public class RestoreService : IRestoreService
{
    private readonly IConfiguration _config;
    private readonly ILogger<RestoreService> _logger;
    private readonly MaintenanceModeService _maintenanceMode;
    private readonly string _backupDirectory;
    
    public RestoreService(
        IConfiguration config,
        ILogger<RestoreService> logger,
        MaintenanceModeService maintenanceMode)
    {
        _config = config;
        _logger = logger;
        _maintenanceMode = maintenanceMode;
        _backupDirectory = Path.Combine(Directory.GetCurrentDirectory(), "backups");
    }
    
    public async Task<RestoreResult> RestoreFromBackupAsync(string backupFileName)
    {
        var backupPath = Path.Combine(_backupDirectory, backupFileName);
        
        if (!File.Exists(backupPath))
        {
            return new RestoreResult
            {
                Success = false,
                ErrorCode = "BACKUP_NOT_FOUND",
                Message = "ملف النسخة الاحتياطية غير موجود"
            };
        }
        
        _logger.LogWarning("Starting restore from backup: {FileName}", backupFileName);
        
        try
        {
            // Verify backup integrity
            using (var verifyConn = new SqliteConnection($"Data Source={backupPath}"))
            {
                await verifyConn.OpenAsync();
                using var cmd = verifyConn.CreateCommand();
                cmd.CommandText = "PRAGMA integrity_check;";
                var result = await cmd.ExecuteScalarAsync();
                
                if (result?.ToString() != "ok")
                {
                    _logger.LogError("Backup file is corrupt: {FileName}", backupFileName);
                    return new RestoreResult
                    {
                        Success = false,
                        ErrorCode = "BACKUP_CORRUPT",
                        Message = "ملف النسخة الاحتياطية تالف"
                    };
                }
            }
            
            // Enable maintenance mode
            _maintenanceMode.Enable($"Restore from {backupFileName}");
            
            var connectionString = _config.GetConnectionString("DefaultConnection")!;
            var dbPath = ExtractDbPath(connectionString);
            
            // Close all connections by disposing the connection pool
            SqliteConnection.ClearAllPools();
            
            // Wait for connections to close
            await Task.Delay(1000);
            
            // Backup current database before restore (safety net)
            var preRestoreBackup = $"{dbPath}.pre-restore.{DateTime.Now:yyyyMMdd-HHmmss}.bak";
            File.Copy(dbPath, preRestoreBackup);
            _logger.LogInformation("Created pre-restore backup: {Path}", preRestoreBackup);
            
            // Replace database file
            File.Copy(backupPath, dbPath, overwrite: true);
            
            _logger.LogInformation("Database restored from: {FileName}", backupFileName);
            
            // Disable maintenance mode
            _maintenanceMode.Disable();
            
            return new RestoreResult
            {
                Success = true,
                Message = "تم استعادة النسخة الاحتياطية بنجاح"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Restore failed: {FileName}", backupFileName);
            
            // Keep maintenance mode enabled on failure
            return new RestoreResult
            {
                Success = false,
                ErrorCode = "RESTORE_FAILED",
                Message = "فشلت عملية الاستعادة. النظام في وضع الصيانة"
            };
        }
    }
    
    private string ExtractDbPath(string connectionString)
    {
        var builder = new SqliteConnectionStringBuilder(connectionString);
        var dataSource = builder.DataSource;
        
        if (!Path.IsPathRooted(dataSource))
            return Path.Combine(Directory.GetCurrentDirectory(), dataSource);
        
        return dataSource;
    }
}

public class RestoreResult
{
    public bool Success { get; set; }
    public string? ErrorCode { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

### 11. Pre-Migration Backup

**Purpose:** Automatically backup database before applying migrations

**Location:** `src/KasserPro.API/Program.cs` (in startup sequence)

**Algorithm:**
```
1. Check for pending migrations
2. If pending migrations exist:
   a. Create backup with reason "pre-migration"
   b. If backup fails, abort startup
   c. If backup succeeds, proceed with migrations
3. If no pending migrations, skip backup
```

**Implementation:**
```csharp
// In Program.cs, before MigrateAsync():
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var backupService = scope.ServiceProvider.GetRequiredService<IBackupService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        
        if (pendingMigrations.Any())
        {
            logger.LogWarning("Found {Count} pending migrations. Creating pre-migration backup...", 
                pendingMigrations.Count());
            
            var backupResult = await backupService.CreateBackupAsync("pre-migration");
            
            logger.LogInformation("Pre-migration backup created: {FileName}", 
                backupResult.FileName);
        }
        
        await context.Database.MigrateAsync();
        logger.LogInformation("Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Database migration failed. Application startup aborted.");
        throw;
    }
}
```


### 12. Cart Persistence

**Purpose:** Persist cart state to survive browser refresh and crashes

**Location:** `client/src/store/index.ts`

**Algorithm:**
```
1. Configure redux-persist for cart slice
2. Scope storage key by tenantId, branchId, userId
3. Set 24-hour TTL on persisted data
4. Restore cart on app mount
5. Clear cart after successful order completion
6. Add beforeunload warning when cart has items
```

**Implementation:**

**12.1 Redux Persist Configuration**
```typescript
// client/src/store/index.ts
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { cartSlice } from './slices/cartSlice';

// Cart persist config with scoped key
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'customerId'], // Only persist these fields
  keyPrefix: '', // We'll use a custom key
  // Transform to add TTL
  transforms: [
    {
      in: (state: any) => ({
        ...state,
        _persistedAt: Date.now()
      }),
      out: (state: any) => {
        const TTL = 24 * 60 * 60 * 1000; // 24 hours
        if (state._persistedAt && Date.now() - state._persistedAt > TTL) {
          return undefined; // Expire old cart
        }
        return state;
      }
    }
  ]
};

// Create persisted cart reducer
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice.reducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // existing
    branch: persistedBranchReducer, // existing
    cart: persistedCartReducer, // NEW
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);
```

**12.2 Scoped Storage Key**
```typescript
// client/src/store/cartPersistConfig.ts
import { createTransform } from 'redux-persist';

export const createCartPersistConfig = (userId: number, tenantId: number, branchId: number) => ({
  key: `cart:${tenantId}:${branchId}:${userId}`,
  storage,
  whitelist: ['items', 'customerId'],
  transforms: [
    createTransform(
      // Transform state on save
      (inboundState: any) => ({
        ...inboundState,
        _persistedAt: Date.now(),
        _userId: userId,
        _tenantId: tenantId,
        _branchId: branchId
      }),
      // Transform state on load
      (outboundState: any) => {
        const TTL = 24 * 60 * 60 * 1000; // 24 hours
        
        // Check TTL
        if (outboundState._persistedAt && Date.now() - outboundState._persistedAt > TTL) {
          return undefined; // Expired
        }
        
        // Verify scope matches current user
        if (outboundState._userId !== userId ||
            outboundState._tenantId !== tenantId ||
            outboundState._branchId !== branchId) {
          return undefined; // Wrong user/tenant/branch
        }
        
        return outboundState;
      }
    )
  ]
});
```

**12.3 beforeunload Warning**
```typescript
// client/src/pages/POS.tsx
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export function POSPage() {
  const cartItems = useAppSelector(state => state.cart.items);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cartItems.length > 0) {
        e.preventDefault();
        e.returnValue = 'لديك عناصر في السلة. هل تريد المغادرة؟';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cartItems.length]);
  
  // ... rest of component
}
```

**12.4 Clear Cart After Success**
```typescript
// client/src/components/pos/PaymentModal.tsx
const handleComplete = async () => {
  try {
    // ... existing order creation and completion logic
    
    // Clear cart from Redux AND localStorage
    dispatch(clearCart());
    
    // Explicitly clear from localStorage (redundant but safe)
    const userId = user?.id;
    const tenantId = user?.tenantId;
    const branchId = selectedBranch?.id;
    if (userId && tenantId && branchId) {
      localStorage.removeItem(`persist:cart:${tenantId}:${branchId}:${userId}`);
    }
    
    onOrderComplete();
  } catch (error) {
    // ... error handling
  }
};
```

### 13. Auto-Close Shift Cash Register Fix

**Purpose:** Record cash register transaction when auto-closing shifts

**Location:** `src/KasserPro.Infrastructure/Services/AutoCloseShiftBackgroundService.cs`

**Algorithm:**
```
1. Identify shifts that exceed 12-hour threshold
2. For each shift to auto-close:
   a. Calculate closing balance
   b. Call CashRegisterService.RecordTransactionAsync
   c. Create transaction with type "ShiftClose"
   d. Update shift record with closing data
   e. Save changes
3. Log all auto-close operations
```

**Implementation:**
```csharp
public class AutoCloseShiftBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AutoCloseShiftBackgroundService> _logger;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var cashRegisterService = scope.ServiceProvider.GetRequiredService<ICashRegisterService>();
                
                var cutoffTime = DateTime.UtcNow.AddHours(-12);
                var openShifts = await unitOfWork.Shifts.FindAsync(s => 
                    !s.IsClosed && 
                    s.OpenedAt < cutoffTime);
                
                foreach (var shift in openShifts)
                {
                    _logger.LogWarning("Auto-closing shift {ShiftId} for user {UserId}", 
                        shift.Id, shift.UserId);
                    
                    // Calculate closing balance from cash register
                    var transactions = await unitOfWork.CashRegisterTransactions.FindAsync(t =>
                        t.ShiftId == shift.Id);
                    
                    var totalCash = transactions.Sum(t => t.Type switch
                    {
                        TransactionType.Sales => t.Amount,
                        TransactionType.Deposit => t.Amount,
                        TransactionType.Refund => -t.Amount,
                        TransactionType.Withdrawal => -t.Amount,
                        TransactionType.Expense => -t.Amount,
                        _ => 0
                    });
                    
                    var closingBalance = shift.OpeningBalance + totalCash;
                    
                    // Record cash register closing transaction (FIX)
                    await cashRegisterService.RecordTransactionAsync(new RecordTransactionRequest
                    {
                        ShiftId = shift.Id,
                        Type = TransactionType.ShiftClose,
                        Amount = closingBalance,
                        Description = "إغلاق تلقائي للوردية",
                        TenantId = shift.TenantId,
                        BranchId = shift.BranchId
                    });
                    
                    // Update shift record
                    shift.ClosingBalance = closingBalance;
                    shift.Difference = 0; // Auto-close assumes no discrepancy
                    shift.IsClosed = true;
                    shift.ClosedAt = DateTime.UtcNow;
                    shift.Notes = $"تم الإغلاق التلقائي في {DateTime.Now:yyyy-MM-dd HH:mm}";
                    
                    await unitOfWork.SaveChangesAsync();
                    
                    _logger.LogInformation("Shift {ShiftId} auto-closed. Closing balance: {Balance}", 
                        shift.Id, closingBalance);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in auto-close shift service");
            }
        }
    }
}
```


## Data Models

### SecurityStamp Migration

```csharp
public partial class AddSecurityStamp : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "SecurityStamp",
            table: "Users",
            type: "TEXT",
            maxLength: 64,
            nullable: false,
            defaultValue: "");
        
        // Initialize existing users with unique stamps
        migrationBuilder.Sql(@"
            UPDATE Users 
            SET SecurityStamp = lower(hex(randomblob(16)))
            WHERE SecurityStamp = '';
        ");
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "SecurityStamp",
            table: "Users");
    }
}
```

### Backup DTOs

```csharp
public class BackupRequest
{
    public string? Reason { get; set; }
}

public class BackupResponse
{
    public bool Success { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime Timestamp { get; set; }
}

public class RestoreRequest
{
    [Required]
    public string BackupFileName { get; set; } = string.Empty;
}

public class RestoreResponse
{
    public bool Success { get; set; }
    public string? ErrorCode { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class BackupListResponse
{
    public List<BackupInfo> Backups { get; set; } = new();
}

public class BackupInfo
{
    public string FileName { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Type { get; set; } = string.Empty; // "daily", "pre-migration", "manual"
}
```

### Frontend Cart State

```typescript
// client/src/types/cart.ts
export interface CartState {
  items: CartItem[];
  customerId?: number;
  _persistedAt?: number;
  _userId?: number;
  _tenantId?: number;
  _branchId?: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number; // Price snapshot at time of adding
  quantity: number;
  taxRate: number;
  notes?: string;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Maintenance mode round-trip**: Criteria 4.5 and 4.7 both test enable/disable cycles - combined into Property 4
2. **Backup retention**: Criteria 8.6 and 8.7 state the same requirement differently - combined into one example test
3. **Restore and maintenance mode**: Criteria 4.6, 4.7, 9.2, and 9.9 overlap - consolidated into Property 4
4. **Logging properties**: Multiple criteria test logging with similar patterns - grouped by category

### Security Properties

**Property 1: Branch Access Validation**
*For any* authenticated request with an X-Branch-Id header, if the header value does not match the user's assigned branch, the system should reject the request with error code BRANCH_ACCESS_DENIED and log the violation.
**Validates: Requirements 1.1, 1.2, 1.5**

**Property 2: Role Assignment Restrictions**
*For any* user registration request, if the assigner has Admin role and the requested role is SystemOwner, the system should reject the request with error code INSUFFICIENT_PRIVILEGES and log the attempt.
**Validates: Requirements 2.1, 2.3, 2.5**

**Property 3: SecurityStamp Invalidation**
*For any* user, when their role, branch, password, or active status changes, the system should update their SecurityStamp, and any JWT with the old stamp should be rejected with error code TOKEN_INVALIDATED.
**Validates: Requirements 3.2, 3.3, 3.6, 3.7**

### Infrastructure Properties

**Property 4: Maintenance Mode Round-Trip**
*For any* maintenance mode state change, enabling maintenance mode (via file flag or restore operation) should block all non-health-check requests with HTTP 503, and disabling maintenance mode (via file deletion or successful restore completion) should restore normal request processing.
**Validates: Requirements 4.2, 4.5, 4.7, 4.8**

**Property 5: SQLite Error Mapping**
*For any* SQLite exception, the system should map the error code to an appropriate HTTP status (503 for BUSY/LOCKED, 500 for CORRUPT, 507 for FULL) with an Arabic error message, include a correlation ID in the response, and log the full exception details.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

**Property 6: Log Entry Format**
*For any* log entry, the system should include timestamp, log level, message, and exception details (if present), and for request-scoped logs, should include the correlation ID.
**Validates: Requirements 6.3, 6.6**

**Property 7: Database Error Logging**
*For any* database error, the system should log the error with the SQLite error code, and for authentication failures, should log the user email and IP address.
**Validates: Requirements 6.7, 6.8**

### Backup and Restore Properties

**Property 8: Backup Filename Format**
*For any* backup operation, the system should name the backup file with format "kasserpro-backup-YYYYMMDD-HHmmss.db" for regular backups or "kasserpro-pre-migration-YYYYMMDD-HHmmss.db" for pre-migration backups.
**Validates: Requirements 8.5, 10.3**

**Property 9: Backup Integrity Verification**
*For any* backup operation, the system should run PRAGMA integrity_check on the backup file after creation, and if the check fails, should delete the corrupt backup and log an error.
**Validates: Requirements 8.8, 8.9**

**Property 10: Backup Response Structure**
*For any* successful backup operation, the system should return a response containing the backup file path, file name, size in bytes, and timestamp.
**Validates: Requirements 8.11**

**Property 11: Backup Operation Logging**
*For any* backup operation (daily, manual, or pre-migration), the system should log the operation with timestamp, file size, and success status.
**Validates: Requirements 8.12, 10.8**

**Property 12: Restore Validation**
*For any* restore operation, the system should validate that the backup file exists and run PRAGMA integrity_check before proceeding, and if either check fails, should reject the restore with an appropriate error code.
**Validates: Requirements 9.3, 9.4**

**Property 13: Restore Operation Logging**
*For any* restore operation, the system should log the operation with timestamp, backup file name, and success status.
**Validates: Requirements 9.11**

**Property 14: Pre-Migration Backup Filename**
*For any* pre-migration backup, the system should include the migration count in the log entry and name the file with the pre-migration prefix.
**Validates: Requirements 10.8**

### Cart Persistence Properties

**Property 15: Cart Storage Key Scoping**
*For any* cart persistence operation, the system should scope the localStorage key by tenant ID, branch ID, and user ID in the format "cart:{tenantId}:{branchId}:{userId}".
**Validates: Requirements 11.2**

**Property 16: Cart Round-Trip with Price Snapshots**
*For any* cart with items, persisting the cart to localStorage and then restoring it should preserve all items with their original unit price snapshots, even if current product prices have changed.
**Validates: Requirements 11.3, 11.6, 11.7**

**Property 17: Cart Price Snapshot Preservation**
*For any* cart item, the persisted unit price should be the price at the time the item was added to the cart, not the current product price.
**Validates: Requirements 11.6, 11.7**

### Operational Properties

**Property 18: Auto-Close Cash Register Consistency**
*For any* shift that is auto-closed by the background service, the cash register balance after the closing transaction should equal the shift's closing balance.
**Validates: Requirements 12.5**


## Error Handling

### Error Codes

| Error Code | HTTP Status | Arabic Message | English Description |
|------------|-------------|----------------|---------------------|
| BRANCH_ACCESS_DENIED | 403 | ليس لديك صلاحية الوصول لهذا الفرع | User attempted to access unauthorized branch |
| INSUFFICIENT_PRIVILEGES | 403 | ليس لديك صلاحية إنشاء حساب مالك النظام | Admin attempted to create SystemOwner account |
| TOKEN_INVALIDATED | 401 | انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى | JWT stamp mismatch (permissions changed) |
| SQLITE_BUSY | 503 | النظام مشغول، حاول مرة أخرى بعد لحظات | Database locked by concurrent operation |
| SQLITE_LOCKED | 503 | النظام مشغول، انتظر لحظة | Database table locked |
| SQLITE_CORRUPT | 500 | خطأ في قاعدة البيانات. اتصل بالدعم الفني | Database file corruption detected |
| SQLITE_FULL | 507 | القرص ممتلئ! أوقف العمل واتصل بالدعم | Disk full, cannot write |
| DISK_ERROR | 507 | مشكلة في القرص. تحقق من المساحة المتوفرة | IO error during database operation |
| BACKUP_NOT_FOUND | 404 | ملف النسخة الاحتياطية غير موجود | Backup file does not exist |
| BACKUP_CORRUPT | 400 | ملف النسخة الاحتياطية تالف | Backup file failed integrity check |
| RESTORE_FAILED | 500 | فشلت عملية الاستعادة. النظام في وضع الصيانة | Restore operation failed |
| MAINTENANCE_MODE | 503 | النظام قيد الصيانة. يرجى المحاولة لاحقاً | System in maintenance mode |

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "errorCode": "ERROR_CODE",
  "message": "Arabic error message",
  "correlationId": "uuid-v4",
  "retryAfter": 60  // Optional: seconds to wait before retry
}
```

### Retry Strategy

| Error Code | Retry Recommended | Strategy |
|------------|-------------------|----------|
| SQLITE_BUSY | Yes | Exponential backoff, max 3 retries |
| SQLITE_LOCKED | Yes | Exponential backoff, max 3 retries |
| SQLITE_FULL | No | User intervention required |
| SQLITE_CORRUPT | No | Restore from backup required |
| MAINTENANCE_MODE | Yes | Fixed delay (retryAfter seconds) |
| TOKEN_INVALIDATED | No | Re-authentication required |
| BRANCH_ACCESS_DENIED | No | Authorization issue |

### Exception Handling Flow

```
Request → Middleware Pipeline
  ↓
Try: Business Logic
  ↓
Catch: SqliteException
  → Map error code to HTTP status + message
  → Log with correlation ID
  → Return error response
  ↓
Catch: IOException
  → Map to DISK_ERROR
  → Log critical error
  → Return 507 response
  ↓
Catch: DbUpdateConcurrencyException
  → Return 409 with retry message
  ↓
Catch: Exception (unhandled)
  → Log error with correlation ID
  → Return generic 500 response
```

### Logging Levels

| Scenario | Log Level | Includes |
|----------|-----------|----------|
| Branch access violation | Warning | UserId, BranchId, CorrelationId |
| Role escalation attempt | Warning | AssignerId, TargetRole, CorrelationId |
| Token invalidated | Information | UserId, Reason |
| SQLite error | Error | ErrorCode, Message, CorrelationId, Exception |
| Disk full | Critical | Available space, CorrelationId, Exception |
| Backup created | Information | FileName, SizeBytes, Duration |
| Backup failed | Error | FileName, Exception |
| Restore started | Warning | BackupFileName, Reason |
| Restore completed | Information | BackupFileName, Duration |
| Restore failed | Error | BackupFileName, Exception |
| Maintenance mode enabled | Warning | Reason |
| Maintenance mode disabled | Information | Duration |
| Pre-migration backup | Warning | MigrationCount, FileName |
| Auto-close shift | Warning | ShiftId, UserId, ClosingBalance |


## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary

### Unit Testing Focus

Unit tests should focus on:
- Specific security scenarios (Admin creating SystemOwner)
- Configuration validation (SQLite PRAGMAs set correctly)
- Error mapping examples (each SQLite error code)
- File operations (backup/restore file handling)
- Middleware pipeline order
- Edge cases (missing headers, corrupt files, disk full)

Avoid writing too many unit tests for scenarios that property tests can cover with randomization.

### Property-Based Testing Configuration

**Library**: Use existing test framework patterns in `src/KasserPro.Tests/`
- For .NET: Use FsCheck or similar property-based testing library
- Minimum 100 iterations per property test
- Each property test must reference its design document property
- Tag format: **Feature: p0-security-hardening, Property {number}: {property_text}**

**Property Test Examples**:

```csharp
// Property 1: Branch Access Validation
[Property(MinTest = 100)]
[Trait("Feature", "p0-security-hardening")]
[Trait("Property", "1: Branch Access Validation")]
public Property BranchAccessValidation_RejectsUnauthorizedBranches()
{
    return Prop.ForAll(
        Arb.Generate<User>(),
        Arb.Generate<int>(), // unauthorized branchId
        (user, unauthorizedBranchId) =>
        {
            // Arrange: user with branchId = 1, request with X-Branch-Id = unauthorizedBranchId (≠ 1)
            Assume.That(user.BranchId != unauthorizedBranchId);
            
            // Act: Make request with X-Branch-Id header
            var response = MakeRequestWithBranchHeader(user, unauthorizedBranchId);
            
            // Assert
            return response.StatusCode == 403 &&
                   response.ErrorCode == "BRANCH_ACCESS_DENIED" &&
                   LogContainsViolation(user.Id, unauthorizedBranchId);
        });
}

// Property 3: SecurityStamp Invalidation
[Property(MinTest = 100)]
[Trait("Feature", "p0-security-hardening")]
[Trait("Property", "3: SecurityStamp Invalidation")]
public Property SecurityStamp_InvalidatesOldTokens()
{
    return Prop.ForAll(
        Arb.Generate<User>(),
        Arb.Generate<UserRole>(),
        (user, newRole) =>
        {
            // Arrange: Generate JWT with current stamp
            var oldToken = GenerateToken(user);
            var oldStamp = user.SecurityStamp;
            
            // Act: Change user role (triggers stamp update)
            user.Role = newRole;
            user.UpdateSecurityStamp();
            
            // Assert: Old token should be rejected
            var response = MakeRequestWithToken(oldToken);
            return response.StatusCode == 401 &&
                   response.ErrorCode == "TOKEN_INVALIDATED" &&
                   user.SecurityStamp != oldStamp;
        });
}

// Property 16: Cart Round-Trip with Price Snapshots
[Property(MinTest = 100)]
[Trait("Feature", "p0-security-hardening")]
[Trait("Property", "16: Cart Round-Trip with Price Snapshots")]
public Property CartPersistence_PreservesPriceSnapshots()
{
    return Prop.ForAll(
        Arb.Generate<List<CartItem>>(),
        Arb.Generate<decimal>(), // new price
        (originalCart, newPrice) =>
        {
            Assume.That(originalCart.Any());
            var originalPrice = originalCart[0].UnitPrice;
            Assume.That(newPrice != originalPrice);
            
            // Act: Persist cart, change product price, restore cart
            PersistCart(originalCart);
            UpdateProductPrice(originalCart[0].ProductId, newPrice);
            var restoredCart = RestoreCart();
            
            // Assert: Restored cart uses original price, not new price
            return restoredCart[0].UnitPrice == originalPrice &&
                   restoredCart[0].UnitPrice != newPrice;
        });
}
```

### Integration Tests

**Backup and Restore Integration Test**:
```csharp
[Fact]
public async Task BackupAndRestore_PreservesDataIntegrity()
{
    // Arrange: Create test data
    var order = await CreateTestOrder();
    var originalOrderCount = await _context.Orders.CountAsync();
    
    // Act: Create backup
    var backupResult = await _backupService.CreateBackupAsync("test");
    Assert.True(backupResult.Success);
    
    // Add more data after backup
    await CreateTestOrder();
    var countAfterBackup = await _context.Orders.CountAsync();
    Assert.Equal(originalOrderCount + 1, countAfterBackup);
    
    // Restore from backup
    var restoreResult = await _restoreService.RestoreFromBackupAsync(backupResult.FileName);
    Assert.True(restoreResult.Success);
    
    // Assert: Data matches backup state
    var countAfterRestore = await _context.Orders.CountAsync();
    Assert.Equal(originalOrderCount, countAfterRestore);
}
```

**Maintenance Mode Integration Test**:
```csharp
[Fact]
public async Task MaintenanceMode_BlocksRequestsDuringRestore()
{
    // Arrange: System in normal mode
    var normalResponse = await _client.GetAsync("/api/products");
    Assert.Equal(HttpStatusCode.OK, normalResponse.StatusCode);
    
    // Act: Enable maintenance mode
    _maintenanceMode.Enable("test");
    
    // Assert: Requests blocked
    var blockedResponse = await _client.GetAsync("/api/products");
    Assert.Equal(HttpStatusCode.ServiceUnavailable, blockedResponse.StatusCode);
    
    // Health check still works
    var healthResponse = await _client.GetAsync("/health");
    Assert.Equal(HttpStatusCode.OK, healthResponse.StatusCode);
    
    // Cleanup: Disable maintenance mode
    _maintenanceMode.Disable();
    var restoredResponse = await _client.GetAsync("/api/products");
    Assert.Equal(HttpStatusCode.OK, restoredResponse.StatusCode);
}
```

**SecurityStamp Integration Test**:
```csharp
[Fact]
public async Task SecurityStamp_InvalidatesTokenOnRoleChange()
{
    // Arrange: Login as cashier
    var loginResponse = await _authService.LoginAsync(new LoginRequest
    {
        Email = "cashier@test.com",
        Password = "password"
    });
    var token = loginResponse.Data.AccessToken;
    
    // Verify token works
    _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    var response1 = await _client.GetAsync("/api/products");
    Assert.Equal(HttpStatusCode.OK, response1.StatusCode);
    
    // Act: Admin changes cashier's role
    var user = await _context.Users.FirstAsync(u => u.Email == "cashier@test.com");
    user.Role = UserRole.Admin;
    user.UpdateSecurityStamp();
    await _context.SaveChangesAsync();
    
    // Assert: Old token rejected
    var response2 = await _client.GetAsync("/api/products");
    Assert.Equal(HttpStatusCode.Unauthorized, response2.StatusCode);
}
```

### Frontend Testing

**Cart Persistence E2E Test**:
```typescript
// client/e2e/cart-persistence.spec.ts
test('cart survives browser refresh', async ({ page }) => {
  await page.goto('/pos');
  
  // Add items to cart
  await page.click('[data-testid="product-1"]');
  await page.click('[data-testid="product-2"]');
  
  // Verify cart has items
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
  
  // Refresh page
  await page.reload();
  
  // Verify cart restored
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
});

test('beforeunload warning shown when cart has items', async ({ page }) => {
  await page.goto('/pos');
  
  // Add item to cart
  await page.click('[data-testid="product-1"]');
  
  // Attempt to close tab (will trigger beforeunload)
  page.on('dialog', dialog => {
    expect(dialog.message()).toContain('لديك عناصر في السلة');
    dialog.dismiss();
  });
  
  await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeunload'));
  });
});
```

### Test Coverage Goals

| Component | Unit Test Coverage | Integration Test Coverage |
|-----------|-------------------|---------------------------|
| BranchAccessMiddleware | 90%+ | Included in API tests |
| SecurityStamp validation | 90%+ | Full flow tested |
| Role escalation guard | 100% | Included in auth tests |
| MaintenanceModeMiddleware | 90%+ | Full flow tested |
| SQLite configuration | 80%+ | Verified on startup |
| Exception mapping | 100% | Each error code tested |
| BackupService | 90%+ | Full flow tested |
| RestoreService | 90%+ | Full flow tested |
| Cart persistence | 80%+ | E2E tested |
| Auto-close fix | 90%+ | Background service tested |

