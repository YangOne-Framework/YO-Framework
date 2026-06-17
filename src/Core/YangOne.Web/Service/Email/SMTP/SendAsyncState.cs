// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    public class SendAsyncState
    {

        /// <summary>
        /// Contains all info that you need while handling message result
        /// </summary>
        public Email EmailInfo { get; private set; }


        public SendAsyncState(Email emailInfo)
        {
            EmailInfo = emailInfo;
        }
    }
}

