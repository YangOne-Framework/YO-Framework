using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web
{
    public class BaseProps
    {
        public bool IsActive { get; set; }
        [AutoFill(false)]
        [JsonIgnore]
        public bool IsDeleted { get; set; }
        [JsonIgnore]
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreUpdate]
        public DateTime AddedOn { get; set; }
        [JsonIgnore]

        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreUpdate]
        public long AddedBy { get; set; }
        [JsonIgnore]

        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreUpdate]
        public long DeletedBy { get; set; }
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreInsert]
        [JsonIgnore]
        public DateTime UpdatedOn { get; set; }
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreInsert]
        [JsonIgnore]
        public DateTime DeletedOn { get; set; }

        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreInsert]
        [JsonIgnore]
        public long UpdatedBy { get; set; }

        [IgnoreAll]
        public int RowTotal { get; set; }
    }

}
