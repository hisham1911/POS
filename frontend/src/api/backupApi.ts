import { baseApi } from "./baseApi";

export interface BackupInfo {
  fileName: string;
  fullPath: string;
  sizeBytes: number;
  createdAt: string;
  reason: string;
  isPreMigration: boolean;
}

export interface BackupResult {
  success: boolean;
  fileName?: string;
  fullPath?: string;
  sizeBytes?: number;
  createdAt?: string;
  reason?: string;
  errorMessage?: string;
}

export interface RestoreRequest {
  backupFileName: string;
}

export interface RestoreResult {
  success: boolean;
  restoredFromPath?: string;
  preRestoreBackupPath?: string;
  restoreTimestamp: string;
  maintenanceModeEnabled: boolean;
  errorMessage?: string;
  requiresRestart: boolean;
  migrationsApplied: number;
  dataValidationIssuesFound: number;
}

const backupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create manual backup
    createBackup: builder.mutation<BackupResult, void>({
      query: () => ({
        url: "/api/admin/backup",
        method: "POST",
      }),
      invalidatesTags: ["Backup"],
    }),

    // List all backups
    listBackups: builder.query<BackupInfo[], void>({
      query: () => ({
        url: "/api/admin/backups",
        method: "GET",
      }),
      providesTags: ["Backup"],
    }),

    // Restore from backup
    restoreBackup: builder.mutation<RestoreResult, RestoreRequest>({
      query: (request) => ({
        url: "/api/admin/restore",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Backup"],
    }),
  }),
});

export const {
  useCreateBackupMutation,
  useListBackupsQuery,
  useRestoreBackupMutation,
} = backupApi;
