// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Storage
{
    /// <summary>
    /// Represents a file type with its content type and file extension.
    /// </summary>
    public struct FileType
    {
        public string ContentType { get; set; }

        public string FileExtension { get; set; }
    }
}
