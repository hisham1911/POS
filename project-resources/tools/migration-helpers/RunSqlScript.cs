using Microsoft.Data.Sqlite;
using System;
using System.IO;

var script = File.ReadAllText("fix-branch-inventory-after-seeding.sql");
using var conn = new SqliteConnection("Data Source=kasserpro.db");
conn.Open();

// Split by semicolon and execute each statement
var statements = script.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
foreach (var statement in statements)
{
    var trimmed = statement.Trim();
    if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("--"))
        continue;
        
    using var cmd = conn.CreateCommand();
    cmd.CommandText = trimmed;
    
    if (trimmed.ToUpper().StartsWith("SELECT"))
    {
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            Console.WriteLine($"{reader[0]}: {reader[1]}");
        }
    }
    else
    {
        var affected = cmd.ExecuteNonQuery();
        Console.WriteLine($"Rows affected: {affected}");
    }
}

conn.Close();
Console.WriteLine("Done!");
