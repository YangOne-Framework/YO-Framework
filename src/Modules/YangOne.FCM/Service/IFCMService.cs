// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

namespace YangOne.FCM
{
    /// <summary>
    /// Represents a interface IFCMService.
    /// </summary>
    public interface IFCMService
    {
        Task FcmSendAsync(string token, string title, string message, string click_Url, string image_Uri, string key1, string key2,string key3);
    }
}

