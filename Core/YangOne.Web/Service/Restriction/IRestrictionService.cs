using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    public interface IRestrictionService
    {
        CrudService<RestrictionKey> KeyCrudService { get; set; }
        CrudService<Restriction> RestrictionCrudService { get; set; }
        CrudService<AdministrativeIPAccess> AdminIPAccessCrudService { get; set; }
    }

    public class RestrictionService : IRestrictionService
    {
        public CrudService<RestrictionKey> KeyCrudService { get; set; } = new CrudService<RestrictionKey>();
        public CrudService<Restriction> RestrictionCrudService { get; set; } = new CrudService<Restriction>();

        public CrudService<AdministrativeIPAccess> AdminIPAccessCrudService { get; set; } =
            new CrudService<AdministrativeIPAccess>();
    }
}
