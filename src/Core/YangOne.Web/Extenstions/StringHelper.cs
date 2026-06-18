// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Extensions
{
    /// <summary>
    /// Specifies which words to apply title case to.
    /// </summary>
    public enum TitleCase
    {
        First,
        All
    }
    /// <summary>
    /// Extension methods for string manipulation.
    /// </summary>
    public static class StringHelper
    {
        public static string Ellipsis(this string content, int length)
        {
            if (content.Length <= length) return content;
            int pos = content.IndexOf(" ", length);
            if (pos >= 0)
                return content.Substring(0, pos) + "...";
            return content;
        }
    }
}
