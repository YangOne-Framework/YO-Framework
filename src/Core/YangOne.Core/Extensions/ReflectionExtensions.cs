// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace YangOne.Extensions
{
    public static class ReflectionExtensions
    {
        public static IEnumerable<string> GetPublicPropertiesNames(this Type type, Func<PropertyInfo, bool> filterBy = null)
        {
            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(x => x.CanWrite && x.CanRead)
                .AsEnumerable();

            if (filterBy != null)
                properties = properties.Where(filterBy);

            return properties.Select(x => x.Name);
        }
    }
}
