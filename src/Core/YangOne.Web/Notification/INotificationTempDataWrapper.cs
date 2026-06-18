// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Notification
{
    /// <summary>
    /// Wraps access to TempData for storing and retrieving notification messages.
    /// </summary>
    public interface INotificationTempDataWrapper
    {
        T Get<T>(string key);
        T Peek<T>(string key);
        void Add(string key, object value);
    }
}
