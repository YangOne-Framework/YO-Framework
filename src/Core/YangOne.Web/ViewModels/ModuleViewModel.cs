using YangOne.Data.Crud.Attribute;
using YangOne.Identity.Model;
using YangOne.Web.Module;

namespace YangOne.Web.ViewModels
{
    public class ModuleViewModel
    {
        public string ModuleName { get; set; }
        public bool HasSetting { get; set; }
        public List<ModuleComponentDescription> ModuleComponents { get; set; }=new List<ModuleComponentDescription>();
    }

    public class RoleEditViewModel : IdentityRole
    {
        [IgnoreAll]
        public string OldName { get; set; }
    }



}