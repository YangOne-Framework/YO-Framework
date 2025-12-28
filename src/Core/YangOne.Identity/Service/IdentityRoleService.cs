using System.Data;
using System.Data.Common;
using Dapper;
using YangOne.Data;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;

namespace YangOne.Identity.Service
{
    public class IdentityRoleService : IIdentityRoleService
    {
        public CrudService<IdentityRole> RoleService { get; set; } = new CrudService<IdentityRole>();
        public async Task<IEnumerable<IdentityRole>> GetUserRolesAsync(long identityUserId)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryAsync<IdentityRole>("select r.* from [dbo].[IdentityRole] as r inner join[dbo].[IdentityUserRole] as iur on iur.RoleId = r.Id "
                + " Where iur.UserId = @identityUserId",
                    new { identityUserId });
             
            }
        }

        public async Task<bool> CheckNameExist(string roleName)
        {
           var role= await this.RoleService.GetAsync("Where Name=@roleName", new {roleName});
            return role != null;
        }
        public async Task<List<int>> GetRoleIds(string[] roleNames)
        {
            var role = await this.RoleService.GetListAsync("Where Name in @roleNames", new { roleNames });
            return role.Select(x => x.Id).ToList();
        }
        public async Task<List<BasicUserDetails>> GetUserByRolesName(string search)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
             IEnumerable<BasicUserDetails> lstBasicUserDetails= await db.QueryAsync<BasicUserDetails>("[dbo].[usp_AppUser_GetByRolesName]",
                    new { Search = search },
                    commandType: CommandType.StoredProcedure);

                return lstBasicUserDetails.ToList();
            }
        }
    }


}