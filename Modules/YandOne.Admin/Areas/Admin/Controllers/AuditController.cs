using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.Data.Crud.Attribute;
using YangOne.Web;
using YangOne.Web.Security;
using YangOne.Web.Services;

namespace YandOne.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class AuditController : BaseController
    {
        private readonly IAuditService _auditService;
        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }
        [Route("admin/audit/page/{pageNo?}")]
        [Route("admin/audit")]
        [FriendlyName("Audit List")]
        public async Task<IActionResult> Index([FromRoute]int pageNo = 1, [FromQuery]string query = "")
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            //customized viewmodel with join
            var model = await _auditService.CrudService.GetListPagedAsync(pageNo, rowsPerPage,1, "Where Action like @Query", "AddedOn desc", new { Query = "%" + query + "%" });
            return View(model);
        }
    }
}