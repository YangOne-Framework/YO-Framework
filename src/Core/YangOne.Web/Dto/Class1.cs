using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YangOne.Web.Dto
{
    internal class Class1
    {
    }
    public class HtmlComponentSaveRequest
    {
        public int HtmlComponentId { get; set; }

        [Required(ErrorMessage = "HtmlComponent.Name.Required")]
        public string Name { get; set; }

        [Required(ErrorMessage = "HtmlComponent.DisplayName.Required")]
        public string DisplayName { get; set; }

        public string ShortDescription { get; set; }
        public string Icon { get; set; }
        public string PreviewImage { get; set; }
        public string Config { get; set; }
        public string ContentStructure { get; set; }
        public string HtmlTemplate { get; set; }
        public string StateSchema { get; set; }
        public string ApiBindings { get; set; }
        public string EventBindings { get; set; }
        public string RuntimeOptions { get; set; }
        public string Version { get; set; }
        public bool IsActive { get; set; }
    }
    public class HtmlComponentItemDto
    {
        public int HtmlComponentId { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string ShortDescription { get; set; }
        public string Icon { get; set; }
        public string PreviewImage { get; set; }
        public bool IsActive { get; set; }
    }

    public class HtmlComponentDetailDto : HtmlComponentItemDto
    {
        public string Config { get; set; }
        public string ContentStructure { get; set; }
        public string HtmlTemplate { get; set; }
        public string StateSchema { get; set; }
        public string ApiBindings { get; set; }
        public string EventBindings { get; set; }
        public string RuntimeOptions { get; set; }
        public string Version { get; set; }
    }
}
