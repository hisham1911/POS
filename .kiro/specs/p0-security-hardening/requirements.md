# Requirements Document: P0 Security Hardening

## Introduction

This document specifies the critical security fixes and production hardening requirements for KasserPro, a local-first POS system. Two comprehensive architectural reviews identified 7 critical blockers that must be resolved before the system can be deployed to paying customers. These requirements focus on immediate security vulnerabilities, database durability, crash recovery, and operational safety for a Windows desktop deployment serving 1-3 concurrent users with SQLite.

The system currently has solid financial transaction logic but lacks the infrastructure for real-world deployment where power outages, browser crashes, concurrent operations, and disk failures are certainties, not edge cases.

## Glossary

- **System**: The KasserPro POS application (ASP.NET Core backend + React frontend)
- **Database**: The SQLite database file (kasserpro.db)
- **Operator**: The non-technical business owner or cashier using the system
- **Migration**: An EF Core database schema change applied automatically on startup
- **WAL**: Write-Ahead Logging, a SQLite journal mode for better concurrency
- **JWT**: JSON Web Token used for authentication
- **SecurityStamp**: A version hash that invalidates JWTs when user permissions change
- **Maintenance_Mode**: A state where the system blocks incoming requests during critical operations
- **Cart**: The in-memory collection of items being scanned before payment
- **Shift**: A work session with opening/closing cash register balances
- **Cash_Register**: The financial ledger tracking all cash movements
- **Backup**: A timestamped copy of the database file
- **Restore**: Replacing the current database with a backup copy
- **X-Branch-Id**: An HTTP header that specifies which branch the request operates on
- **Idempotency_Key**: A unique identifier to prevent duplicate request processing

## Requirements

### Requirement 1: X-Branch-Id Header Validation

**User Story:** As a system administrator, I want branch access to be validated server-side, so that cashiers cannot operate on branches they don't have access to.

#### Acceptance Criteria

1. WHEN a request includes an X-Branch-Id header, THE System SHALL validate that the authenticated user has access to that branch
2. IF the user does not have access to the specified branch, THEN THE System SHALL return an error with code BRANCH_ACCESS_DENIED
3. WHEN no X-Branch-Id header is provided, THE System SHALL use the user's default branch from their JWT claims
4. THE System SHALL validate branch access before any business logic executes
5. THE System SHALL log all branch access violations with user ID, requested branch, and timestamp

### Requirement 2: Role Escalation Prevention

**User Story:** As a system owner, I want role assignment to be restricted by the assigner's role, so that administrators cannot create accounts with higher privileges than their own.

#### Acceptance Criteria

1. WHEN an Admin attempts to create a SystemOwner account, THE System SHALL reject the request with error code INSUFFICIENT_PRIVILEGES
2. WHEN a SystemOwner creates any user account, THE System SHALL allow any role assignment
3. WHEN an Admin creates a user account, THE System SHALL only allow Admin or Cashier roles
4. THE System SHALL validate role assignment permissions before creating the user record
5. THE System SHALL log all role escalation attempts with assigner ID, target role, and timestamp

### Requirement 3: SecurityStamp Implementation

**User Story:** As a system administrator, I want user permission changes to take effect immediately, so that revoked access cannot be used with stale JWTs.

#### Acceptance Criteria

1. THE User entity SHALL include a SecurityStamp field
2. WHEN a user's role changes, THE System SHALL update their SecurityStamp
3. WHEN a user's branch assignment changes, THE System SHALL update their SecurityStamp
4. WHEN a user is deactivated, THE System SHALL update their SecurityStamp
5. WHEN a user's password changes, THE System SHALL update their SecurityStamp
6. WHEN validating a JWT, THE System SHALL compare the token's stamp claim against the user's current SecurityStamp
7. IF the stamps do not match, THEN THE System SHALL reject the request with error code TOKEN_INVALIDATED
8. THE System SHALL include the SecurityStamp in JWT claims as "security_stamp"

### Requirement 4: Maintenance Mode Implementation

**User Story:** As a system administrator, I want to block incoming requests during critical operations, so that database restore and migration operations complete safely.

#### Acceptance Criteria

1. THE System SHALL support a maintenance mode flag
2. WHEN maintenance mode is enabled, THE System SHALL reject all incoming API requests except health checks
3. WHEN maintenance mode is active, THE System SHALL return HTTP 503 with message "النظام قيد الصيانة"
4. THE System SHALL allow enabling maintenance mode via a file flag (maintenance.lock)
5. THE System SHALL allow disabling maintenance mode by removing the file flag
6. WHEN a restore operation starts, THE System SHALL automatically enable maintenance mode
7. WHEN a restore operation completes successfully, THE System SHALL automatically disable maintenance mode
8. THE System SHALL log all maintenance mode state changes with timestamp and reason

### Requirement 5: SQLite Production Configuration

**User Story:** As a system operator, I want the database to handle concurrent operations reliably, so that multiple cashiers can work simultaneously without errors.

#### Acceptance Criteria

1. THE System SHALL configure SQLite with journal_mode=WAL
2. THE System SHALL configure SQLite with busy_timeout=5000 milliseconds
3. THE System SHALL configure SQLite with synchronous=NORMAL
4. THE System SHALL configure SQLite with foreign_keys=ON
5. THE System SHALL apply these configurations on the first database connection
6. THE System SHALL verify WAL mode is active on startup
7. IF WAL mode activation fails, THEN THE System SHALL log an error and continue with default journal mode

### Requirement 6: File-Based Logging

**User Story:** As a support engineer, I want persistent log files, so that I can diagnose issues after the system restarts.

#### Acceptance Criteria

