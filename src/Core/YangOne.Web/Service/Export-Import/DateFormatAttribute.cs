// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    [AttributeUsage(AttributeTargets.Property)]
    public class DateFormatAttribute : Attribute
    {
        public string DateFormatter;
        public DateFormatAttribute(string dateFormatter)
        {
            DateFormatter = dateFormatter;
        }
    }
}
