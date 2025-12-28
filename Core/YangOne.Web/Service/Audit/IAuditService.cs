using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    public interface IAuditService
    {
        CrudService<Audit> CrudService { get; set; }
    }
}
