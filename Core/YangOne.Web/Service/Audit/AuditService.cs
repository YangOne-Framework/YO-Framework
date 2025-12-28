using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    public class AuditService : IAuditService
    {
        public CrudService<Audit> CrudService { get; set; }=new CrudService<Audit>();
    }
}