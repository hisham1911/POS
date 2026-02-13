using Microsoft.Data.Sqlite;
using System;

var connectionString = "Data Source=kasserpro.db;Cache=Shared";
using var connection = new SqliteConnection(connectionString);
connection.Open();

// Get Admin's password hash (we know it works)
var getHashCmd = connection.CreateCommand();
getHashCmd.CommandText = "SELECT PasswordHash FROM Users WHERE Email = 'admin@kasserpro.com'";
var adminHash = getHashCmd.ExecuteScalar()?.ToString();

if (string.IsNullOrEmpty(adminHash))
{
    Console.WriteLine("Error: Could not find admin user");
    return;
}

Console.WriteLine($"Admin hash found: {adminHash.Substring(0, 20)}...");

// Update SystemOwner user with same hash (so password will be Admin@123)
var updateCmd = connection.CreateCommand();
updateCmd.CommandText = "UPDATE Users SET PasswordHash = @hash WHERE Email = 'owner@kasserpro.com'";
updateCmd.Parameters.AddWithValue("@hash", adminHash);
var rows = updateCmd.ExecuteNonQuery();

Console.WriteLine($"Updated {rows} user(s)");

// Verify
var verifyCmd = connection.CreateCommand();
verifyCmd.CommandText = "SELECT Id, Name, Email, Role FROM Users WHERE Email = 'owner@kasserpro.com'";
using var reader = verifyCmd.ExecuteReader();
if (reader.Read())
{
    Console.WriteLine($"SystemOwner user: {reader["Name"]}, Email: {reader["Email"]}, Role: {reader["Role"]}");
    Console.WriteLine("Password is now: Admin@123");
}
else
{
    Console.WriteLine("SystemOwner user not found!");
}
