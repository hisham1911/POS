using System;
using Microsoft.Data.Sqlite;

var connectionString = "Data Source=kasserpro.db;Cache=Shared";
using var connection = new SqliteConnection(connectionString);
connection.Open();

var command = connection.CreateCommand();
command.CommandText = "UPDATE Users SET Role = 2 WHERE Email = 'admin@kasserpro.com'";
var rowsAffected = command.ExecuteNonQuery();

Console.WriteLine($"Updated {rowsAffected} user(s) to SystemOwner role");

// Verify
command.CommandText = "SELECT Id, Name, Email, Role FROM Users WHERE Email = 'admin@kasserpro.com'";
using var reader = command.ExecuteReader();
while (reader.Read())
{
    Console.WriteLine($"User: {reader["Name"]}, Email: {reader["Email"]}, Role: {reader["Role"]}");
}
