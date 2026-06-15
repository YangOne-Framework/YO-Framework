using System.Security.Claims;
using YangOne.Data;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;

namespace YangOne.Identity.Service
{
    public interface IAppUserService
    {
        CrudService<AppUser> AppUserCrudService { get; set; }
        CrudService<UserType> UserTypeCrudService { get; set; }
        Task<UserStatus> SaveNewUserAsync(NewUser model);
        Task<UserStatus> UpdateUserAsync(EditUser model);
        Task<bool> DeleteUserAsync(int appUserId);
        Task<bool> AssignRolesAsync(UserRoles roles);
        Task<EditUser> GetAsync(int appuserId);
        Task<bool> UpdateProfilePicture(long appUserId, string imagePath);
        Task<bool> UpdateUserDeviceId(long appUserId, string deviceId);

        Task<int> GetNewUserStatusAsync(int showRecords);
        Task<UserStatus> AddExternalUser(string provider, string userId, List<Claim> claims);
        Task<string> GetUserEmailById(long customerId);
        Task<bool> ChangeEmailAsync(long userId, string email);
        Task<bool> ChangePhoneNumberAsync(long userId, string phoneNumber);
        Task<bool> CheckEmailExists(string email);
        Task<IEnumerable<AppUser>> GetUsersByRoles(string role, int pageNo, int limit, string query);
        Task<bool> CheckPhoneNumberExists(string phoneNumber);
        Task<IEnumerable<BasicUserDetails>> GetUserByRole(string search, int roleId);
        Task<bool> UpdateAsVerifiedPhoneNumberAsync(long userId);

        Task<IEnumerable<AppUser>> GetAllUsers(int offset, int limit, string search, string email, string phone,
            string roleIds);
    }
}