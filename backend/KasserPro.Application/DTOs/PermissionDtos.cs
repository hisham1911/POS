namespace KasserPro.Application.DTOs;

public class UserPermissionsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}

public class UpdatePermissionsRequest
{
    public List<string> Permissions { get; set; } = new();
}

public class PermissionInfoDto
{
    public string Key { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string GroupAr { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
