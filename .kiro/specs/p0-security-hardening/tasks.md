# Implementation Plan: P0 Security Hardening

## Overview

This implementation plan addresses 7 critical security blockers and production hardening gaps identified in architectural reviews. The plan is organized into three phases: Phase 0 (Critical Security Hotfixes), Phase 1 (Production Hardening), and Phase 2 (Operational Fixes). Each task builds incrementally and includes specific requirements references for traceability.

## Tasks

### Phase 0: Critical Security Hotfixes

- [ ] 1. Implement SecurityStamp infrastructure
  - [ ] 1.1 Create AddSecurityStamp migration
    - Add SecurityStamp column to Users table (TEXT, maxLength: 64, not null)
    - Initialize existing users with unique stamps using SQL
    - _Requirements: 3.1_
  
  - [ ] 1.2 Update User entity with SecurityStamp property
    - Add SecurityStamp property with default value
    - Add UpdateSecurityStamp() method that generates new GUID
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 1.3 Update AuthService token generation
    - Add "security_stamp" claim to JWT
    - Include user.SecurityStamp in claims list
    - _Requirements: 3.8_
  
  - [ ] 1.4 Implement JWT validation with stamp check
    - Update OnTokenValidated event in Program.cs
    - Compare token stamp with user's current SecurityStamp
    - Fail validation if stamps don't match
    - Return TOKEN_INVALIDATED error code
    - _Requirements: 3.6, 3.7_
  
  - [ ]* 1.5 Write property test for SecurityStamp invalidation
    - **Property 3: SecurityStamp Invalidation**
    - **Validates: Requirements 3.2, 3.3, 3.6, 3.7**
  
  - [ ]* 1.6 Write unit tests for stamp update triggers
    - Test role change triggers stamp update
    - Test branch change triggers stamp update
    - Test deactivation triggers stamp update
    - Test password change triggers stamp update
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 2. Implement role escalation prevention
  - [ ] 2.1 Add role validation to AuthService.RegisterAsync
    - Get current user's role from ICurrentUserService
    - Parse requested role from RegisterRequest
    - Reject if Admin attempts to create SystemOwner
    - Reject if Admin attempts to create non-Admin/Cashier roles
    - Return INSUFFICIENT_PRIVILEGES error code
    - Log all escalation attempts
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [ ]* 2.2 Write property test for role assignment restrictions
    - **Property 2: Role Assignment Restrictions**
    - **Validates: Requirements 2.1, 2.3, 2.5**
  
  - [ ]* 2.3 Write unit tests for role escalation scenarios
    - Test Admin cannot create SystemOwner
    - Test SystemOwner can create any role
    - Test Admin can create Admin and Cashier
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Implement branch access validation
  - [ ] 3.1 Create BranchAccessMiddleware
    - Extract X-Branch-Id from request headers
    - Skip validation for anonymous requests
    - If header present, validate against user's BranchId
    - Return 403 with BRANCH_ACCESS_DENIED if mismatch
    - Log all violations with userId, branchId, timestamp
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ] 3.2 Register BranchAccessMiddleware in Program.cs
    - Add after Authentication middleware
    - Add before Authorization middleware
    - _Requirements: 1.4_
  
  - [ ]* 3.3 Write property test for branch access validation
    - **Property 1: Branch Access Validation**
    - **Validates: Requirements 1.1, 1.2, 1.5**
  
  - [ ]* 3.4 Write unit tests for branch access scenarios
    - Test authorized branch access succeeds
    - Test unauthorized branch access rejected
    - Test missing header uses JWT branch
    - Test anonymous requests skip validation
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Implement maintenance mode
  - [ ] 4.1 Create MaintenanceModeService
    - Implement Enable(reason) method (creates maintenance.lock file)
    - Implement Disable() method (deletes maintenance.lock file)
    - Implement IsEnabled() method (checks file existence)
    - Log all state changes with timestamp and reason
    - _Requirements: 4.1, 4.8_
  
  - [ ] 4.2 Create MaintenanceModeMiddleware
    - Check for maintenance.lock file
    - Allow /health endpoint
    - Reject all other requests with HTTP 503
    - Return Arabic message "النظام قيد الصيانة"
    - Include retryAfter: 60 in response
    - _Requirements: 4.2, 4.3_
  
  - [ ] 4.3 Register MaintenanceModeMiddleware in Program.cs
    - Add as first middleware in pipeline
    - Register MaintenanceModeService as singleton
    - _Requirements: 4.1_
  
  - [ ]* 4.4 Write property test for maintenance mode round-trip
    - **Property 4: Maintenance Mode Round-Trip**
    - **Validates: Requirements 4.2, 4.5, 4.7, 4.8**
  
  - [ ]* 4.5 Write unit tests for maintenance mode
    - Test file flag enables maintenance mode
    - Test file deletion disables maintenance mode
    - Test health check allowed during maintenance
    - Test API requests blocked during maintenance
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Checkpoint - Phase 0 complete
  - Ensure all tests pass, ask the user if questions arise.


