using System.Net.NetworkInformation;
using System.Security.Cryptography;
using System.Text;

namespace KasserPro.API;

/// <summary>
/// License validation service - binds the application to the machine it's installed on.
/// Prevents copying the database + app to another machine.
/// </summary>
public static class LicenseService
{
    private const string LicenseFileName = "license.key";
    // 32-char key - change this before distributing!
    private static readonly byte[] EncKey = Encoding.UTF8.GetBytes("KPro@2026#License!!SecureBinding");

    /// <summary>
    /// On first run: creates a license.key binding to this machine's MAC address.
    /// On subsequent runs: verifies the MAC address matches.
    /// Throws InvalidOperationException if license is invalid (wrong machine).
    /// </summary>
    public static void ValidateOrCreateLicense(string appDirectory)
    {
        var licenseFile = Path.Combine(appDirectory, LicenseFileName);
        var currentMac = GetPrimaryMacAddress();

        // If we can't get a MAC address (unusual), skip validation
        if (string.IsNullOrEmpty(currentMac))
        {
            Console.WriteLine("[LICENSE] Warning: Could not determine MAC address - skipping license check");
            return;
        }

        if (!File.Exists(licenseFile))
        {
            // First install on this machine - bind license to MAC
            var encrypted = Encrypt(currentMac);
            File.WriteAllText(licenseFile, encrypted);
            Console.WriteLine($"[LICENSE] License created for machine: {currentMac[..6]}...");
            return;
        }

        // Verify license
        try
        {
            var storedData = File.ReadAllText(licenseFile).Trim();
            var storedMac = Decrypt(storedData);

            if (!string.Equals(storedMac, currentMac, StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine($"[LICENSE] FATAL: MAC mismatch - Stored:{storedMac[..Math.Min(6, storedMac.Length)]} Current:{currentMac[..Math.Min(6, currentMac.Length)]}");

                throw new InvalidOperationException(
                    "ACTIVATION ERROR: This software is licensed to a different machine. " +
                    "Contact your vendor to transfer the license. " +
                    $"[Machine ID mismatch]");
            }

            Console.WriteLine("[LICENSE] License valid for this machine");
        }
        catch (InvalidOperationException)
        {
            throw; // Re-throw license violation
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LICENSE] License file corrupted - regenerating: {ex.Message}");
            // Corrupted license file - regenerate for this machine
            File.Delete(licenseFile);
            var encrypted = Encrypt(currentMac);
            File.WriteAllText(licenseFile, encrypted);
        }
    }

    /// <summary>
    /// Gets the physical MAC address of the primary active network interface.
    /// Excludes virtual adapters, loopback, and disconnected interfaces.
    /// </summary>
    private static string GetPrimaryMacAddress()
    {
        try
        {
            return NetworkInterface.GetAllNetworkInterfaces()
                .Where(nic =>
                    nic.NetworkInterfaceType != NetworkInterfaceType.Loopback &&
                    nic.NetworkInterfaceType != NetworkInterfaceType.Tunnel &&
                    nic.OperationalStatus == OperationalStatus.Up &&
                    !nic.Description.Contains("Virtual", StringComparison.OrdinalIgnoreCase) &&
                    !nic.Description.Contains("Hyper-V", StringComparison.OrdinalIgnoreCase) &&
                    !nic.Description.Contains("VMware", StringComparison.OrdinalIgnoreCase) &&
                    !nic.Description.Contains("VPN", StringComparison.OrdinalIgnoreCase) &&
                    nic.GetPhysicalAddress().GetAddressBytes().Length == 6)
                .OrderBy(nic => nic.NetworkInterfaceType == NetworkInterfaceType.Ethernet ? 0 : 1) // Prefer Ethernet
                .Select(nic => nic.GetPhysicalAddress().ToString())
                .FirstOrDefault() ?? string.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Could not get MAC address: {ex.Message}");
            return string.Empty;
        }
    }

    private static string Encrypt(string text)
    {
        using var aes = Aes.Create();
        aes.Key = EncKey;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var textBytes = Encoding.UTF8.GetBytes(text);
        var encrypted = encryptor.TransformFinalBlock(textBytes, 0, textBytes.Length);

        var result = new byte[aes.IV.Length + encrypted.Length];
        aes.IV.CopyTo(result, 0);
        encrypted.CopyTo(result, aes.IV.Length);
        return Convert.ToBase64String(result);
    }

    private static string Decrypt(string base64)
    {
        var data = Convert.FromBase64String(base64);
        var iv = data[..16];
        var cipherText = data[16..];

        using var aes = Aes.Create();
        aes.Key = EncKey;
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor();
        var decrypted = decryptor.TransformFinalBlock(cipherText, 0, cipherText.Length);
        return Encoding.UTF8.GetString(decrypted);
    }
}
