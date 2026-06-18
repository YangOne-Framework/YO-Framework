// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Storage
{
    [Serializable]
    /// <summary>
    /// Response model containing the status of a chunked file upload session.
    /// </summary>
    public class UploadStatusResponse
    {
        public static UploadStatusResponse fromSession(FileSession session)
        {
            return new UploadStatusResponse
            {
                ChunkSize = session.FileInfo.ChunkSize,
                FileName = session.FileInfo.FileName,
                TotalNumberOfChunks = session.FileInfo.TotalNumberOfChunks,

                Concluded = session.IsConcluded,
                CreatedDate = session.CreatedDate.ToString(),
                Expired = session.IsExpired,

                LastUpdate = session.LastUpdate.ToString(),
                Progress = session.Progress,
                SuccessfulChunks = session.SuccessfulChunks,

                User = session.User,
                Id = session.Id,
                Status = session.Status
            };
        }

        public static List<UploadStatusResponse> fromSessionList(List<FileSession> sessions)
        {
            return sessions.Select(session => fromSession(session)).ToList();
        }

        public int ChunkSize { get; set; }

        public Boolean Concluded { get; set; }

        public String CreatedDate { get; set; }

        public Boolean Expired { get; set; }

        public String FileName { get; set; }

        public String Id { get; set; }

        public String LastUpdate { get; set; }
        public Double Progress { get; set; }
        public String Status { get; set; }
        public int SuccessfulChunks { get; set; }
        public int TotalNumberOfChunks { get; set; }
        public long User { get; set; }
    }
}