### Phase 1: Production Hardening

- [ ] 6. Implement SQLite production configuration
  - [ ] 6.1 Create SqliteConfigurationService
    - Implement ConfigureAsync method
    - Execute PRAGMA journal_mode=WAL
    - Execute PRAGMA busy_timeout=5000
    - Execute PRAGMA synchronous=NORMAL
    - Execute PRAGMA foreign_keys=ON
    - Verify WAL mode is active
    - Log configuration status
    - Log warning if WAL activation fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7_
  
  - [ ] 6.2 Apply SQLite configuration on startup
    - Register SqliteConfigurationService in DI
    - Call ConfigureAsync after app.Build() in Program.cs
    - Use scoped DbContext to get connection
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 6.3 Write unit tests for SQLite configuration
    - Test WAL mode is set
    - Test busy_timeout is 5000
    - Test synchronous is NORMAL
    - Test foreign_keys is ON
    - Test warning logged if WAL fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7_

- [ ] 7. Implement file-based logging with Serilog
  - [ ] 7.1 Add Serilog NuGet packages
    - Add Serilog.AspNetCore
    - Add Serilog.Sinks.File
    - _Requirements: 6.1_
  
  - [ ] 7.2 Configure Serilog in Program.cs
    - Create logs directory
    - Configure console sink
    - Configure file sink with rolling daily files
    - Set 30-day retention for application logs
    - Configure separate financial-audit sink
    - Set 90-day retention for financial audit logs
    - Filter financial logs by AuditType property
    - Add correlation ID enrichment
    - Call UseSerilog() on host builder
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 7.3 Create CorrelationIdMiddleware
    - Generate correlation ID per request
    - Add to HttpContext.Items
    - Add to response headers
    - Push to Serilog LogContext
    - _Requirements: 6.6_
  
  - [ ] 7.4 Register CorrelationIdMiddleware in Program.cs
    - Add after MaintenanceModeMiddleware
    - Add before Authentication
    - _Requirements: 6.6_
  
  - [ ] 7.5 Update financial services to use audit logging
    - Add AuditType property to financial log entries
    - Update OrderService.CompleteAsync logging
    - Update OrderService.RefundAsync logging
    - Update CashRegisterService logging
    - _Requirements: 6.4_
  
  - [ ]* 7.6 Write property test for log entry format
    - **Property 6: Log Entry Format**
    - **Validates: Requirements 6.3, 6.6**
  
  - [ ]* 7.7 Write property test for database error logging
    - **Property 7: Database Error Logging**
    - **Validates: Requirements 6.7, 6.8**
  
  - [ ]* 7.8 Write unit tests for logging configuration
    - Test log files are created
    - Test rolling daily files
    - Test 30-day retention
    - Test financial audit logs separate
    - Test 90-day retention for audit logs
    - Test correlation IDs in logs
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8. Implement SQLite exception mapping
  - [ ] 8.1 Update ExceptionMiddleware with SQLite error handling
    - Add catch block for SqliteException
    - Map error code 5 (BUSY) to 503 with Arabic message
    - Map error code 6 (LOCKED) to 503 with Arabic message
    - Map error code 11 (CORRUPT) to 500 with Arabic message
    - Map error code 13 (FULL) to 507 with Arabic message
    - Add catch block for IOException
    - Map IOException to 507 with disk error message
    - Include correlation ID in all error responses
    - Log full exception details with correlation ID
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ] 8.2 Add DbUpdateConcurrencyException handling
    - Return 409 with retry message
    - Log concurrency conflict
    - _Requirements: 7.6, 7.7_
  
  - [ ]* 8.3 Write property test for SQLite error mapping
    - **Property 5: SQLite Error Mapping**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**
  
  - [ ]* 8.4 Write unit tests for each error code
    - Test SQLITE_BUSY returns 503
    - Test SQLITE_LOCKED returns 503
    - Test SQLITE_CORRUPT returns 500
    - Test SQLITE_FULL returns 507
    - Test IOException returns 507
    - Test correlation ID in responses
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 9. Implement backup service
  - [ ] 9.1 Create IBackupService interface and DTOs
    - Define BackupResult, BackupInfo DTOs
    - Define IBackupService interface
    - _Requirements: 8.1_
  
  - [ ] 9.2 Implement BackupService
    - Create backups directory if not exists
    - Implement CreateBackupAsync method
    - Generate timestamped filename
    - Use SqliteConnection.BackupDatabase API
    - Run PRAGMA integrity_check on backup
    - Delete backup if integrity check fails
    - Return backup metadata (path, size, timestamp)
    - Log all backup operations
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.8, 8.9, 8.12_
  
  - [ ] 9.3 Implement DeleteOldBackupsAsync method
    - Keep last 14 daily backups
    - Skip pre-migration backups (retain indefinitely)
    - Delete older backups
    - Log deletions
    - _Requirements: 8.6, 8.7_
  
  - [ ] 9.4 Create BackupController
    - Add POST /api/admin/backup endpoint
    - Require Admin or SystemOwner role
    - Call BackupService.CreateBackupAsync
    - Return backup metadata
    - _Requirements: 8.10, 8.11_
  
  - [ ] 9.5 Register BackupService in DI
    - Register as scoped service
    - _Requirements: 8.1_
  
  - [ ]* 9.6 Write property test for backup filename format
    - **Property 8: Backup Filename Format**
    - **Validates: Requirements 8.5, 10.3**
  
  - [ ]* 9.7 Write property test for backup integrity verification
    - **Property 9: Backup Integrity Verification**
    - **Validates: Requirements 8.8, 8.9**
  
  - [ ]* 9.8 Write property test for backup response structure
    - **Property 10: Backup Response Structure**
    - **Validates: Requirements 8.11**
  
  - [ ]* 9.9 Write property test for backup operation logging
    - **Property 11: Backup Operation Logging**
    - **Validates: Requirements 8.12, 10.8**
  
  - [ ]* 9.10 Write unit tests for backup service
    - Test backup creates file
    - Test backup uses SQLite backup API
    - Test integrity check runs
    - Test corrupt backup deleted
    - Test backup metadata returned
    - Test old backups deleted
    - Test pre-migration backups retained
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6, 8.8, 8.9_

