using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using YangOne.Data.Crud.Attribute;
using YangOne.Identity.Model;

namespace YangOne.Identity.Dto;

public class NewUser : AppUser
{
    [Required]
    public string Password { get; set; }

    public List<UserRolesSelected> UserRoles { get; set; }
    [IgnoreAll]
    public IFormFile ImageFile { get; set; }

    [IgnoreAll]
    public string ImportMessage { get; set; }

}
public class UserRolesSelected
{
    public long RoleId { get; set; }
    public string Name { get; set; }
    public bool IsSelected { get; set; }
}
