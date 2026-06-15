using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace YangOne.Web.Model;
[Table("TimeZone")]
public class Timezone
{
    [Key]
    public int Id { get; set; }
    public string Identifier { get; set; }
    public string StandardName { get; set; }
    public string DisplayName { get; set; }
    public string DaylightName { get; set; }
    public bool SupportsDaylightSavingTime { get; set; }
    public int BaseUtcOffsetSec { get; set; }
    public string UTC { get; set; }
}