- [ ] 10. Implement daily backup scheduler
  - [ ] 10.1 Create DailyBackupBackgroundService
    - Inherit from BackgroundService
    - Calculate time until next 2 AM
    - Wait until 2 AM
    - Create backup with reason "daily-scheduled"
    - Log success/failure
    - Repeat daily
    - _Requirements: 8.3_
  
  - [ ] 10.2 Register DailyBackupBackgroundService in Program.cs
    - Add as hosted service
    - _Requirements: 8.3_
  
  - [ ]* 10.3 Write integration test for daily backup
    - Test backup service is called
    - Test backup created at scheduled time (mocked)
    - _Requirements: 8.3_

- [ ] 11. Implement restore service
  - [ ] 11.1 Create IRestoreService interface and DTOs
    - Define RestoreResult DTO
    - Define IRestoreService interface
    - _Requirements: 9.1_
  
  - [ ] 11.2 Implement RestoreService
    - Inject MaintenanceModeService
    - Implement RestoreFromBackupAsync method
    - Validate backup file exists
    - Run integrity check on backup
    - Enable maintenance mode
    - Clear connection pools
    - Create pre-restore backup
    - Replace database file
    - Disable maintenance mode on success
    - Keep maintenance mode on failure
    - Log all restore operations
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.9, 9.10, 9.11_
  
  - [ ] 11.3 Create RestoreController
    - Add POST /api/admin/restore endpoint
    - Require SystemOwner role only
    - Call RestoreService.RestoreFromBackupAsync
    - Return restore result
    - _Requirements: 9.1_
  
  - [ ] 11.4 Register RestoreService in DI
    - Register as scoped service
    - _Requirements: 9.1_
  
  - [ ]* 11.5 Write property test for restore validation
    - **Property 12: Restore Validation**
    - **Validates: Requirements 9.3, 9.4**
  
  - [ ]* 11.6 Write property test for restore operation logging
    - **Property 13: Restore Operation Logging**
    - **Validates: Requirements 9.11**
  
  - [ ]* 11.7 Write integration test for backup and restore
    - Test full backup and restore cycle
    - Test data integrity after restore
    - Test maintenance mode during restore
    - Test pre-restore backup created
    - _Requirements: 9.2, 9.3, 9.4, 9.7, 9.9_
  
  - [ ]* 11.8 Write unit tests for restore service
    - Test missing backup file rejected
    - Test corrupt backup rejected
    - Test maintenance mode enabled
    - Test pre-restore backup created
    - Test database file replaced
    - Test maintenance mode disabled on success
    - Test maintenance mode kept on failure
    - _Requirements: 9.3, 9.4, 9.5, 9.7, 9.9, 9.10_

