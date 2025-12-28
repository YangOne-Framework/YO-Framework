using System.Collections.Generic;
using System.Reflection;
using YangOne.Web.Module;

namespace YangOne.BlogEngine
{
    public class BlogModule : IModule
    {
        public string Name { get; set; } = "BlogEngine";
        public string Version { get; set; } = "1.0.0.0";
        public List<string> SupportedVersions { get; set; } = new List<string>() { "1.0.0" };
        public string Author { get; set; } = "Binod Tamang";
        public Assembly Assembly { get; set; } = typeof(BlogModule).GetTypeInfo().Assembly;
        public bool IsInstalled { get; set; } = false;
        public bool RequireSettingComponent { get; set; } = false;
        public string ModuleSettingComponent { get; set; } = "";
    }
}