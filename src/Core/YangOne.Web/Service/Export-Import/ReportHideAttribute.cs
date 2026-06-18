// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    [AttributeUsage(AttributeTargets.Property)]
    /// <summary>
    /// Indicates that a property should be hidden from export/import reports.
    /// </summary>
    public class ReportHideAttribute : Attribute
    {
        public ReportHideAttribute()
        {
            
        }
    }
}
