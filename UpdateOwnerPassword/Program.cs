using Microsoft.Data.Sqlite;
using System;
using System.IO;

static string ResolveDbPath()
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);
    while (dir != null)
    {
        var candidate = Path.Combine(dir.FullName, "src", "KasserPro.API", "kasserpro.db");
        if (File.Exists(candidate))
            return candidate;

        dir = dir.Parent;
    }

    throw new FileNotFoundException("Could not locate src/KasserPro.API/kasserpro.db from current execution directory.");
}

var dbPath = ResolveDbPath();
var connectionString = $"Data Source={dbPath};Cache=Shared";
using var connection = new SqliteConnection(connectionString);
connection.Open();

// Get Admin's password hash
var getHashCmd = connection.CreateCommand();
getHashCmd.CommandText = "SELECT PasswordHash FROM Users WHERE Email = 'admin@kasserpro.com'";
var adminHash = getHashCmd.ExecuteScalar()?.ToString();

if (string.IsNullOrEmpty(adminHash))
{
    Console.WriteLine("Error: Could not find admin user");
    return;
}

Console.WriteLine($"Admin hash found: {adminHash.Substring(0, 20)}...");

// Update SystemOwner user
var updateCmd = connection.CreateCommand();
updateCmd.CommandText = "UPDATE Users SET PasswordHash = @hash WHERE Email = 'owner@kasserpro.com'";
updateCmd.Parameters.AddWithValue("@hash", adminHash);
var rows = updateCmd.ExecuteNonQuery();

if (rows == 0)
{
    var insertCmd = connection.CreateCommand();
    insertCmd.CommandText = @"
INSERT INTO Users
    (TenantId, BranchId, Name, Email, PasswordHash, Role, IsActive, Phone, PinCode, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (NULL, NULL, @name, @email, @hash, @role, @isActive, NULL, NULL, @createdAt, NULL, 0);";

    insertCmd.Parameters.AddWithValue("@name", "System Owner");
    insertCmd.Parameters.AddWithValue("@email", "owner@kasserpro.com");
    insertCmd.Parameters.AddWithValue("@hash", adminHash);
    insertCmd.Parameters.AddWithValue("@role", 2);
    insertCmd.Parameters.AddWithValue("@isActive", 1);
    insertCmd.Parameters.AddWithValue("@createdAt", DateTime.UtcNow);

    rows = insertCmd.ExecuteNonQuery();
}

Console.WriteLine($"Updated {rows} user(s)");
Console.WriteLine("\nSystemOwner credentials:");
Console.WriteLine("Email: owner@kasserpro.com");
Console.WriteLine("Password: Admin@123");
