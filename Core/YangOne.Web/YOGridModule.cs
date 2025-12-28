using System.Reflection;
using YangOne.Web.Module;

namespace YangOne.Web
{
    public class YOGridModule : IModule
    {
        public string Name { get; set; } = "YOGrid";
        public string Version { get; set; } = "1.0.0.0";
        public List<string> SupportedVersions { get; set; } = new List<String>() {"beta", "1.0.0.0" };
        public string Author { get; set; } = "Binod Tamang";
        public Assembly Assembly { get; set; } = typeof(YOGridModule).GetTypeInfo().Assembly;
        public bool IsInstalled { get; set; } = true;
        public bool RequireSettingComponent { get; set; } = false;
        public string ModuleSettingComponent { get; set; }
    }
}