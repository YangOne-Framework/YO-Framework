using YangOne.Caching;
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service;

public class RestrictionService : IRestrictionService
{
    private const string AdminIPAccessCacheKey = "YO.AdminIPAccess";
    private readonly ICacheService _cacheService;

    public RestrictionService(ICacheService cacheService)
    {
        _cacheService = cacheService;
    }

    public CrudService<RestrictionKey> KeyCrudService { get; set; } = new CrudService<RestrictionKey>();
    public CrudService<Restriction> RestrictionCrudService { get; set; } = new CrudService<Restriction>();

    public CrudService<AdministrativeIPAccess> AdminIPAccessCrudService { get; set; } =
        new CrudService<AdministrativeIPAccess>();

    public async Task<IEnumerable<AdministrativeIPAccess>> GetCachedAdminIPAccessListAsync()
    {
        return await _cacheService.GetAsync(AdminIPAccessCacheKey, async () =>
        {
            return await AdminIPAccessCrudService.GetListAsync(
                "Where IsDeleted=@IsDeleted and IsActive=@IsActive",
                new { IsDeleted = false, IsActive = true });
        });
    }

    public void InvalidateAdminIPAccessCache()
    {
        _cacheService.Remove(AdminIPAccessCacheKey);
    }
}