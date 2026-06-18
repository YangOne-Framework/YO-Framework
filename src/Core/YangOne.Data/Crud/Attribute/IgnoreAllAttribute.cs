// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Data.Crud.Attribute
{
    [AttributeUsage(AttributeTargets.Property)]
    /// <summary>
    /// Specifies that a property should be ignored by all CRUD operations (insert, update, select).
    /// </summary>
    public class IgnoreAllAttribute : System.Attribute
    {
    }
}
