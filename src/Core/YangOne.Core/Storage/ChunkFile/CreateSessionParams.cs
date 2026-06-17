// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.ComponentModel.DataAnnotations;

namespace YangOne.Storage
{
    /// <summary>
    /// Session creation params
    /// </summary>
    [Serializable]
    public class CreateSessionParams
    {
        /// <summary>
        /// Size of data block (in bytes)
        /// </summary>
        [Required]
        public int? ChunkSize { get; set; }

        /// <summary>
        /// Total file size (in bytes)
        /// </summary>
        [Required]
        public long? TotalSize { get; set; }

        /// <summary>
        /// File name
        /// </summary>
        [Required]
        public string FileName { get; set; }
    }
}
