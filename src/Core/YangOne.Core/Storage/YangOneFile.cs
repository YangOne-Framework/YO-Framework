// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Storage;

/// <summary>
/// Represents a file with content type and stream data for transfer.
/// </summary>
public class YangOneFile: IFile
{
    public string ContentType { get; set; }
    public Stream Stream { get; set; }
}
