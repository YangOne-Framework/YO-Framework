// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Storage
{
    /// <summary>
    /// Status of a session creation
    /// </summary>
    [Serializable]
    public class SessionCreationStatusResponse
    {
        public SessionCreationStatusResponse() { }
        public static SessionCreationStatusResponse fromSession(FileSession session)
        {
            return new SessionCreationStatusResponse
            {

                SessionId = session.Id,
                UserId = session.User,
                FileName = session.FileInfo.FileName
            };
        }

        /// <summary>
        /// File name
        /// </summary>
        public String FileName { get; set; }

        /// <summary>
        /// Session id
        /// </summary>
        public String SessionId { get; set; }

        /// <summary>
        /// User id
        /// </summary>
        public long UserId { get; set; }
    }
}
