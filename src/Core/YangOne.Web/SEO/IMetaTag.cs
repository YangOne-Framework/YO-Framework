// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Concurrent;
namespace YangOne.Web
{
    /// <summary>
    /// Defines a component that generates HTML meta tag content.
    /// </summary>
    public interface IMetaTag
    {
        ConcurrentDictionary<string, string> MetaKeyValues { get; set; }

        string Generate();

    }
}
