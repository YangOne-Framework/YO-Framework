// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc.Rendering;
namespace YangOne.Utility
{
    /// <summary>
    /// Provides conversion utility methods.
    /// </summary>
    public static class Converter
    {
        public static IEnumerable<SelectListItem> EnumSelectListConverter<T>()
        {
            return (Enum.GetValues(typeof(T)).Cast<int>().Select(
                enu => new SelectListItem() { Text = Enum.GetName(typeof(T), enu), Value = enu.ToString() })).ToList();
        }
    }
}

