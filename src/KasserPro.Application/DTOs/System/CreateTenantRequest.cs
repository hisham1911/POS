namespace KasserPro.Application.DTOs.System;

public class CreateTenantRequest
{
    [global::System.ComponentModel.DataAnnotations.Required(ErrorMessage = "اسم الشركة مطلوب")]
    [global::System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 2, ErrorMessage = "اسم الشركة يجب أن يكون بين 2 و 100 حرف")]
    public string TenantName { get; set; } = string.Empty;

    [global::System.ComponentModel.DataAnnotations.Required(ErrorMessage = "البريد الإلكتروني للمدير مطلوب")]
    [global::System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
    public string AdminEmail { get; set; } = string.Empty;

    [global::System.ComponentModel.DataAnnotations.Required(ErrorMessage = "كلمة المرور مطلوبة")]
    [global::System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 8, ErrorMessage = "كلمة المرور يجب أن تكون بين 8 و 100 حرف")]
    [global::System.ComponentModel.DataAnnotations.RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,100}$", ErrorMessage = "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص")]
    public string AdminPassword { get; set; } = string.Empty;

    [global::System.ComponentModel.DataAnnotations.Required(ErrorMessage = "اسم الفرع مطلوب")]
    [global::System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 2, ErrorMessage = "اسم الفرع يجب أن يكون بين 2 و 100 حرف")]
    public string BranchName { get; set; } = string.Empty;
}
