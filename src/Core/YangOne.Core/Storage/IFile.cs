// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.IO;

namespace YangOne.Storage
{
    public interface IFile
    {
        string ContentType { get; set; }
        Stream Stream { get; set; }
    }
}
