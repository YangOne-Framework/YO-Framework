// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Storage
{
    /// <summary>
    /// Defines configuration options for file storage.
    /// </summary>
    public interface IFileOptions
    {
        string Path { get; set; }

        FileType[] AllowedTypes { get; set; }

    }
}
