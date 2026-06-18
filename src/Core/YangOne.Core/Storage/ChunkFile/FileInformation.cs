// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Storage
{
    /// <summary>
    /// Contains metadata about a file being uploaded in chunks.
    /// </summary>
    public class FileInformation
    {
        public virtual ISet<int> AlreadyPersistedChunks { get; private set; } = new HashSet<int>();

        public long FileSize { get; set; }

        public string FileName { get; set; }

        public int ChunkSize { get; set; }

        public FileInformation(long fileSize, String fileName, int chunkSize)
        {
            this.FileSize = fileSize;
            this.FileName = fileName;
            this.ChunkSize = chunkSize;
        }

        public virtual int TotalNumberOfChunks
        {
            get
            {
                return (int)Math.Ceiling(FileSize / (ChunkSize * 1F));
            }
        }

        public virtual void MarkChunkAsPersisted(int chunkNumber)
        {
            AlreadyPersistedChunks.Add(chunkNumber);
        }
    }
}
