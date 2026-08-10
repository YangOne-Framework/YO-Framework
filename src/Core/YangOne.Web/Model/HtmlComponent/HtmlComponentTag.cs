using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;

[Table("HtmlComponentTag")]
public class HtmlComponentTag
{
    [Key]
    public int HtmlComponentTagId { get; set; }
    public string Name { get; set; }
    public string NormalizedName { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }
}

[Table("HtmlComponentTagMap")]
public class HtmlComponentTagMap
{
    public int HtmlComponentId { get; set; }
    public int HtmlComponentTagId { get; set; }
}
