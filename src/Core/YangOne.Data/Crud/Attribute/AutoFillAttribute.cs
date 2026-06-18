// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Data.Crud.Attribute
{
    [AttributeUsage(AttributeTargets.Property)]
    /// <summary>
    /// Specifies auto-fill behavior for a property during object initialization.
    /// </summary>
    public class AutoFillAttribute : System.Attribute
    {
        public object DefaultValue;
        public bool HasFixedValue = false;

        public AutoFillAttribute(object value)
        {
            DefaultValue = value;
            HasFixedValue = true;
        }

        public AutoFillProperty fillBy;
        public AutoFillAttribute(AutoFillProperty autofillby)
        {
            fillBy = autofillby;
        }
    }

    /// <summary>
    /// Defines the source of auto-fill values for <see cref="AutoFillAttribute"/>.
    /// </summary>
    public enum AutoFillProperty
    {
        CurrentDate, CurrentUser,
        CurrentCulture, CurrentUtcDate, CurrentUserId
    }
}