- [ ] 12. Implement pre-migration automatic backup
  - [ ] 12.1 Add pre-migration backup logic to Program.cs
    - Check for pending migrations
    - If pending migrations exist, create backup with reason "pre-migration"
    - Log migration count and backup filename
    - Abort startup if backup fails
    - Proceed with MigrateAsync after backup succeeds
    - _Requirements: 10.1, 10.2, 10.6, 10.7, 10.8_
  
  - [ ]* 12.2 Write property test for pre-migration backup filename
    - **Property 14: Pre-Migration Backup Filename**
    - **Validates: Requirements 10.8**
  
  - [ ]* 12.3 Write integration test for pre-migration backup
    - Test backup created when migrations pending
    - Test backup skipped when no migrations
    - Test startup aborts if backup fails
    - Test pre-migration backups retained indefinitely
    - _Requirements: 10.1, 10.2, 10.5, 10.7_

- [ ] 13. Checkpoint - Phase 1 complete
  - Ensure all tests pass, ask the user if questions arise.


### Phase 2: Operational Fixes

- [ ] 14. Implement cart persistence
  - [ ] 14.1 Install redux-persist in frontend
    - Add redux-persist package
    - _Requirements: 11.1_
  
  - [ ] 14.2 Create cart persist configuration
    - Create persist config with scoped key format
    - Add TTL transform (24 hours)
    - Add scope validation transform (userId, tenantId, branchId)
    - Whitelist items and customerId fields
    - _Requirements: 11.2, 11.5, 11.6_
  
  - [ ] 14.3 Update Redux store configuration
    - Wrap cart reducer with persistReducer
    - Configure middleware to ignore persist actions
    - Create persistor
    - _Requirements: 11.1_
  
  - [ ] 14.4 Update cart slice to include price snapshots
    - Ensure addItem action captures current unit price
    - Store price snapshot in cart item
    - _Requirements: 11.6_
  
  - [ ] 14.5 Add cart restoration logic
    - Restore cart on app mount
    - Validate TTL
    - Validate scope (userId, tenantId, branchId)
    - Use persisted prices, not current prices
    - _Requirements: 11.3, 11.5, 11.7_
  
  - [ ] 14.6 Add cart cleanup after order completion
    - Clear cart from Redux
    - Clear cart from localStorage
    - _Requirements: 11.4_
  
  - [ ] 14.7 Add beforeunload warning
    - Add event listener when cart has items
    - Show Arabic warning message
    - Remove listener when cart is empty
    - _Requirements: 11.8, 11.9_
  
  - [ ]* 14.8 Write property test for cart storage key scoping
    - **Property 15: Cart Storage Key Scoping**
    - **Validates: Requirements 11.2**
  
  - [ ]* 14.9 Write property test for cart round-trip with price snapshots
    - **Property 16: Cart Round-Trip with Price Snapshots**
    - **Validates: Requirements 11.3, 11.6, 11.7**
  
  - [ ]* 14.10 Write property test for cart price snapshot preservation
    - **Property 17: Cart Price Snapshot Preservation**
    - **Validates: Requirements 11.6, 11.7**
  
  - [ ]* 14.11 Write E2E test for cart persistence
    - Test cart survives browser refresh
    - Test cart cleared after order completion
    - Test beforeunload warning shown
    - Test beforeunload warning cleared
    - Test expired cart not restored
    - Test wrong user cart not restored
    - _Requirements: 11.1, 11.3, 11.4, 11.5, 11.8, 11.9_

