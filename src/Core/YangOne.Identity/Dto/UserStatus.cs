namespace YangOne.Identity.Dto;

public class UserStatus
{
    public bool HasError { get; set; }
    public string Message { get; set; }
    public long IdentityUserId { get; set; }
}