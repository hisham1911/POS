using Microsoft.Data.Sqlite;
using System;

namespace UpdateOwnerPassword;

internal static class ListUsers
{
    public static void PrintAll(string connectionString)
    {
        using var connection = new SqliteConnection(connectionString);
        connection.Open();

        var cmd = connection.CreateCommand();
        cmd.CommandText = "SELECT Id, Name, Email, Role FROM Users";
        using var reader = cmd.ExecuteReader();

        Console.WriteLine("All users in database:");
        while (reader.Read())
        {
            Console.WriteLine($"ID: {reader["Id"]}, Name: {reader["Name"]}, Email: {reader["Email"]}, Role: {reader["Role"]}");
        }
    }
}
