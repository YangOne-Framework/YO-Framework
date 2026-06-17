// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Data.Crud.Attribute
{
    [AttributeUsage(AttributeTargets.Property)]
    public class DependentAttribute : System.Attribute
    {
        public string Get { get; set; }
        public Type Model { get; set; }
        public string Condition { get; set; }
    }
}
