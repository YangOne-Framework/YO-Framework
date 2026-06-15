using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    public interface IRestrictionService
    {
        CrudService<RestrictionKey> KeyCrudService { get; set; }
        CrudService<Restriction> RestrictionCrudService { get; set; }
        CrudService<AdministrativeIPAccess> AdminIPAccessCrudService { get; set; }
        Task<IEnumerable<AdministrativeIPAccess>> GetCachedAdminIPAccessListAsync();
        void InvalidateAdminIPAccessCache();
    }
}