- [ ] 15. Fix auto-close shift cash register bug
  - [ ] 15.1 Update AutoCloseShiftBackgroundService
    - Inject ICashRegisterService
    - After calculating closing balance, call RecordTransactionAsync
    - Create transaction with type ShiftClose
    - Set amount to closing balance
    - Link transaction to shift via ShiftId
    - Set description to "إغلاق تلقائي للوردية"
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 15.2 Write property test for auto-close cash register consistency
    - **Property 18: Auto-Close Cash Register Consistency**
    - **Validates: Requirements 12.5**
  
  - [ ]* 15.3 Write integration test for auto-close fix
    - Test shift auto-close creates cash register transaction
    - Test transaction type is ShiftClose
    - Test transaction amount matches closing balance
    - Test transaction linked to shift
    - Test cash register balance matches shift closing balance
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 16. Checkpoint - Phase 2 complete
  - Ensure all tests pass, ask the user if questions arise.

### Final Integration and Validation

- [ ] 17. Run all migrations
  - [ ] 17.1 Generate AddSecurityStamp migration
    - Run dotnet ef migrations add AddSecurityStamp
    - Verify migration file created
    - _Requirements: 3.1_
  
  - [ ] 17.2 Test migration on clean database
    - Apply migration to test database
    - Verify SecurityStamp column exists
    - Verify existing users have stamps
    - _Requirements: 3.1_

- [ ] 18. Integration testing
  - [ ]* 18.1 Run complete security validation suite
    - Test branch tampering blocked
    - Test role escalation blocked
    - Test token invalidation works
    - Test maintenance mode blocks requests
    - _Requirements: 1.1, 1.2, 2.1, 3.6, 3.7, 4.2_
  
  - [ ]* 18.2 Run complete backup/restore suite
    - Test manual backup
    - Test daily backup scheduler
    - Test pre-migration backup
    - Test restore with maintenance mode
    - Test backup integrity checks
    - _Requirements: 8.1, 8.3, 9.1, 10.1_
  
  - [ ]* 18.3 Run SQLite configuration validation
    - Verify WAL mode active
    - Verify busy_timeout set
    - Verify foreign_keys enabled
    - Test concurrent operations don't fail
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ]* 18.4 Run logging validation
    - Verify log files created
    - Verify financial audit logs separate
    - Verify correlation IDs present
    - Verify retention policies work
    - _Requirements: 6.1, 6.4, 6.6_
  
  - [ ]* 18.5 Run cart persistence validation
    - Test cart survives refresh
    - Test price snapshots preserved
    - Test TTL expiration
    - Test scope validation
    - _Requirements: 11.1, 11.3, 11.5, 11.6_

- [ ] 19. Failure scenario simulations
  - [ ]* 19.1 Simulate power loss during order completion
    - Verify transaction atomicity
    - Verify cart lost but order safe
    - _Requirements: All Phase 1_
  
  - [ ]* 19.2 Simulate SQLite BUSY error
    - Verify 503 response with Arabic message
    - Verify retry guidance
    - _Requirements: 7.1, 7.6_
  
  - [ ]* 19.3 Simulate disk full
    - Verify 507 response with Arabic message
    - Verify critical log entry
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 19.4 Simulate backup corruption
    - Verify corrupt backup deleted
    - Verify error logged
    - _Requirements: 8.9_
  
  - [ ]* 19.5 Simulate restore failure
    - Verify maintenance mode stays enabled
    - Verify error logged
    - _Requirements: 9.10_
  
  - [ ]* 19.6 Simulate branch tampering attempt
    - Verify 403 response
    - Verify violation logged
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 19.7 Simulate role escalation attempt
    - Verify rejection
    - Verify attempt logged
    - _Requirements: 2.1, 2.5_
  
  - [ ]* 19.8 Simulate token with stale stamp
    - Verify 401 response
    - Verify TOKEN_INVALIDATED error
    - _Requirements: 3.6, 3.7_

- [ ] 20. Final checkpoint - All phases complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- Failure simulations validate production readiness