1. THE System SHALL write logs to rolling daily files in a logs directory
2. THE System SHALL retain log files for 30 days
3. THE System SHALL include timestamp, log level, message, and exception details in each log entry
4. THE System SHALL write financial audit logs to a separate file sink (financial-audit-.log)
5. THE System SHALL retain financial audit logs for 90 days
6. THE System SHALL include correlation IDs in log entries for request tracing
7. THE System SHALL log all database errors with SQLite error codes
8. THE System SHALL log all authentication failures with user email and IP address

### Requirement 7: SQLite Exception Mapping

**User Story:** As a cashier, I want clear error messages when database problems occur, so that I know what action to take.

#### Acceptance Criteria

1. WHEN a SQLITE_BUSY error occurs, THE System SHALL return HTTP 503 with message "النظام مشغول، حاول مرة أخرى بعد لحظات"
2. WHEN a SQLITE_LOCKED error occurs, THE System SHALL return HTTP 503 with message "النظام مشغول، انتظر لحظة"
3. WHEN a SQLITE_CORRUPT error occurs, THE System SHALL return HTTP 500 with message "خطأ في قاعدة البيانات. اتصل بالدعم الفني"
4. WHEN a SQLITE_FULL error occurs, THE System SHALL return HTTP 507 with message "القرص ممتلئ! أوقف العمل واتصل بالدعم"
5. WHEN an IOException occurs during database operations, THE System SHALL return HTTP 507 with message "مشكلة في القرص. تحقق من المساحة المتوفرة"
6. THE System SHALL include a correlation ID in all error responses
7. THE System SHALL log the full exception details for all database errors

### Requirement 8: Backup System

**User Story:** As a business owner, I want automatic daily backups, so that I can recover from data loss or corruption.

#### Acceptance Criteria

1. THE System SHALL create a backup using the SQLite backup API, not file copy
2. THE System SHALL create backups while the database is in use (hot backup)
3. THE System SHALL create automatic daily backups at 2:00 AM local time
4. THE System SHALL store backups in a dedicated backups directory
5. THE System SHALL name backups with format "kasserpro-backup-YYYYMMDD-HHmmss.db"
6. THE System SHALL retain the last 14 daily backups
7. THE System SHALL delete backups older than 14 days automatically
8. THE System SHALL run PRAGMA integrity_check on the backup file after creation
9. IF integrity check fails, THEN THE System SHALL delete the corrupt backup and log an error
10. THE System SHALL expose a manual backup endpoint at POST /api/admin/backup
11. THE System SHALL return the backup file path and size in the backup response
12. THE System SHALL log all backup operations with timestamp, file size, and success status

### Requirement 9: Restore System

**User Story:** As a system administrator, I want to restore from a backup, so that I can recover from database corruption or failed migrations.

#### Acceptance Criteria

1. THE System SHALL expose a restore endpoint at POST /api/admin/restore
2. WHEN a restore operation starts, THE System SHALL enable maintenance mode
3. THE System SHALL validate that the backup file exists before starting restore
4. THE System SHALL run PRAGMA integrity_check on the backup file before restore
5. IF the backup file is corrupt, THEN THE System SHALL reject the restore with error code BACKUP_CORRUPT
6. THE System SHALL close all database connections before restore
7. THE System SHALL replace the current database file with the backup file
8. THE System SHALL run migrations on the restored database if needed
9. IF restore succeeds, THEN THE System SHALL disable maintenance mode
10. IF restore fails, THEN THE System SHALL keep maintenance mode enabled and log the error
11. THE System SHALL log all restore operations with timestamp, backup file, and success status

### Requirement 10: Pre-Migration Automatic Backup

**User Story:** As a system operator, I want automatic backups before schema changes, so that I can rollback if a migration fails.

#### Acceptance Criteria

1. WHEN the system starts, THE System SHALL check for pending migrations
2. IF pending migrations exist, THEN THE System SHALL create a pre-migration backup
3. THE System SHALL name pre-migration backups with format "kasserpro-pre-migration-YYYYMMDD-HHmmss.db"
4. THE System SHALL store pre-migration backups in the backups directory
5. THE System SHALL retain pre-migration backups indefinitely (not subject to 14-day retention)
6. THE System SHALL run migrations only after the pre-migration backup succeeds
7. IF the pre-migration backup fails, THEN THE System SHALL abort startup and log the error
8. THE System SHALL log all pre-migration backup operations with migration count and file size

### Requirement 11: Cart Persistence

**User Story:** As a cashier, I want my scanned items to survive browser refresh, so that I don't lose work if the browser crashes.

#### Acceptance Criteria

1. THE System SHALL persist the cart state to localStorage
2. THE System SHALL scope the cart key by tenant ID, branch ID, and user ID
3. THE System SHALL restore the cart from localStorage on application mount
4. THE System SHALL clear the cart from localStorage after successful order completion
5. THE System SHALL set a 24-hour TTL on persisted cart data
6. THE System SHALL include unit price snapshots in the persisted cart
7. WHEN restoring a cart, THE System SHALL use the persisted prices, not current prices
8. THE System SHALL show a beforeunload warning when the cart contains items
9. THE System SHALL clear the beforeunload warning after the cart is emptied

### Requirement 12: Auto-Close Shift Cash Register Fix

**User Story:** As a business owner, I want shift auto-close to record cash register transactions, so that my cash register balance matches shift records.

#### Acceptance Criteria

1. WHEN the auto-close background service closes a shift, THE System SHALL call CashRegisterService.RecordTransactionAsync
2. THE System SHALL record a closing transaction with type "ShiftClose"
3. THE System SHALL include the shift's closing balance in the transaction amount
4. THE System SHALL link the cash register transaction to the shift via ShiftId
5. THE System SHALL ensure the cash register balance matches the shift's closing balance after auto-close
